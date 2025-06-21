import React, { useState } from 'react';
import {Box,Button,Container,TextField,Paper,Typography} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3004/signup', { name, email, password })
      .then(res => setMessage(res.data.message))
      .catch(err => {
        if (err.response && err.response.data && err.response.data.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Signup failed");
        }
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={10} sx={{ padding: 6, marginTop: 8 }}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{display:'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            type="text"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <Button type="submit" variant="contained" color="primary">Create Account</Button>
          <Button component={Link} to="/login" variant="text" size="small" sx={{alignSelf:'flex-start'}}>Already have an account?</Button>
        </Box>
      </Paper>
      <p>{message}</p>
    </Container>
  )
}

export default Signup;
