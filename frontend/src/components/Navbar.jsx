import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/resume", label: "Resume" },
    { to: "/interview/setup", label: "New Interview" },
    { to: "/history", label: "History" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass mx-4 mt-4 px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
        AI Interview Coach
      </Link>
      <div className="hidden md:flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === link.to ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
