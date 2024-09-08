"use client"

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from '@mui/material';
import Head from 'next/head';
import getStripe from '@/utils/get-stripe';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [typedTexts, setTypedTexts] = useState(['', '', '']); // Initialize empty typed texts for each box

  const texts = [
    'Suggests exercises tailored to your fitness goals, experience level, and available equipment.',
    'Keeps you motivated with personalised tips to maintain a consistent workout routine.',
    'Offers substitute exercises to adapt to changing needs or limitations, ensuring flexibility in your fitness plan.'
  ];

  useEffect(() => {
    texts.forEach((text, index) => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setTypedTexts((prev) => {
            const newTypedTexts = [...prev];
            newTypedTexts[index] = text.slice(0, currentIndex + 1);
            return newTypedTexts;
          });
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    });
  }, []);

  const handleClick = () => {
    if (!user) {
      router.push('/sign-up');
    } else {
      router.push('/chat');
    }
  };

  const handleSubmit = async () => {
    const checkoutSession = await fetch(`/api/checkout_sessions`, {
      method: 'POST',
      headers: {
        'origin': 'http://localhost:3000',
      },
    });

    const checkoutSessionJson = await checkoutSession.json();
    if (checkoutSession.statusCode === 500) {
      console.error('Error creating checkout session:', checkoutSessionJson.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });
    if (error) {
      console.warn('Error redirecting to checkout:', error.message);
      return;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: 'lightcyan',
      }}
    >
      <Container maxWidth="100vw">
        <Head>
          <title>Fitness Companion</title>
          <meta
            name="description"
            content="Chat with Fitness Companion, an AI that understands your goals and helps you stay fit, focused, and consistent."
          />
        </Head>

        <AppBar position="sticky" color="secondary">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Fitness Companion
            </Typography>
            <SignedOut>
              <Button color="inherit" href="/sign-in">
                Login
              </Button>
              <Button color="inherit" href="/sign-up">
                Sign up
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
        </AppBar>

        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h3" gutterBottom>
            Welcome to Your Fitness Companion!
          </Typography>
          <Typography variant="h5" gutterBottom>
            A conversational AI that understands your fitness goals and helps you select the perfect exercises to stay fit, focused, and consistent!
          </Typography>
          <Button onClick={handleClick} variant="contained" color="secondary" sx={{ mt: 2 }}>
            Get Started
          </Button>
        </Box>

        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: '2.5rem',
              color: 'primary.main',
              mb: 4,
            }}
          >
            What Your Fitness Companion Offers!
          </Typography>

          <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ textAlign: 'center' }}>
            {[
              {
                title: 'Personalised Exercise Recommendations:',
                text: texts[0],
              },
              {
                title: 'Motivation and Consistency Support:',
                text: texts[1],
              },
              {
                title: 'Alternative Exercise Options:',
                text: texts[2],
              },
            ].map((item, index) => (
              <Grid item xs={12} md={5} key={index}>
                <Box
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderRadius: 2,
                    borderColor: 'success.main',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      animation: 'typing 3s steps(40, end), blink-caret .75s step-end infinite',
                      overflow: 'hidden',
                      borderRight: '3px solid',
                      display: 'inline-block',
                      fontWeight: 'bold',
                      color: '#007BFF',
                    }}
                  >
                    {typedTexts[index]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ my: 6, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Subscription
          </Typography>
          <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ textAlign: 'center' }}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  border: "2px solid",
                  borderRadius: 2,
                  borderColor: "secondary.main",
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Be a Pro
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  $5 / month
                </Typography>
                <Typography color='#007BFF'>
                  {" "}
                  Subscribe to Fitness Companion to stay fit and consistent.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  onClick={handleSubmit}
                >
                  Choose Pro
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            backgroundColor: 'lightgrey',
            padding: '1rem',
            textAlign: 'center',
            position: 'fixed',
            bottom: 0,
            width: '100%',
          }}
        >
          <Typography variant="body2" color="textSecondary">
           © {new Date().getFullYear() === 2023 ? 2023 : `2023 - ${new Date().getFullYear()}`} `Wale Ogundeji. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}