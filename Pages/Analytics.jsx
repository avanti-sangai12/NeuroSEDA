import React, { useState, useEffect } from "react";
import { BehavioralSession, Workflow } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Clock,
  Target,
  Activity
} from "lucide-react";

import BehaviorTrends from "../components/analytics/BehaviorTrends";
import WorkflowMetrics from "../components/analytics/WorkflowMetrics";
import PatternAnalysis from "../components/analytics/PatternAnalysis";
import PredictionAccuracy from "../components/analytics/PredictionAccuracy";

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, workflowsData] = await Promise.all([
        BehavioralSession.list('-created_date', 100),
        Workflow.list()
      ]);
      setSessions(sessionsData);
      setWorkflows(workflowsData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
    setIsLoading(false);
  };

  const getOverallStats = () => {
    const totalSessions = sessions.length;
    const avgConfidence = sessions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / (sessions.length || 1);
    const workflowTriggers = sessions.filter(s => s.workflow_triggered).length;
    const successRate = totalSessions ? (workflowTriggers / totalSessions) * 100 : 0;

    return {
      totalSessions,
      avgConfidence: Math.round(avgConfidence * 100),
      workflowTriggers,
      successRate: Math.round(successRate)
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
              Behavioral Analytics
            </h1>
            <p className="text-slate-400 text-lg">Deep insights into behavioral patterns and AI performance</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.totalSessions}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Confidence</p>
                  <p className="text-2xl font-bold text-green-400">{stats.avgConfidence}%</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Workflow Triggers</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.workflowTriggers}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.successRate}%</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="behavior" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="behavior" className="data-[state=active]:bg-slate-800">
              Behavior Trends
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-slate-800">
              Workflow Metrics
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-slate-800">
              Pattern Analysis
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="data-[state=active]:bg-slate-800">
              Prediction Accuracy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="space-y-6">
            <BehaviorTrends sessions={sessions} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <WorkflowMetrics workflows={workflows} sessions={sessions} />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <PatternAnalysis sessions={sessions} />
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-6">
            <PredictionAccuracy sessions={sessions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}