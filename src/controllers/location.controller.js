import redis from "../config/redis.js";

export const updateLocation = async (req, res) => {
    try {
        console.log("\n📍 [LOCATION UPDATE] HIT:", req.body);

        const { phone, lat, lng } = req.body;

        if (!phone || !lat || !lng) {
            console.log("❌ Missing fields");
            return res.status(400).json({ error: "Missing data" });
        }

        const locationData = {
            lat,
            lng,
            updatedAt: Date.now()
        };

        await redis.set(`location:${phone}`, JSON.stringify(locationData));

        console.log("✅ Location stored in Redis:", locationData);

        res.json({ status: "location updated" });

    } catch (err) {
        console.error("❌ Location error:", err);
        res.status(500).json({ error: "Server error" });
    }
};