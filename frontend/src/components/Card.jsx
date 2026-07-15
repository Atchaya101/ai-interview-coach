import React from "react";
import { motion } from "framer-motion";

const Card = ({ title, value, subtitle, accent = "primary" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5"
    >
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 text-${accent}-400`}>{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
};

export default Card;
