import express from "express";
import { uploadResume, getAllResumes, getResumeById } from "../controllers/resumeController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("resume"), uploadResume);
router.get("/", getAllResumes);
router.get("/:id", getResumeById);

export default router;
