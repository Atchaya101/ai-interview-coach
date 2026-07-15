import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";
import Card from "../components/Card.jsx";
import { ProgressLineChart } from "../components/ScoreChart.jsx";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back 👋</h1>
          <p className="text-slate-400 text-sm mt-1">
            {data.totalInterviews > 0
              ? `You've completed ${data.totalInterviews} interview${data.totalInterviews > 1 ? "s" : ""}. Keep it up!`
              : "You haven't completed an interview yet. Let's get started!"}
          </p>
        </div>
        <Link to="/interview/setup" className="btn-primary">
          Start New Interview
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Overall Score" value={`${data.overallScore}%`} accent="primary" />
        <Card title="Avg. Confidence" value={`${data.averageConfidence}%`} accent="cyan" />
        <Card title="Technical" value={`${data.technicalScore}%`} accent="indigo" />
        <Card title="Communication" value={`${data.communicationScore}%`} accent="emerald" />
        <Card title="Behavioral" value={`${data.behavioralScore}%`} accent="amber" />
      </div>

      {data.progressOverTime.length > 0 && (
        <div className="glass p-6">
          <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
          <ProgressLineChart progressOverTime={data.progressOverTime} />
        </div>
      )}

      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <Link to="/history" className="text-sm text-primary-400 hover:underline">
            View all
          </Link>
        </div>
        {data.recentSessions.length === 0 ? (
          <p className="text-slate-500 text-sm">No sessions yet. Start your first interview above.</p>
        ) : (
          <div className="space-y-3">
            {data.recentSessions.map((s) => (
              <Link
                key={s._id}
                to={`/report/${s._id}`}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all"
              >
                <div>
                  <p className="font-medium">
                    {s.company} — {s.role}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {s.interviewType} · {s.difficulty} · {new Date(s.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary-400">{s.overallScore}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
