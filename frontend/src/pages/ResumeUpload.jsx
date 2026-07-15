import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  const loadResumes = useCallback(() => {
    api.get("/resumes").then((res) => setResumes(res.data.resumes));
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleFile = (f) => {
    if (!f) return;
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(f.type)) {
      setError("Please upload a PDF or DOCX file");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      await api.post("/resumes", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      loadResumes();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Resume</h1>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`glass p-10 text-center border-2 border-dashed transition-all ${
          dragOver ? "border-primary-500 bg-primary-500/5" : "border-white/10"
        }`}
      >
        <p className="text-slate-300 mb-2">Drag & drop your resume here, or</p>
        <label className="btn-secondary inline-block cursor-pointer">
          Browse Files
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
        <p className="text-xs text-slate-500 mt-3">PDF or DOCX, max 5MB</p>

        {file && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-sm text-slate-300">{file.name}</span>
            <button onClick={handleUpload} disabled={uploading} className="btn-primary text-sm py-1.5 px-4">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold mb-4">Your Resumes</h2>
        {resumes.length === 0 ? (
          <p className="text-slate-500 text-sm">No resumes uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {resumes.map((r) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between bg-white/5 rounded-xl p-4"
              >
                <div>
                  <p className="font-medium">{r.fileName}</p>
                  <p className="text-xs text-slate-400 uppercase">{r.fileType} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => navigate("/interview/setup", { state: { resumeId: r._id } })} className="btn-secondary text-sm py-1.5 px-4">
                  Use for Interview
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
