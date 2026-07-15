import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("text"); // text | voice
  const [textAnswer, setTextAnswer] = useState("");
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const { isListening, transcript, setTranscript, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  useEffect(() => {
    api.get(`/interviews/${id}`).then((res) => {
      setInterview(res.data.interview);
      setQuestions(res.data.questions);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex]);

  useEffect(() => {
    setSeconds(0);
    setTextAnswer("");
    resetTranscript();
    if (isListening) stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const getAnswerText = () => (mode === "voice" ? transcript : textAnswer);

  const submitAnswer = useCallback(
    async (skipped = false) => {
      if (!currentQuestion) return;
      setSubmitting(true);
      try {
        await api.post(`/interviews/${id}/answers`, {
          questionId: currentQuestion._id,
          transcript: skipped ? "" : getAnswerText(),
          mode,
          timeTakenSeconds: seconds,
          skipped,
        });
        setAnsweredIds((prev) => new Set(prev).add(currentQuestion._id));
      } finally {
        setSubmitting(false);
      }
    },
    [currentQuestion, mode, seconds, textAnswer, transcript, id]
  );

  const handleNext = async () => {
    if (!answeredIds.has(currentQuestion._id) && getAnswerText().trim()) {
      await submitAnswer(false);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSkip = async () => {
    await submitAnswer(true);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleFinish = async () => {
    if (!answeredIds.has(currentQuestion._id) && getAnswerText().trim()) {
      await submitAnswer(false);
    }
    setFinishing(true);
    try {
      await api.post(`/interviews/${id}/finish`);
      navigate(`/report/${id}`);
    } finally {
      setFinishing(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center py-20 text-slate-400">No questions found for this interview.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{formatTime(seconds)}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion._id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass p-8"
        >
          <span className="text-xs uppercase tracking-wide text-primary-400 font-semibold">
            {currentQuestion.category} · {currentQuestion.difficulty}
          </span>
          <h2 className="text-xl font-semibold mt-2 mb-6">{currentQuestion.text}</h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode("text")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${mode === "text" ? "bg-primary-600 text-white" : "bg-white/5 text-slate-300"}`}
            >
              Text Mode
            </button>
            <button
              onClick={() => setMode("voice")}
              disabled={!isSupported}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${mode === "voice" ? "bg-primary-600 text-white" : "bg-white/5 text-slate-300"} disabled:opacity-40`}
            >
              Voice Mode {!isSupported && "(unsupported)"}
            </button>
          </div>

          {mode === "text" ? (
            <textarea
              className="input-field min-h-[160px]"
              placeholder="Type your answer here..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`btn-secondary text-sm ${isListening ? "bg-red-500/20 border-red-500/40 text-red-400" : ""}`}
                >
                  {isListening ? "● Stop Recording" : "🎤 Start Recording"}
                </button>
                {isListening && <span className="text-xs text-red-400 animate-pulse">Listening...</span>}
              </div>
              <textarea
                className="input-field min-h-[140px]"
                placeholder="Your transcribed answer will appear here — you can edit it before submitting."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary disabled:opacity-40"
            >
              Previous
            </button>
            <button onClick={handleSkip} disabled={submitting} className="btn-secondary">
              Skip Question
            </button>
            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext} disabled={submitting} className="btn-primary ml-auto">
                {submitting ? "Saving..." : "Next Question"}
              </button>
            ) : (
              <button onClick={handleFinish} disabled={finishing} className="btn-primary ml-auto">
                {finishing ? "Generating report..." : "Finish Interview"}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InterviewSession;
