import { randomUUID } from "crypto";

/**
 * In-memory data store.
 * No database — everything lives here for the lifetime of the process.
 * Data is lost on server restart. This is intentional for this project's scope.
 */
export const db = {
  resumes: [],     // { _id, fileName, filePath, fileType, rawText, parsed, createdAt }
  interviews: [],  // { _id, resumeId, company, role, interviewType, difficulty, status, ...scores, createdAt, completedAt }
  questions: [],   // { _id, interviewId, text, category, difficulty, order }
  answers: [],     // { _id, interviewId, questionId, transcript, mode, timeTakenSeconds, skipped, createdAt }
  feedbacks: [],   // { _id, interviewId, answerId, scoreOutOf100, ...subscores, strengths, weaknesses, missedPoints, idealAnswer, tips }
};

export const generateId = () => randomUUID();
