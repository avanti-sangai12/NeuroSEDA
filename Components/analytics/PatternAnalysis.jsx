
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Brain, BrainCircuit, Target, Eye } from "lucide-react";

export default function PatternAnalysis({ sessions }) {
  // Generate pattern data
  const behaviorPatterns = [
    { 
      pattern: "Morning Productivity Burst",
      strength: 92,
      frequency: "Daily",
      description: "High mouse activity between 9-11 AM with document creation workflows",
      confidence: 0.89
    },
    {
      pattern: "Post-Lunch Communication", 
      strength: 78,
      frequency: "Daily",
      description: "Increased messaging and video call patterns after 1 PM",
      confidence: 0.76
    },
    {
      pattern: "End-of-Day Review",
      strength: 85,
      frequency: "Weekdays", 
      description: "Consistent data analysis and reporting workflows around 4-5 PM",
      confidence: 0.82
    },
    {
      pattern: "Creative Deep Work",
      strength: 71,
      frequency: "3x/week",
      description: "Extended focus periods with minimal window switching on creative tasks",
      confidence: 0.68
    }
  ];

  const behaviorVector = [
    { behavior: 'Mouse Activity', current: 85, optimal: 78 },
    { behavior: 'Keyboard Input', current: 72, optimal: 75 },
    { behavior: 'Window Focus', current: 91, optimal: 85 },
    { behavior: 'Scroll Patterns', current: 68, optimal: 70 },
    { behavior: 'Application Switch', current: 79, optimal: 82 },
    { behavior: 'Idle Detection', current: 88, optimal: 90 }
  ];

  const correlationData = Array(20).fill(0).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 50 + 50
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Detected Patterns */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            Detected Behavioral Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {behaviorPatterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-200">{pattern.pattern}</h4>
                  <Badge variant="outline" className="text-xs">
                    {pattern.frequency}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-400 mb-4">{pattern.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Pattern Strength</span>
                    <span className="text-sm font-medium text-slate-200">{pattern.strength}%</span>
                  </div>
                  <Progress value={pattern.strength} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Confidence</span>
                    <span className="text-green-400 font-medium">{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Profile */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Behavioral Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={behaviorVector}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="behavior" tick={{ fontSize: 12, fill: '#64748b' }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Optimal"
                dataKey="optimal"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pattern Correlation */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Pattern Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="x" stroke="#64748b" />
              <YAxis dataKey="y" stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value, name) => [value.toFixed(1), name === 'z' ? 'Confidence' : name === 'x' ? 'Activity Level' : 'Prediction Accuracy']}
              />
              <Scatter 
                name="Behavioral Clusters" 
                dataKey="z" 
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
