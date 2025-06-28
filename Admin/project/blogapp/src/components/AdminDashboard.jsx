import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Container, Box, Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [Users, setUsers] = useState([]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/blogs');
      setBlogs(res.data);
    } catch (err) {
      alert("Error fetching blogs");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(res.data);
    } catch {
      alert("Error loading users");
    }
  };

  useEffect(() => {
    if (tab === 0) fetchBlogs();
    if (tab === 1) fetchUsers();
  }, [tab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Image too large. Upload below 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) return alert("Fill in all fields");
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admin/blogs/${editId}`, form);
      } else {
        await axios.post('http://localhost:5000/api/admin/blogs', form);
      }
      setForm({ title: '', content: '', image: '' });
      setEditId(null);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Error submitting blog");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/blogs/${id}`);
      fetchBlogs();
    } catch {
      alert("Delete failed");
    }
  };

  const handleEdit = (blog) => {
    setForm({ title: blog.title, content: blog.content, image: blog.image || '' });
    setEditId(blog._id);
  };

  const handleBlockToggle = async (id) => {
    await axios.put(`http://localhost:5000/api/admin/users/${id}/block`);
    fetchUsers();
  };

  const handleUserDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
    fetchUsers();
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <Tabs value={tab} onChange={(e, val) => setTab(val)}>
        <Tab label="Blogs" />
        <Tab label="Users" />
      </Tabs>

      {tab === 0 && (
        <>
          <Box mt={3} mb={2}>
            <Typography variant="h6">{editId ? 'Update Blog' : 'Add New Blog'}</Typography>
            <TextField
              fullWidth label="Title" margin="normal"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              fullWidth multiline rows={4} label="Content" margin="normal"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                {editId ? 'Replace Image (optional)' : 'Upload Image'}
              </Typography>
              <Button variant="outlined" component="label">
                Choose File
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Box>
            {form.image && (
              <Box mt={2}>
                <img src={form.image} alt="Preview" style={{ width: 150, borderRadius: 8 }} />
              </Box>
            )}
            <Box mt={2}>
              <Button variant="contained" onClick={handleSubmit}>
                {editId ? 'Update Blog' : 'Add Blog'}
              </Button>
            </Box>
          </Box>

          <Typography variant="h6" mt={4}>All Blogs</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>{blog.image && <img src={blog.image} alt="blog" width="80" />}</TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.content}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(blog)}>Edit</Button>
                    <Button color="error" onClick={() => handleDelete(blog._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {tab === 1 && (
        <>
          <Typography variant="h6" mt={4}>User Management</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isBlocked ? 'Blocked' : 'Active'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleBlockToggle(user._id)}>
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                    <Button color="error" onClick={() => handleUserDelete(user._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Button onClick={handleLogout} variant="outlined" color="secondary" sx={{ mt: 3 }}>
        Logout
      </Button>
    </Container>
  );
};

export default AdminDashboard;
