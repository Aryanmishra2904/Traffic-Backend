import express from "express";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(express.json());

// Routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Backend running 🚀");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});