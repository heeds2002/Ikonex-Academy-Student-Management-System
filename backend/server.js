const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDatabase } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://wonderful-pudding-a84889.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Ikonex Academy Student Management API is running"
  });
});

// Routes
app.use("/api/streams", require("./routes/streamRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/scores", require("./routes/scoreRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Start Server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
