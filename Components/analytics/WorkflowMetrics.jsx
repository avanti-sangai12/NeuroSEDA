import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Zap, TrendingUp, Clock, Target } from "lucide-react";

export default function WorkflowMetrics({ workflows, sessions }) {
  const workflowStats = workflows.map(workflow => ({
    ...workflow,
    triggerCount: workflow.times_triggered || 0,
    successRate: Math.random() * 30 + 70, // Mock success rate
    avgExecutionTime: Math.random() * 120 + 30 // Mock execution time in seconds
  })).sort((a, b) => b.triggerCount - a.triggerCount);

  const categoryData = workflows.reduce((acc, workflow) => {
    acc[workflow.category] = (acc[workflow.category] || 0) + (workflow.times_triggered || 0);
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([category, count], index) => ({
    name: category,
    value: count,
    color: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'][index % 6]
  }));

  const performanceData = workflowStats.slice(0, 5).map(workflow => ({
    name: workflow.name.length > 15 ? workflow.name.substring(0, 15) + '...' : workflow.name,
    triggers: workflow.triggerCount,
    success: workflow.successRate
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Top Performing Workflows */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Top Performing Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowStats.slice(0, 5).map((workflow, index) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">{workflow.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {workflow.category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {workflow.triggerCount} triggers
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-400">
                    {workflow.successRate.toFixed(1)}% success
                  </div>
                  <div className="text-xs text-slate-500">
                    Avg: {workflow.avgExecutionTime.toFixed(0)}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Workflow Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-slate-400 capitalize">{entry.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-200">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Execution Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="triggers" fill="#8b5cf6" name="Trigger Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}