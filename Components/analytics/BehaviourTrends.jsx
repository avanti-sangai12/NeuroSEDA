import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, MousePointer, Keyboard, Monitor } from "lucide-react";

export default function BehaviorTrends({ sessions, timeRange }) {
  // Generate sample data for the chart
  const generateTrendData = () => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array(days).fill(0).map((_, i) => ({
      time: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
      mouseEvents: Math.floor(Math.random() * 500) + 200,
      keystrokes: Math.floor(Math.random() * 300) + 100, 
      scrollEvents: Math.floor(Math.random() * 150) + 50,
      windowSwitches: Math.floor(Math.random() * 20) + 5,
      confidence: Math.random() * 0.4 + 0.6
    }));
  };

  const trendData = generateTrendData();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Behavioral Activity Over Time */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Behavioral Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="mouseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="keyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Area
                type="monotone"
                dataKey="mouseEvents"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#mouseGradient)"
                name="Mouse Events"
              />
              <Area
                type="monotone"
                dataKey="keystrokes"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#keyGradient)"
                name="Keystrokes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Event Type Distribution */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-cyan-400" />
            Event Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="scrollEvents" fill="#10b981" name="Scroll Events" />
              <Bar dataKey="windowSwitches" fill="#f59e0b" name="Window Switches" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confidence Scores */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-400" />
            Prediction Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Confidence']}
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#a855f7" 
                strokeWidth={3}
                dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                name="Confidence Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}