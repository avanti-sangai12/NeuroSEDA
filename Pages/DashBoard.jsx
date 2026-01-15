import React, { useState, useEffect } from "react";
import { BehavioralSession, Workflow } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  MousePointer, 
  Keyboard, 
  Monitor, 
  Eye,
  Zap,
  TrendingUp,
  Clock,
  Target,
  Play,
  Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import RealTimeSignals from "../Components/dashboard/RealTimeSignals";
import IntentPrediction from "../components/dashboard/IntentPrediction";
import WorkflowSuggestions from "../components/dashboard/WorkflowSuggestions";
import BehavioralMetrics from "../components/dashboard/BehavioralMetrics";

export default function Dashboard() {
  const [isCapturing, setIsCapturing] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    mouseMovements: 0,
    keystrokes: 0,
    scrollEvents: 0,
    windowSwitches: 0,
    gazePoints: 0
  });

  useEffect(() => {
    loadData();
    if (isCapturing) {
      startSimulation();
    }
    return () => clearInterval(window.simulationInterval);
  }, [isCapturing]);

  const loadData = async () => {
    const [sessionsData, workflowsData] = await Promise.all([
      BehavioralSession.list('-created_date', 10),
      Workflow.list()
    ]);
    setRecentSessions(sessionsData);
    setWorkflows(workflowsData.filter(w => w.is_active));
  };

  const startSimulation = () => {
    window.simulationInterval = setInterval(() => {
      setRealTimeData(prev => ({
        mouseMovements: prev.mouseMovements + Math.floor(Math.random() * 5),
        keystrokes: prev.keystrokes + Math.floor(Math.random() * 3),
        scrollEvents: prev.scrollEvents + Math.floor(Math.random() * 2),
        windowSwitches: prev.windowSwitches + (Math.random() > 0.9 ? 1 : 0),
        gazePoints: prev.gazePoints + Math.floor(Math.random() * 8)
      }));
    }, 1000);
  };

  const toggleCapture = async () => {
    if (isCapturing) {
      clearInterval(window.simulationInterval);
      // Save current session
      if (currentSession) {
        await BehavioralSession.create({
          ...currentSession,
          duration_seconds: Math.floor((Date.now() - new Date(currentSession.session_start)) / 1000),
          ...realTimeData
        });
      }
    } else {
      setCurrentSession({
        session_start: new Date().toISOString(),
        behavioral_intent_vector: [0.3, 0.7, 0.2, 0.8, 0.5],
        predicted_action: "Starting document workflow",
        confidence_score: 0.85
      });
    }
    setIsCapturing(!isCapturing);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Neural Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Real-time behavioral intelligence and intent prediction</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300">
              <Brain className="w-4 h-4 mr-1" />
              AI Engine v2.1
            </Badge>
            <Button
              onClick={toggleCapture}
              className={`flex items-center gap-2 ${
                isCapturing 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCapturing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isCapturing ? 'Stop Capture' : 'Start Capture'}
            </Button>
          </div>
        </div>

        {/* Real-time Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <RealTimeSignals 
            icon={MousePointer}
            label="Mouse Events"
            value={realTimeData.mouseMovements}
            gradient="from-cyan-400 to-blue-500"
            isActive={isCapturing}
          />
          <RealTimeSignals 
            icon={Keyboard}
            label="Keystrokes"
            value={realTimeData.keystrokes}
            gradient="from-purple-400 to-pink-500"
            isActive={isCapturing}
          />
          <RealTimeSignals 
            icon={Monitor}
            label="Scroll Events"
            value={realTimeData.scrollEvents}
            gradient="from-green-400 to-emerald-500"
            isActive={isCapturing}
          />
          <RealTimeSignals 
            icon={Target}
            label="App Switches"
            value={realTimeData.windowSwitches}
            gradient="from-orange-400 to-red-500"
            isActive={isCapturing}
          />
          <RealTimeSignals 
            icon={Eye}
            label="Gaze Points"
            value={realTimeData.gazePoints}
            gradient="from-indigo-400 to-purple-500"
            isActive={isCapturing}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Intent Prediction */}
          <div className="lg:col-span-2 space-y-6">
            <IntentPrediction 
              isCapturing={isCapturing}
              currentSession={currentSession}
            />
            <WorkflowSuggestions 
              workflows={workflows}
              isCapturing={isCapturing}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BehavioralMetrics 
              sessions={recentSessions}
              isCapturing={isCapturing}
            />
            
            {/* Quick Actions */}
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-700 hover:bg-slate-800">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Pattern
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-700 hover:bg-slate-800">
                  <Clock className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-700 hover:bg-slate-800">
                  <Target className="w-4 h-4 mr-2" />
                  Calibrate System
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}