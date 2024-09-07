from dotenv import load_dotenv
load_dotenv()
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
import os
import json

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create a Pinecone index
pc.create_index(
    name="fitness",
    dimension=1536,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
)

# Load the review data
data = json.load(open("fitness.json"))

processed_data = []
client = OpenAI()

# Create embeddings for each exercise
for exercise in data["fitness"]:
    response = client.embeddings.create(
        input=exercise['instructions'], model="text-embedding-3-small"
    )
    embedding = response.data[0].embedding
    processed_data.append(
        {
            "values": embedding,
            "id": exercise["exercise_name"],
            "metadata": {
                "type_of_activity": exercise["type_of_activity"],
                "type_of_equipment": exercise["type_of_equipment"],
                "body_part": exercise["body_part"],
                "type": exercise["type"],
                "muscle_groups_activated": exercise["muscle_groups_activated"],
                "instructions": exercise["instructions"]
            }
        }
    )

# Insert the embeddings into the Pinecone index
index = pc.Index("fitness")
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="ns1",
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# Print index statistics
print(index.describe_index_stats())