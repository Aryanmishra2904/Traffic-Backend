import redisClient from "../config/redis.js";
import { getIO } from "../config/socket.js";

export const triggerSOS = async (req, res) => {
  const { userId, message } = req.body;

  // Cache SOS
  await redisClient.set(`sos:${userId}`, JSON.stringify({
    active: true,
    message
  }));

  // Emit real-time event
  const io = getIO();
  io.to(userId).emit("SOS", {
    message
  });

  res.json({ success: true });
};