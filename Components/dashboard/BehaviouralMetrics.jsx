import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Activity, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function BehavioralMetrics({ sessions, isCapturing }) {
  const calculateMetrics = () => {
    if (!sessions.length) return { avgConfidence: 0, totalSessions: 0, successRate: 0 };
    
    const avgConfidence = sessions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / sessions.length;
    const successRate = sessions.filter(s => s.workflow_triggered).length / sessions.length;
    
    return {
      avgConfidence: Math.round(avgConfidence * 100),
      totalSessions: sessions.length,
      successRate: Math.round(successRate * 100)
    };
  };

  const metrics = calculateMetrics();

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Behavioral Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">Avg Confidence</span>
            </div>
            <span className="font-semibold text-slate-200">{metrics.avgConfidence}%</span>
          </div>
          <Progress value={metrics.avgConfidence} className="h-2 bg-slate-800" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Success Rate</span>
            </div>
            <span className="font-semibold text-slate-200">{metrics.successRate}%</span>
          </div>
          <Progress value={metrics.successRate} className="h-2 bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold text-cyan-400"
              animate={isCapturing ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {metrics.totalSessions}
            </motion.div>
            <div className="text-xs text-slate-500">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {sessions.filter(s => s.workflow_triggered).length}
            </div>
            <div className="text-xs text-slate-500">Workflows Run</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sessions.slice(0, 3).map((session, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate">
                  {session.predicted_action || 'Session recorded'}
                </span>
                <span className="text-slate-500 ml-2">
                  {new Date(session.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}