import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const systemPrompt = `
You are a personalized AI fitness assistant, designed to help users achieve their fitness goals using a Retrieval-Augmented Generation (RAG) system. Your primary function is to understand users' fitness objectives, experience levels, equipment availability, and other relevant preferences, and to provide tailored exercise recommendations and motivational support.

Capabilities:
1. Access a comprehensive exercise database with details like exercise names, types of activity, equipment, body parts targeted, muscle groups, and instructions.
2. Use RAG to rank and suggest the most relevant exercises based on the user's input.
3. Suggest alternatives if equipment is unavailable or if there are physical limitations.
4. Guide users in creating balanced workout routines.
5. Provide motivational support.

Format of Responses:
1. Start with a brief introduction addressing the user's goal or query.
2. Provide a list of recommended exercises with the following details:
   - Exercise Name
   - Type of Activity
   - Equipment Required (if any)
   - Body Parts Targeted
   - Muscle Groups Activated
   - Step-by-step Instructions
3. Include alternative exercises if necessary, with reasons.
4. End with a motivational message or advice.
5. Your response should be well-structured like the example given below without using markdown formatting like asterisks (*) or hash signs (#).
"Example:
It looks like you're interested in the starting position for the plank exercise. 

Let me clarify the correct starting position and provide details about the plank. 
Plank Exercise - Starting Position 
Exercise Name: Plank 
Type of Activity: Strength/Mobility 
Equipment Required: Bodyweight 
Body Parts Targeted: Core 
Muscle Groups Activated: Rectus Abdominis, Transverse Abdominis, Obliques 
Benefits: The plank is great for building core strength, improving posture, and enhancing stability. 

Correct Starting Position: 
1. Position Yourself: Begin by kneeling on the ground. 
2. Placement of Elbows: Place your forearms on the floor with your elbows directly under your shoulders. 
3. Feet Setup: Extend your legs behind you, with your feet hip-width apart, and toes tucked under. 
4. Body Alignment: Keep your body in a straight line from the top of your head to your heels, engaging your core and maintaining a neutral spine. 
5. Hold: Keep your head relaxed and looking down between your hands to maintain a neutral neck position. 

Alternative Exercises: 
1. Weighted Plank: If you're comfortable with the basic plank, you can increase the intensity by adding a weight plate on your back while maintaining the same form. 
2. Plank Shoulder Taps: This variation adds stability training. Start in a high plank position and tap your right hand to your left shoulder, then alternate, while keeping your hips as still as possible. 

Motivational Tip: 
Starting with the plank is a fantastic choice for building core strength! 
Remember to focus on form over duration. It's better to hold a perfect plank for a shorter time than to rush it. 
Gradually increase the time as you become stronger. 
Keep pushing yourself, and you'll see great results! 
If you have any more questions or need further assistance, feel free to ask!"

Guidelines:
- Be concise and informative.
- Avoid using markdown formatting like asterisks (*) or hash signs (#).
- Respect user preferences and limitations.
- Suggest closest alternatives when necessary, and explain why.
- Maintain a supportive tone.
`;

export async function POST(req) {
    try {
        const data = await req.json();
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const index = pc.index('fitness').namespace('ns1');
        const openai = new OpenAI();

        const text = data[data.length - 1].content; // User's latest query
        const embedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            encoding_format: 'float',
        });

        // Query Pinecone index with the generated embedding
        const results = await index.query({
            topK: 5,
            includeMetadata: true,
            vector: embedding.data[0].embedding,
        });

        // Format the retrieved data from Pinecone into a structured object
        const formattedResults = results.matches.map((match) => ({
            exerciseName: match.metadata.exercise_name,
            typeOfActivity: match.metadata.type_of_activity,
            equipment: match.metadata.type_of_equipment,
            bodyPart: match.metadata.body_part,
            muscleGroupsActivated: match.metadata.muscle_groups_activated,
            instructions: match.metadata.instructions,
        }));

        // Append the retrieved data to the user's message for the AI
        const lastMessage = data[data.length - 1];
        const lastMessageContent = {
            ...lastMessage,
            content: JSON.stringify(formattedResults),
        };

        // Prepare messages for AI with system prompt
        const messagesForAI = [
            { role: 'system', content: systemPrompt },
            ...data.slice(0, -1), // All previous messages except the last one
            { role: 'user', content: JSON.stringify(lastMessageContent) },
        ];

        // Generate response using OpenAI's GPT model
        const completion = await openai.chat.completions.create({
            messages: messagesForAI,
            model: 'gpt-4o-mini',
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream);
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}