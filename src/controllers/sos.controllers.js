import SOS from "../models/sos.model.js";
import redis from "../config/redis.js";

export const triggerSOS = async (req, res) => {
    try {
        console.log("\n🚨 [SOS TRIGGER] HIT:", req.body);

        const { phone } = req.body;

        // 🔹 Get latest location
        const locationData = await redis.get(`location:${phone}`);

        if (!locationData) {
            console.log("❌ No location found");
            return res.status(400).json({ error: "Location not available" });
        }

        const { lat, lng } = JSON.parse(locationData);

        console.log("📍 Using location:", lat, lng);

        // 🔹 Save SOS
        const sosEvent = new SOS({
            phone,
            lat,
            lng,
            status: "triggered"
        });

        await sosEvent.save();

        console.log("✅ SOS saved:", sosEvent._id);

        // 🔹 Push to queue
        await redis.lPush("sos_queue", JSON.stringify({
            id: sosEvent._id,
            phone,
            lat,
            lng
        }));

        console.log("📦 Pushed to queue");

        res.json({
            status: "SOS triggered",
            id: sosEvent._id
        });

    } catch (err) {
        console.error("❌ SOS error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
export const getSOSStatus = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("\n📊 [SOS STATUS] Request for:", id);

        const sos = await SOS.findById(id);

        if (!sos) {
            return res.status(404).json({ error: "Not found" });
        }

        res.json({
            status: sos.status,
            phone: sos.phone,
            location: { lat: sos.lat, lng: sos.lng }
        });

    } catch (err) {
        console.error("❌ Status error:", err);
        res.status(500).json({ error: "Server error" });
    }
};