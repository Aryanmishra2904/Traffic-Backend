import connectDB from "../config/db.js";
import redis from "../config/redis.js";
import { sendSMS } from "../service/notification.service.js";
import SOS from "../models/sos.model.js";

// 🚀 Initialize Worker
async function init() {
    try {
        console.log("🚀 SOS Worker starting...");

        // 🔥 Connect MongoDB
        await connectDB();
        console.log("✅ MongoDB connected in worker");

        startWorker();

    } catch (err) {
        console.error("❌ Worker init failed:", err);
        process.exit(1);
    }
}

// 🔁 Main Worker Loop
async function startWorker() {
    console.log("🚀 SOS Worker started...");

    while (true) {
        try {
            const data = await redis.brPop("sos_queue", 0);

            if (!data) continue;

            const event = JSON.parse(data.element);

            console.log("\n🚨 [WORKER] Received SOS:", event);

            await handleSOS(event);

        } catch (error) {
            console.error("❌ Worker loop error:", error);
        }
    }
}

// 🧠 Handle SOS Logic
async function handleSOS(event) {
    const { id, phone, lat, lng } = event;

    try {
        console.log("🔄 Processing SOS ID:", id);

        // 🔹 Ensure SOS exists (upsert = create if not exists)
        await SOS.findByIdAndUpdate(
            id,
            {
                phone,
                lat,
                lng,
                status: "processing",
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // 🔹 Fetch data from Redis
        const contactsData = await redis.get(`contacts:${phone}`);
        const contacts = contactsData ? JSON.parse(contactsData) : [];

        const hospitalsData = await redis.get("hospitals");
        const hospitals = hospitalsData ? JSON.parse(hospitalsData) : [];

        const policeData = await redis.get("police");
        const police = policeData ? JSON.parse(policeData) : [];

        console.log("📞 Contacts:", contacts.length);
        console.log("🏥 Hospitals:", hospitals.length);
        console.log("🚓 Police:", police.length);

        const message = buildMessage(phone, lat, lng);

        let allSuccess = true;

        // 🔹 Send SMS to contacts
        for (let c of contacts) {
            const success = await sendSMS(c.phone, message);
            if (!success) allSuccess = false;
        }

        // 🔹 Send SMS to hospitals
        for (let h of hospitals) {
            const success = await sendSMS(h.phone, message);
            if (!success) allSuccess = false;
        }

        // 🔹 Send SMS to police
        for (let p of police) {
            const success = await sendSMS(p.phone, message);
            if (!success) allSuccess = false;
        }

        // 🔹 Final Status Update
        if (allSuccess) {
            console.log("✅ All alerts sent");

            await SOS.findByIdAndUpdate(id, {
                status: "sent",
                resolvedAt: new Date()
            });

        } else {
            console.log("❌ Some alerts failed → pushing to retry");

            await SOS.findByIdAndUpdate(id, {
                status: "failed"
            });

            // 🔁 Push to retry queue
            await redis.lPush("retry_queue", JSON.stringify(event));
        }

    } catch (err) {
        console.error("❌ Error handling SOS:", err);

        // 🔁 Backup retry on crash
        await redis.lPush("retry_queue", JSON.stringify(event));
    }
}

// 📨 Message Builder
function buildMessage(phone, lat, lng) {
    return `
🚨 ACCIDENT ALERT 🚨

User: ${phone}

📍 Location:
https://maps.google.com/?q=${lat},${lng}

Immediate help required.
`;
}

// 🔥 Start Worker
init();