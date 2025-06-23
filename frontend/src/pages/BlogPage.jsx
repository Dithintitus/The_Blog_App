// pages/BlogPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import blogData from "../data/blogData";
import NavBar from "../components/NavBar";
import "./BlogPage.css";

const BlogPage = () => {
  const { id } = useParams();
  const blog = blogData.find((b) => b.id === id);

  if (!blog) {
    return (
      <div className="blog-container">
        <NavBar />
        <div className="blog-content">
          <h2>Blog not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <NavBar />
      <div className="blog-content">
        <div className="photo-box">
          <img src={blog.image} alt={blog.title} width="200" height="200" />
        </div>
        <div className="text-section">
          <h1>{blog.title}</h1>
          <p className="author">by {blog.author}</p>
          <p className="description">{blog.description}</p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
