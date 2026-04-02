import express from "express";
import redis from "../redisClient.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!phone || !name) {
            return res.status(400).json({ error: "Name and phone required" });
        }

        const userKey = `user:${phone}`;

        const existing = await redis.get(userKey);
        if (existing) {
            return res.status(400).json({ error: "User already exists" });
        }

        const userData = {
            name,
            phone,
            email
        };

        await redis.set(userKey, JSON.stringify(userData));

        res.json({
            status: "signup successful",
            user: userData
        });

    } catch (err) {
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

router.post("/contacts", async (req, res) => {
    try {
        const { phone, contacts } = req.body;

        if (!phone || !contacts || contacts.length === 0) {
            return res.status(400).json({
                error: "Phone and contacts required"
            });
        }

        const userKey = `user:${phone}`;

        const user = await redis.get(userKey);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const parsedUser = JSON.parse(user);

        // Save contacts separately
        await redis.set(
            `contacts:${phone}`,
            JSON.stringify(contacts)
        );

        // OPTIONAL: queue contacts (for async processing/logging)
        await redis.lPush(
            "contacts_queue",
            JSON.stringify({ phone, contacts })
        );

        res.json({
            status: "contacts saved successfully",
            contacts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/contacts/:phone", async (req, res) => {
    const { phone } = req.params;

    const contacts = await redis.get(`contacts:${phone}`);

    res.json({
        contacts: contacts ? JSON.parse(contacts) : []
    });
});

export default router;