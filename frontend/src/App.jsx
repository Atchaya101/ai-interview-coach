import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";
import InterviewSetup from "./pages/InterviewSetup.jsx";
import InterviewSession from "./pages/InterviewSession.jsx";
import Report from "./pages/Report.jsx";
import History from "./pages/History.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/interview/setup" element={<InterviewSetup />} />
        <Route path="/interview/session/:id" element={<InterviewSession />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
