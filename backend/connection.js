const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://nikunjrenjithrajan:nikunjrr@cluster0.3p6hppk.mongodb.net/blogapp?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));
