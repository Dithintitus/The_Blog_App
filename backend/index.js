const express = require("express");
const cors = require("cors");

require("./connection");
const userModel = require("./model/user");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existing = await userModel.findOne({ email });
    if (existing) return res.status(400).send({ message: "User already exists" });

    await userModel({ name, email, password }).save();

    res.send({ message: "Signup successful" });
  } catch (error) {
    console.log("Signup error:", error);
    res.status(500).send({ message: "Error in signup", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).send({ message: "User not found" });

    if (user.password !== password) {
      return res.status(401).send({ message: "Incorrect password" });
    }

    res.send({ message: "Login successful", user });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).send({ message: "Error in login", error: error.message });
  }
});

app.listen(3004, () => {
  console.log("Server running on port 3004");
});
