import express from "express";
import redis from "../redisClient.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { name, phone, email, contacts } = req.body;

        if (!phone || !name) {
            return res.status(400).json({ error: "Name and phone required" });
        }

        const userKey = `user:${phone}`;

        // Check if user already exists
        const existing = await redis.get(userKey);
        if (existing) {
            return res.status(400).json({ error: "User already exists" });
        }

        const userData = {
            name,
            phone,
            email,
            contacts: contacts || []
        };

        // Save in Redis
        await redis.set(userKey, JSON.stringify(userData));

        res.json({
            status: "signup successful",
            user: userData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "Phone required" });
        }

        const userKey = `user:${phone}`;
        const user = await redis.get(userKey);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            status: "login successful",
            user: JSON.parse(user)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;