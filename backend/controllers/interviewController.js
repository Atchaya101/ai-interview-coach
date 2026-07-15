import { db, generateId } from "../data/store.js";
import { generateQuestions, evaluateAnswer, generateFinalReport } from "../services/aiService.js";

// POST /api/interviews  -> create interview + generate questions
export const createInterview = async (req, res, next) => {
  try {
    const { resumeId, company, role, interviewType, difficulty, questionCount } = req.body;

    let resumeText = "";
    let resumeDoc = null;
    if (resumeId) {
      resumeDoc = db.resumes.find((r) => r._id === resumeId);
      if (!resumeDoc) return res.status(404).json({ message: "Resume not found" });
      resumeText = resumeDoc.rawText;
    }

    const interview = {
      _id: generateId(),
      resumeId: resumeDoc?._id || null,
      company: company || "General",
      role: role || "Software Engineer",
      interviewType: interviewType || "mixed",
      difficulty: difficulty || "medium",
      status: "in-progress",
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      behavioralScore: 0,
      confidenceScore: 0,
      readinessPercentage: 0,
      suggestedTopics: [],
      createdAt: new Date(),
      completedAt: null,
    };
    db.interviews.unshift(interview);

    const generated = await generateQuestions({
      resumeText: resumeText || `Role: ${interview.role}. No resume provided, generate general questions for this role.`,
      company: interview.company,
      role: interview.role,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      questionCount: questionCount || 8,
    });

    const questionDocs = generated.map((q, idx) => ({
      _id: generateId(),
      interviewId: interview._id,
      text: q.text,
      category: q.category || "technical",
      difficulty: q.difficulty || interview.difficulty,
      order: idx,
    }));
    db.questions.push(...questionDocs);

    res.status(201).json({ interview, questions: questionDocs });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews/:id
export const getInterview = async (req, res, next) => {
  try {
    const interview = db.interviews.find((i) => i._id === req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const questions = db.questions
      .filter((q) => q.interviewId === interview._id)
      .sort((a, b) => a.order - b.order);
    const answers = db.answers.filter((a) => a.interviewId === interview._id);

    res.json({ interview, questions, answers });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/answers -> submit an answer, get AI evaluation immediately
export const submitAnswer = async (req, res, next) => {
  try {
    const interview = db.interviews.find((i) => i._id === req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const { questionId, transcript, mode, timeTakenSeconds, skipped } = req.body;
    const question = db.questions.find((q) => q._id === questionId && q.interviewId === interview._id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const answer = {
      _id: generateId(),
      interviewId: interview._id,
      questionId: question._id,
      transcript: transcript || "",
      mode: mode || "text",
      timeTakenSeconds: timeTakenSeconds || 0,
      skipped: !!skipped,
      createdAt: new Date(),
    };
    db.answers.push(answer);

    let resumeContext = "";
    if (interview.resumeId) {
      const resumeDoc = db.resumes.find((r) => r._id === interview.resumeId);
      resumeContext = resumeDoc?.rawText || "";
    }

    const evaluation = await evaluateAnswer({
      question: question.text,
      transcript: skipped ? "" : transcript,
      resumeContext,
    });

    const feedback = {
      _id: generateId(),
      interviewId: interview._id,
      answerId: answer._id,
      scoreOutOf100: evaluation.scoreOutOf100 ?? 0,
      technicalAccuracy: evaluation.technicalAccuracy ?? 0,
      communication: evaluation.communication ?? 0,
      confidence: evaluation.confidence ?? 0,
      grammar: evaluation.grammar ?? 0,
      completeness: evaluation.completeness ?? 0,
      logicalThinking: evaluation.logicalThinking ?? 0,
      problemSolving: evaluation.problemSolving ?? 0,
      professionalism: evaluation.professionalism ?? 0,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      missedPoints: evaluation.missedPoints || [],
      idealAnswer: evaluation.idealAnswer || "",
      tips: evaluation.tips || [],
    };
    db.feedbacks.push(feedback);

    res.status(201).json({ answer, feedback });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/finish -> aggregate scores + generate final report
export const finishInterview = async (req, res, next) => {
  try {
    const interview = db.interviews.find((i) => i._id === req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const answers = db.answers.filter((a) => a.interviewId === interview._id);
    const answerIds = new Set(answers.map((a) => a._id));
    const feedbacks = db.feedbacks.filter((f) => f.interviewId === interview._id && answerIds.has(f.answerId));

    if (feedbacks.length === 0) {
      return res.status(400).json({ message: "No answers submitted yet" });
    }

    const avg = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;

    const overallScore = Math.round(avg(feedbacks.map((f) => f.scoreOutOf100)));
    const technicalScore = Math.round(avg(feedbacks.map((f) => f.technicalAccuracy)));
    const communicationScore = Math.round(avg(feedbacks.map((f) => f.communication)));
    const confidenceScore = Math.round(avg(feedbacks.map((f) => f.confidence)));
    const behavioralScore = Math.round(avg(feedbacks.map((f) => f.professionalism)));

    const report = await generateFinalReport({
      interviewMeta: {
        company: interview.company,
        role: interview.role,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
      },
      feedbackList: feedbacks,
    });

    interview.status = "completed";
    interview.overallScore = overallScore;
    interview.technicalScore = technicalScore;
    interview.communicationScore = communicationScore;
    interview.behavioralScore = behavioralScore;
    interview.confidenceScore = confidenceScore;
    interview.readinessPercentage = report.readinessPercentage ?? overallScore;
    interview.suggestedTopics = report.suggestedTopics || [];
    interview.completedAt = new Date();

    res.json({ interview, summary: report.summary || "", feedbacks });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews -> history list
export const getAllInterviews = async (req, res, next) => {
  try {
    res.json({ interviews: db.interviews });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/interviews/:id
export const deleteInterview = async (req, res, next) => {
  try {
    const index = db.interviews.findIndex((i) => i._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Interview not found" });

    const [interview] = db.interviews.splice(index, 1);

    const relatedAnswerIds = db.answers
      .filter((a) => a.interviewId === interview._id)
      .map((a) => a._id);

    db.questions = db.questions.filter((q) => q.interviewId !== interview._id);
    db.answers = db.answers.filter((a) => a.interviewId !== interview._id);
    db.feedbacks = db.feedbacks.filter(
      (f) => f.interviewId !== interview._id && !relatedAnswerIds.includes(f.answerId)
    );

    res.json({ message: "Interview deleted" });
  } catch (error) {
    next(error);
  }
};
