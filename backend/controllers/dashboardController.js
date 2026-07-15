import { db } from "../data/store.js";

export const getDashboard = async (req, res, next) => {
  try {
    const interviews = db.interviews
      .filter((i) => i.status === "completed")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (interviews.length === 0) {
      return res.json({
        overallScore: 0,
        averageConfidence: 0,
        technicalScore: 0,
        communicationScore: 0,
        behavioralScore: 0,
        totalInterviews: 0,
        recentSessions: [],
        progressOverTime: [],
      });
    }

    const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

    const overallScore = avg(interviews.map((i) => i.overallScore));
    const averageConfidence = avg(interviews.map((i) => i.confidenceScore));
    const technicalScore = avg(interviews.map((i) => i.technicalScore));
    const communicationScore = avg(interviews.map((i) => i.communicationScore));
    const behavioralScore = avg(interviews.map((i) => i.behavioralScore));

    const progressOverTime = interviews
      .slice(0, 15)
      .reverse()
      .map((i) => ({
        date: i.completedAt,
        overallScore: i.overallScore,
        confidenceScore: i.confidenceScore,
      }));

    res.json({
      overallScore,
      averageConfidence,
      technicalScore,
      communicationScore,
      behavioralScore,
      totalInterviews: interviews.length,
      recentSessions: interviews.slice(0, 5),
      progressOverTime,
    });
  } catch (error) {
    next(error);
  }
};
