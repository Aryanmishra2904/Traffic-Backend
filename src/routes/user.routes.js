import express from "express";
import { setupUser } from "../src/controllers/user.controller.js";

const router = express.Router();

router.post("/setup", setupUser);

export default router;