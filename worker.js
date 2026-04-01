import redis from "./redisClient.js";
import { sendSMS } from "./smsService.js";

async function startWorker() {
    while (true) {
        const data = await redis.brpop("sos_queue", 0);
        const event = JSON.parse(data[1]);

        await handleSOS(event);
    }
}

function buildMessage(event) {
    return `
 ACCIDENT ALERT 

https://maps.google.com/?q=${event.lat},${event.lng}
`;
}

async function handleSOS(event) {
    const message = buildMessage(event);
    await sendSMS(message);
}

startWorker();