import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend Connected 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});