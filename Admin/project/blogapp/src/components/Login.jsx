import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', form);
      if (res.data.success) {
        alert("Login successful");
        navigate('/admin'); // Redirect to Admin Dashboard
      }
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Typography variant="h4" gutterBottom>Admin Login</Typography>
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </Container>
  );
};

export default Login;
