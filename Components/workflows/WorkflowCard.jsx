import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Workflow } from "@/entities/Workflow";
import { 
  Play, 
  Pause, 
  Settings, 
  MoreVertical,
  TrendingUp,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WorkflowCard({ workflow, onUpdate, index }) {
  const [isToggling, setIsToggling] = useState(false);

  const toggleWorkflow = async () => {
    setIsToggling(true);
    try {
      const updated = await Workflow.update(workflow.id, { 
        ...workflow,
        is_active: !workflow.is_active 
      });
      onUpdate(updated);
    } catch (error) {
      console.error("Error toggling workflow:", error);
    }
    setIsToggling(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      productivity: "bg-green-500/20 text-green-400 border-green-500/30",
      communication: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      development: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      research: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      creative: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      custom: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[category] || colors.custom;
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      productivity: "from-green-400 to-emerald-500",
      communication: "from-blue-400 to-cyan-500", 
      development: "from-purple-400 to-pink-500",
      research: "from-orange-400 to-red-500",
      creative: "from-pink-400 to-rose-500",
      custom: "from-gray-400 to-slate-500"
    };
    return gradients[category] || gradients.custom;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl hover:bg-slate-800/30 transition-all duration-300 group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getCategoryGradient(workflow.category)} flex items-center justify-center`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-slate-200 text-lg group-hover:text-white transition-colors">
                  {workflow.name}
                </CardTitle>
                <Badge variant="outline" className={`mt-1 ${getCategoryColor(workflow.category)}`}>
                  {workflow.category}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Workflow
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-slate-400 text-sm leading-relaxed">
            {workflow.description}
          </p>

          <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-800/50">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">
                {Math.round((workflow.confidence_threshold || 0) * 100)}%
              </div>
              <div className="text-xs text-slate-500">Threshold</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {workflow.times_triggered || 0}
              </div>
              <div className="text-xs text-slate-500">Triggered</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {workflow.actions?.length || 0}
              </div>
              <div className="text-xs text-slate-500">Actions</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch 
                checked={workflow.is_active}
                onCheckedChange={toggleWorkflow}
                disabled={isToggling}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm text-slate-400">
                {workflow.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
              disabled={!workflow.is_active}
            >
              <Play className="w-3 h-3 mr-1" />
              Test Run
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}