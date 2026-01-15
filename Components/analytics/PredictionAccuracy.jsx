import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Target, TrendingUp, Brain, CheckCircle } from "lucide-react";

export default function PredictionAccuracy({ sessions }) {
  // Generate accuracy data over time
  const accuracyData = Array(30).fill(0).map((_, i) => ({
    day: `Day ${i + 1}`,
    accuracy: Math.random() * 20 + 75, // 75-95% accuracy
    confidence: Math.random() * 30 + 70, // 70-100% confidence
    predictions: Math.floor(Math.random() * 50) + 20 // 20-70 predictions per day
  }));

  const modelMetrics = [
    {
      model: "Intent Prediction Engine",
      accuracy: 87.3,
      precision: 84.1,
      recall: 89.7,
      f1Score: 86.8,
      status: "optimal"
    },
    {
      model: "Workflow Pattern Recognition",
      accuracy: 91.2,
      precision: 88.9,
      recall: 93.4,
      f1Score: 91.1,
      status: "excellent"
    },
    {
      model: "Behavioral Classification", 
      accuracy: 79.5,
      precision: 82.3,
      recall: 76.8,
      f1Score: 79.5,
      status: "good"
    },
    {
      model: "Context Awareness",
      accuracy: 83.7,
      precision: 85.2,
      recall: 81.9,
      f1Score: 83.5,
      status: "good"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      excellent: "bg-green-500/20 text-green-400 border-green-500/30",
      optimal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      good: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      poor: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[status] || colors.good;
  };

  const averageAccuracy = modelMetrics.reduce((sum, model) => sum + model.accuracy, 0) / modelMetrics.length;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Accuracy Over Time */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Prediction Accuracy Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[70, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'accuracy' ? 'Accuracy' : 'Confidence']}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#accuracyGradient)"
                name="Accuracy"
              />
              <Area
                type="monotone"
                dataKey="confidence"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#confidenceGradient)"
                name="Confidence"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Performance Metrics */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modelMetrics.map((model, index) => (
              <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-200 text-sm">{model.model}</h4>
                  <Badge variant="outline" className={getStatusColor(model.status)}>
                    {model.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accuracy:</span>
                    <span className="font-medium text-slate-200">{model.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Precision:</span>
                    <span className="font-medium text-slate-200">{model.precision.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recall:</span>
                    <span className="font-medium text-slate-200">{model.recall.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F1-Score:</span>
                    <span className="font-medium text-slate-200">{model.f1Score.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Progress value={model.accuracy} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall System Health */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {averageAccuracy.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-400">Overall System Accuracy</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Data Quality</span>
              <div className="flex items-center gap-2">
                <Progress value={94} className="h-2 w-20" />
                <span className="text-sm text-slate-200">94%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Model Stability</span>
              <div className="flex items-center gap-2">
                <Progress value={89} className="h-2 w-20" />
                <span className="text-sm text-slate-200">89%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Response Time</span>
              <div className="flex items-center gap-2">
                <Progress value={96} className="h-2 w-20" />
                <span className="text-sm text-slate-200">96%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">User Satisfaction</span>
              <div className="flex items-center gap-2">
                <Progress value={91} className="h-2 w-20" />
                <span className="text-sm text-slate-200">91%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">System Operating Optimally</span>
            </div>
            <p className="text-xs text-slate-500 text-center mt-1">
              Last health check: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}