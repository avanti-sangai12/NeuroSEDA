import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RealTimeSignals({ icon: Icon, label, value, gradient, isActive }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {isActive && (
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <motion.p 
            key={value}
            initial={{ scale: 1.2, color: "#60a5fa" }}
            animate={{ scale: 1, color: "#f1f5f9" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-slate-100"
          >
            {value.toLocaleString()}
          </motion.p>
        </div>
      </CardContent>
    </Card>
  );
}