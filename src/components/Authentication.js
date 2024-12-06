import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";


const Authentication = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // if (isAuthenticated) {
  //   setCurrentTab(2);
  //   navigate("/jobs");
  // }
  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/signup",
      },
    });
  };
  const handleSignUp = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/signup",
      },
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <>
    <Container component="main" maxWidth="xs">
      <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      >
      <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
        Welcome to Job Portal
      </Typography>
      <Typography component="h2" variant="h6" sx={{ mb: 5 }}>
        Your gateway to new opportunities!
      </Typography>

      <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
        Already have an account? Log in to continue.
        </Typography>
        <Button
          onClick={handleLogin}
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
        >
        Log In
        </Button>

        <Typography variant="body1" sx={{ mb: 3 }}>
        New here? Create an account to get started.
        </Typography>
        <Button
          onClick={handleSignUp}
          fullWidth
          variant="outlined"
          color="primary"
        >
        Sign Up
        </Button>
      </Paper>
      </Box>
    </Container>
    </>
  );
};

export default Authentication;