import SOS from "../models/sos.model.js";
import redis from "../config/redis.js";

export const triggerSOS = async (req, res) => {
  try {
    const { phone, lat, lng, timestamp } = req.body;

    if (!phone || !lat || !lng) {
      return res.status(400).json({
        error: "phone, lat and lng are required"
      });
    }

    // 🔹 1. Save to MongoDB (MAIN STORAGE)
    const sosEvent = new SOS({
      phone,
      lat,
      lng,
      timestamp
    });

    await sosEvent.save();

    // 🔹 2. Push to Redis queue (for worker)
    await redis.lPush(
      "sos_queue",
      JSON.stringify({
        id: sosEvent._id,
        phone,
        lat,
        lng
      })
    );

    console.log("🚨 SOS stored + queued:", sosEvent._id);

    res.json({
      status: "SOS triggered successfully",
      sosId: sosEvent._id
    });

  } catch (error) {
    console.error("SOS error:", error);
    res.status(500).json({
      error: "Failed to trigger SOS"
    });
  }
};