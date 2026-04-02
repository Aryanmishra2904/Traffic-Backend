import redisClient from "../config/redis.js";
import { v4 as uuidv4 } from "uuid";

export const setupUser = async (req, res) => {
  try {
    const { name, contacts } = req.body;

    const userId = uuidv4();

    const userData = {
      name,
      contacts
    };

    // Save user
    await redisClient.set(`user:${userId}`, JSON.stringify(userData));

    // Increment user count
    await redisClient.incr("users_count");

    res.json({
      userId,
      message: "User registered successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};