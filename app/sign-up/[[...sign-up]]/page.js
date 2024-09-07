import { SignIn, SignUp } from "@clerk/nextjs";
import { 
    AppBar, 
    Button, 
    Container, 
    Toolbar, 
    Typography, 
    Box 
} from "@mui/material";
import Link from "next/link"; 

export default function SignUpPage() {
    return (
        <Container maxWidth="100vw">
            <AppBar position="static">
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
                sx={{ mt: 4 }}
            >
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Sign Up
                </Typography>
                <SignUp signInFallbackRedirectUrl="/sign-in" />
            </Box>
        </Container>
    );
}