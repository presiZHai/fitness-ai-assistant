import { 
    AppBar, 
    Button, 
    Container, 
    Toolbar, 
    Typography, 
    Box 
} from "@mui/material";
import React from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link"; 

export default function SignUpPage() {
    return (
        <Container maxWidth="100vw">
            <AppBar position="static" sx={{backgroundColor: '#3f51b5'}}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Fitness Assistant
                    </Typography>
                    <Button color="inherit">
                        <Link href="/sign-in" passHref>
                            <Typography color="white" component="span">
                                Login
                            </Typography>
                        </Link>
                    </Button>
                    <Button color="inherit">
                        <Link href="/sign-up" passHref>
                            <Typography color="white" component="span">
                                Sign Up
                            </Typography>
                        </Link>
                    </Button>
                </Toolbar>
            </AppBar>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ textAlign: 'center', mt: 4 }}
            >
                <Typography variant="h4" sx={{ mb: 2 }} gutterBottom>
                    Sign in
                </Typography>
                <SignIn fallbackRedirectUrl="/chat" />
            </Box>
        </Container>
    );
}