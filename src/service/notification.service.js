export const sendSMS = async (phone, message) => {
    try {
        console.log("📩 Sending SMS to:", phone);

        // 🔴 Replace with real API (Fast2SMS / Twilio)
        console.log("MESSAGE:", message);

        return true; // simulate success

    } catch (err) {
        console.error("❌ SMS failed:", err);
        return false;
    }
};