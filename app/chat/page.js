'use client'

import { useState, useEffect } from 'react';
import { Box, Button, Stack, TextField, Typography, IconButton } from '@mui/material';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase'; // Import Firestore instance
import MenuIcon from '@mui/icons-material/Menu';

// Initialize Firestore Collection
const chatHistoryCollection = collection(firestore, 'chatHistory');

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your RAG-powered fitness assistant. I can help you with your fitness goals, suggest exercises based on your experience level and available equipment, and keep you motivated. How can I assist you today?`,
    },
  ]);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = fetchChatHistory();
    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  // Real-time fetching chat history
  const fetchChatHistory = () => {
    const q = query(chatHistoryCollection, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatHistory(history);
    });
    return unsubscribe; // Return unsubscribe function for cleanup
  };

  const saveChatHistory = async (messages) => {
    await addDoc(chatHistoryCollection, {
      messages,
      timestamp: serverTimestamp(),
    });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    const updatedMessages = [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ];

    setMessages(updatedMessages);
    setMessage('');
    saveChatHistory(updatedMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      const processText = async ({ done, value }) => {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      };

      await reader.read().then(processText);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const suggestedQuestions = [
    "What are the best exercises for beginners?",
    "How can I improve my core strength?",
    "What equipment do I need for a home workout?",
  ];

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        bgcolor: '#f5f5f5',
        padding: 2,
      }}
    >
      {/* Sidebar for Chat History */}
      {sidebarOpen && (
        <Box
          sx={{
            width: 250,
            bgcolor: '#fff',
            boxShadow: 3,
            p: 2,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6">Chat History</Typography>
          {chatHistory.map((chat) => (
            <Box key={chat.id} sx={{ mt: 2 }}>
              <Typography variant="body2">
                {new Date(chat.timestamp?.seconds * 1000).toLocaleString()}
              </Typography>
              {chat.messages.map((msg, index) => (
                <Typography key={index} variant="body2">
                  {msg.role === 'user' ? 'You: ' : 'Assistant: '}
                  {msg.content}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      )}

      {/* Main Chat Interface */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          padding: 2,
        }}
      >
        <Box
          sx={{
            width: '90%',
            maxWidth: 1500,
            height: '95vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: 'white',
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Menu Button */}
          <IconButton
            sx={{ position: 'absolute', top: 8, left: 8 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon />
          </IconButton>

          {/* Messages Display Area */}
          <Stack
            sx={{
              flexGrow: 1,
              padding: 2,
              overflowY: 'auto',
              borderBottom: '1px solid #ddd',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
                  marginBottom: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: message.role === 'assistant' ? '#f0f0f0' : '#1976d2',
                    color: message.role === 'assistant' ? '#000' : '#fff',
                    padding: 1.5,
                    borderRadius: 2,
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          {/* Input Area */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ padding: 2, borderTop: '1px solid #ddd' }}
          >
            <TextField
              label="Type your message..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="contained" color="primary" onClick={sendMessage}>
              Send
            </Button>
          </Stack>

          {/* Suggested Questions */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ padding: 2, borderTop: '1px solid #ddd' }}
          >
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => {
                  setMessage(question);
                  sendMessage();
                }}
              >
                {question}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}