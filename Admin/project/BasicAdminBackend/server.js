const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Blog = require('./models/Blog');
const User = require('./models/User'); // ✅ Import User model

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Hardcoded admin credentials
const ADMIN = { username: 'admin', password: 'admin123' };

// ✅ Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ✅ Get all blogs
app.get('/api/admin/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
});

// ✅ Add new blog
app.post('/api/admin/blogs', async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const blog = new Blog({ title, content, image });
    await blog.save();
    res.json({ success: true, message: 'Blog added' });
  } catch {
    res.status(500).json({ success: false, message: 'Error adding blog' });
  }
});

// ✅ Update blog
app.put('/api/admin/blogs/:id', async (req, res) => {
  const { title, content, image } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    blog.title = title;
    blog.content = content;
    if (image && image.startsWith('data:image')) {
      blog.image = image;
    }

    await blog.save();
    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (err) {
    console.error('❌ Error updating blog:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ✅ Delete blog
app.delete('/api/admin/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Error deleting blog' });
  }
});

// ✅ Get all users (excluding admins)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    res.json(users);
  } catch (err) {
    console.error('❌ Error loading users:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Block/unblock user
app.put('/api/admin/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // 🔧 fixed typo: user → User
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Temporary route to add a user (just for testing)
app.post('/api/users', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = new User({ username, email, password, role: role || 'user' });
    await user.save();
    res.json({ success: true, message: 'User added', user });
  } catch (err) {
    console.error('❌ Error adding user:', err);
    res.status(500).json({ success: false, message: 'Failed to add user' });
  }
});

// ✅ MongoDB Connection and Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
