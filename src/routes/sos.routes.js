import express from "express";
import { triggerSOS } from "../controllers/sos.controllers.js";

const router = express.Router();

router.get("/", (req, res) => {
    console.log("✅ SOS BASE ROUTE HIT");
    res.send("SOS BASE WORKING");
});

router.post("/trigger", triggerSOS);

export default router;