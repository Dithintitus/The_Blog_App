// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js built-in module for file system operations

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // For parsing application/json

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define BlogPost Schema
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // Changed to an array of strings for multiple file URLs (images, videos, docs, etc.)
  imageUrls: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create BlogPost Model from the schema
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Ensure the uploads directory exists
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating upload directory:', err);
        return cb(err);
      }
      cb(null, uploadPath); // Files will be saved in the 'uploads/' directory
    });
  },
  filename: (req, file, cb) => {
    // Create a unique filename by appending a timestamp to the original name
    // Multer does not filter by file type by default, so it accepts all.
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Multer upload middleware instance (now handles multiple files up to 20)
const upload = multer({ storage: storage });
const uploadFiles = upload.array('files', 20); // 'files' is the field name, 20 is max files allowed

// API Routes

// 1. GET all blog posts
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET a single blog post by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Blog Post ID format.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// 3. POST a new blog post (now handles multiple file uploads)
app.post('/api/blogs', uploadFiles, async (req, res) => {
  const { title, description } = req.body;
  // Map uploaded files to their paths
  const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  if (!title || !description) {
    // If files were uploaded but title/description missing, delete them to clean up
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      });
    }
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  const newPost = new BlogPost({
    title,
    description,
    imageUrls // Use the new imageUrls array
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    // If there's a DB error, delete the uploaded files to clean up
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkerErr) => {
          if (unlinkerErr) console.error('Error deleting uploaded file on DB save error:', unlinkerErr);
        });
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// 4. PUT (update) an existing blog post (now handles multiple file uploads and deletions)
app.put('/api/blogs/:id', uploadFiles, async (req, res) => {
  try {
    const { title, description } = req.body;
    let imageUrlsToKeep = JSON.parse(req.body.imageUrlsToKeep || '[]'); // Parse array from string
    let imageUrlsToDelete = JSON.parse(req.body.imageUrlsToDelete || '[]'); // Parse array from string
    
    // Ensure imageUrlsToKeep and imageUrlsToDelete are arrays, even if FormData sends them as single strings
    if (typeof imageUrlsToKeep === 'string') imageUrlsToKeep = [imageUrlsToKeep];
    if (typeof imageUrlsToDelete === 'string') imageUrlsToDelete = [imageUrlsToDelete];


    let newFilePaths = [];

    // Process newly uploaded files
    if (req.files && req.files.length > 0) {
      newFilePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Delete files marked for deletion from the server's uploads folder
    for (const urlToDelete of imageUrlsToDelete) {
      const filePath = path.join(__dirname, urlToDelete);
      // Check if file exists before attempting to delete
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting file ${filePath}:`, err);
          else console.log(`Deleted file: ${filePath}`);
        });
      } else {
        console.warn(`File not found, skipping deletion: ${filePath}`);
      }
    }

    // Combine images to keep with newly uploaded files
    const finalImageUrls = [...imageUrlsToKeep, ...newFilePaths];

    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        imageUrls: finalImageUrls, // Update with the combined and filtered array
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (updatedPost) {
      res.json(updatedPost);
    } else {
      // If blog not found, delete any newly uploaded files to clean up
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting newly uploaded file on 404:', err);
          });
        });
      }
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (err) {
    // If there's an error during update, delete any newly uploaded files to clean up
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkerErr) => {
          if (unlinkerErr) console.error('Error deleting newly uploaded file on DB update error:', unlinkerErr);
        });
      });
    }
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Blog Post ID format.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE a blog post by ID
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blogToDelete = await BlogPost.findById(req.params.id);
    if (!blogToDelete) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Delete associated files from the server's uploads folder
    if (blogToDelete.imageUrls && blogToDelete.imageUrls.length > 0) {
      for (const imageUrl of blogToDelete.imageUrls) {
        const filePath = path.join(__dirname, imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Error deleting file ${filePath}:`, err);
                else console.log(`Deleted file during blog deletion: ${filePath}`);
            });
        } else {
            console.warn(`File not found during blog deletion, skipping: ${filePath}`);
        }
      }
    }

    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Blog Post ID format.' });
    }
    res.status(500).json({ message: err.message });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});