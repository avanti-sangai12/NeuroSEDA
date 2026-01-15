import React, { useState } from 'react';
import { Workflow } from "@/entities/Workflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save } from "lucide-react";

const ACTION_TYPES = [
  { value: "open_app", label: "Open Application" },
  { value: "navigate_url", label: "Navigate to URL" },
  { value: "send_message", label: "Send Message" },
  { value: "create_document", label: "Create Document" },
  { value: "run_script", label: "Run Script" }
];

const CATEGORIES = [
  { value: "productivity", label: "Productivity" },
  { value: "communication", label: "Communication" },
  { value: "development", label: "Development" },
  { value: "research", label: "Research" },
  { value: "creative", label: "Creative" },
  { value: "custom", label: "Custom" }
];

export default function CreateWorkflowDialog({ open, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "custom",
    confidence_threshold: [80],
    actions: []
  });
  const [isCreating, setIsCreating] = useState(false);

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: "open_app", target: "", parameters: {} }]
    }));
  };

  const removeAction = (index) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || formData.actions.length === 0) return;

    setIsCreating(true);
    try {
      const workflowData = {
        ...formData,
        confidence_threshold: formData.confidence_threshold[0] / 100,
        trigger_pattern: [0.5, 0.7, 0.3, 0.9, 0.6], // Sample pattern
        is_active: true,
        times_triggered: 0
      };

      const newWorkflow = await Workflow.create(workflowData);
      onCreate(newWorkflow);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "custom",
        confidence_threshold: [80],
        actions: []
      });
    } catch (error) {
      console.error("Error creating workflow:", error);
    }
    setIsCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-800 text-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create New Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow does..."
                className="bg-slate-800 border-slate-700 h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Confidence Threshold: {formData.confidence_threshold[0]}%</Label>
              <Slider
                value={formData.confidence_threshold}
                onValueChange={(value) => setFormData(prev => ({ ...prev, confidence_threshold: value }))}
                max={100}
                min={50}
                step={5}
                className="py-4"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Actions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                className="border-slate-700 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Action
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {formData.actions.map((action, index) => (
                <div key={index} className="p-4 border border-slate-800 rounded-lg bg-slate-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300">Action {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction(index)}
                      className="hover:bg-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={action.type}
                      onValueChange={(value) => updateAction(index, 'type', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {ACTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={action.target}
                      onChange={(e) => updateAction(index, 'target', e.target.value)}
                      placeholder="Target (URL, app name, etc.)"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              ))}
              
              {formData.actions.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No actions added yet. Click "Add Action" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-slate-700 hover:bg-slate-800">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!formData.name.trim() || formData.actions.length === 0 || isCreating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}