import path from "path";
import { db, generateId } from "../data/store.js";
import { extractTextFromFile, heuristicParse } from "../services/resumeParser.js";

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const rawText = await extractTextFromFile(req.file.path);

    if (!rawText || rawText.trim().length < 30) {
      return res.status(422).json({ message: "Could not extract meaningful text from this file" });
    }

    const parsed = heuristicParse(rawText);

    const resume = {
      _id: generateId(),
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: ext,
      rawText,
      parsed,
      createdAt: new Date(),
    };

    db.resumes.unshift(resume);

    res.status(201).json({ resume });
  } catch (error) {
    next(error);
  }
};

export const getAllResumes = async (req, res, next) => {
  try {
    // Omit the (potentially large) rawText field from the list view
    const resumes = db.resumes.map(({ rawText, ...rest }) => rest);
    res.json({ resumes });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = db.resumes.find((r) => r._id === req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json({ resume });
  } catch (error) {
    next(error);
  }
};
