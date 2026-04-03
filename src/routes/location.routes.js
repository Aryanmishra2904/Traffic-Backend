console.log("📍 LOCATION ROUTES LOADED");
import express from "express";
import { updateLocation } from "../controllers/location.controller.js";

const router = express.Router();

router.post("/update", updateLocation);

export default router;