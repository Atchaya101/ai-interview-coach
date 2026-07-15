import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";

const companies = ["General", "Google", "Amazon", "Microsoft", "Infosys", "TCS", "Zoho", "Startup"];
const interviewTypes = [
  { value: "technical", label: "Technical" },
  { value: "hr", label: "HR" },
  { value: "mixed", label: "Mixed" },
  { value: "dsa", label: "DSA" },
  { value: "ml", label: "Machine Learning" },
  { value: "web-development", label: "Web Development" },
];
const difficulties = ["easy", "medium", "hard"];

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [form, setForm] = useState({
    resumeId: location.state?.resumeId || "",
    company: "General",
    role: "Software Engineer",
    interviewType: "mixed",
    difficulty: "medium",
    questionCount: 6,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/resumes").then((res) => setResumes(res.data.resumes));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/interviews", form);
      navigate(`/interview/session/${res.data.interview._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-8">
        <h1 className="text-2xl font-bold mb-6">Set up your interview</h1>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Resume (optional but recommended)</label>
            <select
              className="input-field"
              value={form.resumeId}
              onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
            >
              <option value="">No resume — general questions</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.fileName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Company</label>
              <select className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}>
                {companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Role</label>
              <input
                type="text"
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Interview Type</label>
            <div className="grid grid-cols-3 gap-2">
              {interviewTypes.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setForm({ ...form, interviewType: t.value })}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    form.interviewType === t.value ? "bg-primary-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setForm({ ...form, difficulty: d })}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    form.difficulty === d ? "bg-primary-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Number of Questions: {form.questionCount}</label>
            <input
              type="range"
              min={3}
              max={12}
              value={form.questionCount}
              onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Generating questions..." : "Start Interview"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default InterviewSetup;
