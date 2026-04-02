import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import connectDB from "./src/config/db.js";
import sosRoutes from "./src/routes/sos.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONNECT MONGODB
await connectDB();

// Register routes
app.use("/api/auth", authRoutes);
console.log("✅ Mounting /api/sos routes");
app.use("/api/sos", sosRoutes);

app.listen(8000, "0.0.0.0", () => {
    console.log("Server running on port 8000");
});