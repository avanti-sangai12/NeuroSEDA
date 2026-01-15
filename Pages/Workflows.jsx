import React, { useState, useEffect } from "react";
import { Workflow } from "@/entities/Workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Zap, 
  Settings, 
  Play,
  Pause,
  MoreVertical,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WorkflowCard from "../Components/workflows/WorkflowCard";
import CreateWorkflowDialog from "../components/workflows/CreateWorkflowDialog";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setIsLoading(true);
    const data = await Workflow.list('-created_date');
    setWorkflows(data);
    setIsLoading(false);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || workflow.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "productivity", "communication", "development", "research", "creative", "custom"];
  
  const getCategoryCount = (category) => {
    if (category === "all") return workflows.length;
    return workflows.filter(w => w.category === category).length;
  };

  const handleWorkflowUpdate = (updatedWorkflow) => {
    setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
  };

  const handleWorkflowCreate = (newWorkflow) => {
    setWorkflows(prev => [newWorkflow, ...prev]);
    setShowCreateDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Workflow Automation
            </h1>
            <p className="text-slate-400 text-lg">Create and manage intelligent workflow automations</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Workflow
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Workflows</p>
                  <p className="text-2xl font-bold text-slate-200">{workflows.length}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {workflows.filter(w => w.is_active).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Triggers</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {workflows.reduce((sum, w) => sum + (w.times_triggered || 0), 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Confidence</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {Math.round(workflows.reduce((sum, w) => sum + (w.confidence_threshold || 0), 0) / (workflows.length || 1) * 100)}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder-slate-400"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                  : "border-slate-700 hover:bg-slate-800"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} ({getCategoryCount(category)})
              </Button>
            ))}
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-800/50 animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-slate-800 rounded"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-800 rounded"></div>
                      <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredWorkflows.length > 0 ? (
              filteredWorkflows.map((workflow, index) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onUpdate={handleWorkflowUpdate}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No workflows found</p>
                <p className="text-slate-500">Create your first workflow to get started</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateWorkflowDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleWorkflowCreate}
      />
    </div>
  );
}