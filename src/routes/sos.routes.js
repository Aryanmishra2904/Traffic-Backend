import express from "express";
import { triggerSOS } from "../src/controllers/sos.controller.js";

const router = express.Router();

router.post("/trigger", triggerSOS);

export default router;