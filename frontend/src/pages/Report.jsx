import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";
import { SkillRadarChart } from "../components/ScoreChart.jsx";

const ScoreRow = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}%</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-2">
      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const Report = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interviews/${id}`).then((res) => {
      setInterview(res.data.interview);
      setQuestions(res.data.questions);
      setAnswers(res.data.answers);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{interview.company} — {interview.role}</h1>
          <p className="text-slate-400 text-sm capitalize mt-1">
            {interview.interviewType} · {interview.difficulty} · {interview.status}
          </p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-primary-400">{interview.overallScore}%</p>
          <p className="text-xs text-slate-500">Overall Score</p>
        </div>
      </motion.div>

      {interview.status === "completed" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass p-6">
              <h2 className="text-lg font-semibold mb-4">Skill Breakdown</h2>
              <SkillRadarChart interview={interview} />
            </div>
            <div className="glass p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-2">Scores</h2>
              <ScoreRow label="Technical" value={interview.technicalScore} />
              <ScoreRow label="Communication" value={interview.communicationScore} />
              <ScoreRow label="Behavioral" value={interview.behavioralScore} />
              <ScoreRow label="Confidence" value={interview.confidenceScore} />
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-slate-400">Interview Readiness</p>
                <p className="text-2xl font-bold text-emerald-400">{interview.readinessPercentage}%</p>
              </div>
            </div>
          </div>

          {interview.suggestedTopics?.length > 0 && (
            <div className="glass p-6">
              <h2 className="text-lg font-semibold mb-3">Suggested Learning Topics</h2>
              <div className="flex flex-wrap gap-2">
                {interview.suggestedTopics.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="glass p-6">
        <h2 className="text-lg font-semibold mb-4">Question by Question</h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const answer = answers.find((a) => a.question === q._id);
            return (
              <div key={q._id} className="bg-white/5 rounded-xl p-4">
                <p className="text-xs uppercase text-primary-400 font-semibold mb-1">
                  Q{i + 1} · {q.category}
                </p>
                <p className="font-medium mb-2">{q.text}</p>
                <p className="text-sm text-slate-400 whitespace-pre-wrap">
                  {answer?.skipped ? <span className="italic text-slate-500">Skipped</span> : answer?.transcript || "No answer recorded"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Link to="/history" className="btn-secondary">Back to History</Link>
        <Link to="/interview/setup" className="btn-primary">Practice Again</Link>
      </div>
    </div>
  );
};

export default Report;
