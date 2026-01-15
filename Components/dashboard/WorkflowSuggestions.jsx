import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Settings } from "lucide-react";
import { motion } from "framer-motion";

const SAMPLE_WORKFLOWS = [
  {
    name: "Daily Sales Report",
    description: "Open spreadsheet, fetch latest data, generate charts",
    confidence: 0.89,
    category: "productivity",
    estimatedTime: "3 min"
  },
  {
    name: "Team Standup Prep",
    description: "Open Slack, review tickets, prepare status update",
    confidence: 0.76,
    category: "communication", 
    estimatedTime: "2 min"
  },
  {
    name: "Code Review Session",
    description: "Open GitHub, review PRs, run test suite",
    confidence: 0.71,
    category: "development",
    estimatedTime: "15 min"
  }
];

export default function WorkflowSuggestions({ workflows, isCapturing }) {
  const getCategoryColor = (category) => {
    const colors = {
      productivity: "bg-green-500/20 text-green-400 border-green-500/30",
      communication: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
      development: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    };
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Suggested Workflows
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SAMPLE_WORKFLOWS.map((workflow, index) => (
          <motion.div
            key={workflow.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-200 mb-1">{workflow.name}</h4>
                <p className="text-sm text-slate-400">{workflow.description}</p>
              </div>
              <Badge variant="outline" className={getCategoryColor(workflow.category)}>
                {workflow.category}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Match: {Math.round(workflow.confidence * 100)}%</span>
                <span>Est: {workflow.estimatedTime}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                  disabled={!isCapturing}
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                  disabled={!isCapturing}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Run
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {!isCapturing && (
          <div className="text-center py-6 text-slate-500">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Start capture to see workflow suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}