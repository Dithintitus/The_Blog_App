import React, { useState } from 'react';
import {Box,Button,Container,TextField,Paper, Typography} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
  e.preventDefault();
  axios.post('http://localhost:3004/login', { email, password })
    .then(res => setMessage(res.data.message))
    .catch(err => {
        console.error("Login error:", err);
        if (err.response?.data?.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Login failed");
        }
    });
};

  return (
    <Container maxWidth="sm">
      <Paper elevation={10} sx={{padding:6,marginTop:8}}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{display:'flex',flexDirection:'column',gap:2}}>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">Login</Button>
          <Button
            component={Link}
            to="/signup"
            variant="text"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
              Don't have an account?
          </Button>
        </Box>
      </Paper>
      <p>{message}</p>
    </Container>
  )
}

export default Login;
