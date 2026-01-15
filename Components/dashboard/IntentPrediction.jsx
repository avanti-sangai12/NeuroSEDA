import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Zap, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLE_PREDICTIONS = [
  { action: "Open Slack for team check-in", confidence: 0.92, type: "communication" },
  { action: "Start Daily Sales Report workflow", confidence: 0.87, type: "productivity" },
  { action: "Browse development documentation", confidence: 0.74, type: "research" },
  { action: "Create new presentation", confidence: 0.68, type: "creative" },
  { action: "Schedule meeting in calendar", confidence: 0.61, type: "productivity" }
];

export default function IntentPrediction({ isCapturing, currentSession }) {
  const [currentPrediction, setCurrentPrediction] = useState(SAMPLE_PREDICTIONS[0]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isCapturing) {
      const interval = setInterval(() => {
        setProcessing(true);
        setTimeout(() => {
          setCurrentPrediction(SAMPLE_PREDICTIONS[Math.floor(Math.random() * SAMPLE_PREDICTIONS.length)]);
          setProcessing(false);
        }, 1000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isCapturing]);

  const getTypeColor = (type) => {
    const colors = {
      communication: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      productivity: "bg-green-500/20 text-green-400 border-green-500/30",
      research: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      creative: "bg-pink-500/20 text-pink-400 border-pink-500/30"
    };
    return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          Intent Prediction Engine
          {processing && (
            <motion.div 
              className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPrediction.action}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  Predicted Next Action
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {currentPrediction.action}
                </p>
              </div>
              <Badge variant="outline" className={getTypeColor(currentPrediction.type)}>
                {currentPrediction.type}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Confidence Score</span>
                <span className="text-sm font-semibold text-slate-200">
                  {Math.round(currentPrediction.confidence * 100)}%
                </span>
              </div>
              <Progress 
                value={currentPrediction.confidence * 100} 
                className="h-2 bg-slate-800"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                disabled={!isCapturing}
              >
                <Zap className="w-4 h-4 mr-2" />
                Execute Suggestion
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700 hover:bg-slate-800"
                disabled={!isCapturing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {!isCapturing && (
          <div className="flex items-center justify-center py-8 text-slate-500">
            <Clock className="w-5 h-5 mr-2" />
            Start capture to see predictions
          </div>
        )}
      </CardContent>
    </Card>
  );
}