import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/interviews").then((res) => {
      setInterviews(res.data.interviews);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this interview? This cannot be undone.")) return;
    await api.delete(`/interviews/${id}`);
    setInterviews((prev) => prev.filter((i) => i._id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Interview History</h1>

      {interviews.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400">
          No interviews yet.{" "}
          <Link to="/interview/setup" className="text-primary-400 hover:underline">
            Start your first one
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((i) => (
            <motion.div key={i._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium">{i.company} — {i.role}</p>
                <p className="text-xs text-slate-400 capitalize mt-1">
                  {i.interviewType} · {i.difficulty} · {i.status} · {new Date(i.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary-400">{i.status === "completed" ? `${i.overallScore}%` : "—"}</span>
                {i.status === "completed" ? (
                  <Link to={`/report/${i._id}`} className="btn-secondary text-sm py-1.5 px-4">View</Link>
                ) : (
                  <Link to={`/interview/session/${i._id}`} className="btn-secondary text-sm py-1.5 px-4">Resume</Link>
                )}
                <button onClick={() => handleDelete(i._id)} className="text-red-400 hover:text-red-300 text-sm px-2">
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
