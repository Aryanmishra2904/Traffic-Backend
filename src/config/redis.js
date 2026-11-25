import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

try {
    await redisClient.connect();
    console.log("Redis Connected Successfully!");
} catch (error) {
    console.log("Redis Connection Failed:", error.message);
}

export default redisClient;