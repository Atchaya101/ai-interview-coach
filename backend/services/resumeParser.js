import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);

  if (ext === ".pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
};

// Lightweight heuristic parsing as a fallback / quick summary before AI processing
export const heuristicParse = (rawText) => {
  const lower = rawText.toLowerCase();

  const skillKeywords = [
    "javascript", "typescript", "python", "java", "c++", "c#", "react", "node.js",
    "express", "mongodb", "sql", "aws", "docker", "kubernetes", "git", "html", "css",
    "django", "flask", "spring", "graphql", "redux", "next.js", "tailwind", "figma",
  ];
  const skills = skillKeywords.filter((skill) => lower.includes(skill));

  const educationMatch = rawText.match(/(b\.?tech|bachelor|master|m\.?tech|b\.?sc|m\.?sc|phd)[^\n]*/gi) || [];
  const experienceMatch = rawText.match(/(intern|engineer|developer|analyst)[^\n]*/gi) || [];

  return {
    skills,
    education: educationMatch.slice(0, 5),
    experience: experienceMatch.slice(0, 5),
    projects: [],
  };
};
