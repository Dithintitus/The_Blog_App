// NavBar.jsx
import React from "react";
import "./NavBar.css";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="nav-title">THE BLOG</div>
      <div className="nav-buttons">
        <button>Create new blog</button>
        <button>LOGIN</button>
        <button>SIGN UP</button>
      </div>
    </nav>
  );
};

export default NavBar;
