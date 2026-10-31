import mongoose from "mongoose";
import express from "express";
import Readme from "../models/Readme.js";

const router = express.Router();

// SAVE a generated README
router.post("/", async (req, res) => {
  try {
    const {
      projectName,
      description,
      technologies,
      features,
      markdown
    } = req.body;

    if (
      typeof projectName !== "string" ||
      typeof description !== "string" ||
      typeof technologies !== "string" ||
      typeof features !== "string" ||
      typeof markdown !== "string" ||
      !projectName.trim() ||
      !description.trim() ||
      !technologies.trim() ||
      !features.trim() ||
      !markdown.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All project details and Markdown are required."
      });
    }

    const savedReadme = await Readme.create({
      projectName: projectName.trim(),
      description: description.trim(),
      technologies: technologies.trim(),
      features: features.trim(),
      markdown: markdown.trim()
    });

    res.status(201).json({
      success: true,
      readme: savedReadme
    });
  } catch (error) {
    console.log("README save error:",error)

    res.status(500).json({
      success: false,
      message: "Failed to save README.",
      error:error.message
    });
  }
});

// GET all saved READMEs
router.get("/", async (req, res) => {
  try {
    const readmes = await Readme.find()
      .sort({ createdAt: -1 })
      .select("projectName technologies createdAt");

    return res.status(200).json({
      success: true,
      readmes
    });
  } catch (error) {
    console.error("Failed to load README history from MongoDB:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load README history."
    });
  }
});

// GET one README by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid README ID."
      });
    }

    const readme = await Readme.findById(req.params.id);

    if (!readme) {
      return res.status(404).json({
        success: false,
        message: "README not found."
      });
    }

    res.json({ success: true, readme });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load README."
    });
  }
});

// DELETE one README by ID
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid README ID."
      });
    }

    const deleted = await Readme.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "README not found."
      });
    }

    res.json({
      success: true,
      message: "README deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete README."
    });
  }
});

export default router;
