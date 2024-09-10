const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const quizRoutes = require("./routes/quizRoutes");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/authMiddlewarte");

dotenv.config();

// Middlewares

// Set up CORS
app.use(
  cors({
    origin: "https://quiz-application-mern.onrender.com", // Replace with your front-end origin
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Log every incoming request
app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url} - ${req.ip} - ${new Date()}`);
  next();
});

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

// Protected Routes
app.use("/api/quizzes/create", authenticateToken, quizRoutes);

app.get("/", (req, res) => {
  res.send("<h1>HELLO I AM SERVER!!</h1>");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log(`${req.method} - ${req.url} - ${req.ip} - ${new Date()}`);
  res.status(500).send("Something broke!");
});

// Start the Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server running on port number ${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI, {
      connectTimeoutMS: 30000, // Increase the timeout to 30 seconds
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
});
