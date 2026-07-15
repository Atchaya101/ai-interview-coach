import express from "express";
import {
  createInterview,
  getInterview,
  submitAnswer,
  finishInterview,
  getAllInterviews,
  deleteInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", createInterview);
router.get("/", getAllInterviews);
router.get("/:id", getInterview);
router.post("/:id/answers", submitAnswer);
router.post("/:id/finish", finishInterview);
router.delete("/:id", deleteInterview);

export default router;
