import redis from "../config/redis.js";
import { sendSMS } from "../service/notification.service.js";
import SOS from "../models/sos.model.js";

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
            console.error("❌ Worker error:", error);
        }
    }
}

async function handleSOS(event) {
    const { id, phone, lat, lng } = event;

    try {
        console.log("🔄 Processing SOS ID:", id);

        // 🔹 Update status → processing
        await SOS.findByIdAndUpdate(id, { status: "processing" });

        // 🔹 Fetch contacts
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

        // 🔹 Send to contacts
        for (let c of contacts) {
            const success = await sendSMS(c.phone, message);
            if (!success) allSuccess = false;
        }

        // 🔹 Send to hospitals
        for (let h of hospitals) {
            const success = await sendSMS(h.phone, message);
            if (!success) allSuccess = false;
        }

        // 🔹 Send to police
        for (let p of police) {
            const success = await sendSMS(p.phone, message);
            if (!success) allSuccess = false;
        }

        // 🔹 Update status
        if (allSuccess) {
            console.log("✅ All alerts sent");

            await SOS.findByIdAndUpdate(id, {
                status: "sent"
            });

        } else {
            console.log("❌ Some alerts failed → pushing to retry");

            await SOS.findByIdAndUpdate(id, {
                status: "failed"
            });

            await redis.lPush("retry_queue", JSON.stringify(event));
        }

    } catch (err) {
        console.error("❌ Error handling SOS:", err);
    }
}

function buildMessage(phone, lat, lng) {
    return `
🚨 ACCIDENT ALERT 🚨

User: ${phone}

📍 Location:
https://maps.google.com/?q=${lat},${lng}

Immediate help required.
`;
}

startWorker();