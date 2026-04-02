import redis from "./src/config/redis.js";
import { sendAlert } from "./src/service/notification.service.js";

async function startWorker() {
    console.log("🚀 Worker started...");

    while (true) {
        try {
            // Correct method for redis client
            const data = await redis.brPop("sos_queue", 0);

            if (!data) continue;

            const event = JSON.parse(data.element);

            console.log("🚨 SOS received in worker:", event);

            await handleSOS(event);

        } catch (error) {
            console.error("Worker error:", error);
        }
    }
}

async function handleSOS(event) {
    const { phone, lat, lng } = event;

    try {
        const contactsData = await redis.get(`contacts:${phone}`);
        const contacts = contactsData ? JSON.parse(contactsData) : [];

        const hospitalsData = await redis.get("hospitals");
        const hospitals = hospitalsData ? JSON.parse(hospitalsData) : [];

        const policeData = await redis.get("police");
        const police = policeData ? JSON.parse(policeData) : [];

        const message = buildMessage(phone, lat, lng);

        for (let c of contacts) {
            await sendAlert(c.phone, message);
        }

        for (let h of hospitals) {
            await sendAlert(h.phone, message);
        }

        for (let p of police) {
            await sendAlert(p.phone, message);
        }

        console.log("✅ SOS alerts sent successfully");

    } catch (err) {
        console.error("Error handling SOS:", err);
    }
}

function buildMessage(phone, lat, lng) {
    return `
🚨 ACCIDENT ALERT 🚨

User Phone: ${phone}

📍 Location:
https://maps.google.com/?q=${lat},${lng}

Immediate assistance required.
`;
}

startWorker();