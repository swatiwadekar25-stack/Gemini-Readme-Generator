import express from "express";
import { createReadme  } from "../controllers/readmeController.js";

const router = express.Router();

router.post("/generate", createReadme);
// Get README history
// router.get("/history", getReadmeHistory);

export default router;