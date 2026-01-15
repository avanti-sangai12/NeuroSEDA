import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Brain, 
  Shield, 
  Monitor,
  Zap,
  Bell,
  Eye,
  Save,
  RotateCcw
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Capture Settings
    mouseSensitivity: [75],
    keystrokeSensitivity: [80],
    scrollSensitivity: [70],
    windowSwitchSensitivity: [85],
    gazeTracking: true,
    
    // AI Settings  
    predictionConfidence: [80],
    learningMode: true,
    adaptiveThresholds: true,
    contextAwareness: true,
    
    // Privacy Settings
    dataRetention: "30d",
    anonymizeData: true,
    shareAnalytics: false,
    encryptLocally: true,
    
    // Notifications
    workflowSuggestions: true,
    patternAlerts: true,
    systemUpdates: false,
    weeklyReports: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Save settings logic here
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    // Reset logic here
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
              System Settings
            </h1>
            <p className="text-slate-400 text-lg">Configure behavioral capture and AI preferences</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="border-slate-700 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="capture" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 grid grid-cols-4">
            <TabsTrigger value="capture" className="data-[state=active]:bg-slate-800">
              <Monitor className="w-4 h-4 mr-2" />
              Capture
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-slate-800">
              <Brain className="w-4 h-4 mr-2" />
              AI Engine
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-slate-800">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-800">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Capture Settings */}
          <TabsContent value="capture" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  Behavioral Signal Capture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Mouse Sensitivity: {settings.mouseSensitivity[0]}%
                    </Label>
                    <Slider
                      value={settings.mouseSensitivity}
                      onValueChange={(value) => updateSetting('mouseSensitivity', value)}
                      max={100}
                      min={10}
                      step={5}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Keystroke Sensitivity: {settings.keystrokeSensitivity[0]}%
                    </Label>
                    <Slider
                      value={settings.keystrokeSensitivity}
                      onValueChange={(value) => updateSetting('keystrokeSensitivity', value)}
                      max={100}
                      min={10}
                      step={5}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Scroll Sensitivity: {settings.scrollSensitivity[0]}%
                    </Label>
                    <Slider
                      value={settings.scrollSensitivity}
                      onValueChange={(value) => updateSetting('scrollSensitivity', value)}
                      max={100}
                      min={10}
                      step={5}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Window Switch Sensitivity: {settings.windowSwitchSensitivity[0]}%
                    </Label>
                    <Slider
                      value={settings.windowSwitchSensitivity}
                      onValueChange={(value) => updateSetting('windowSwitchSensitivity', value)}
                      max={100}
                      min={10}
                      step={5}
                      className="py-4"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <div>
                      <Label className="text-slate-300">Gaze Tracking (Beta)</Label>
                      <p className="text-sm text-slate-500">Use webcam for gaze pattern analysis</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.gazeTracking}
                    onCheckedChange={(value) => updateSetting('gazeTracking', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Intelligence Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Prediction Confidence Threshold: {settings.predictionConfidence[0]}%
                  </Label>
                  <Slider
                    value={settings.predictionConfidence}
                    onValueChange={(value) => updateSetting('predictionConfidence', value)}
                    max={95}
                    min={50}
                    step={5}
                    className="py-4"
                  />
                  <p className="text-xs text-slate-500">
                    Higher values = more accurate but fewer suggestions
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Adaptive Learning</Label>
                      <p className="text-sm text-slate-500">AI learns from your behavior patterns</p>
                    </div>
                    <Switch
                      checked={settings.learningMode}
                      onCheckedChange={(value) => updateSetting('learningMode', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Dynamic Thresholds</Label>
                      <p className="text-sm text-slate-500">Automatically adjust sensitivity based on usage</p>
                    </div>
                    <Switch
                      checked={settings.adaptiveThresholds}
                      onCheckedChange={(value) => updateSetting('adaptiveThresholds', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Context Awareness</Label>
                      <p className="text-sm text-slate-500">Consider time, applications, and environment</p>
                    </div>
                    <Switch
                      checked={settings.contextAwareness}
                      onCheckedChange={(value) => updateSetting('contextAwareness', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Data Retention Period</Label>
                  <Select
                    value={settings.dataRetention}
                    onValueChange={(value) => updateSetting('dataRetention', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Anonymize Data</Label>
                      <p className="text-sm text-slate-500">Remove personally identifiable information</p>
                    </div>
                    <Switch
                      checked={settings.anonymizeData}
                      onCheckedChange={(value) => updateSetting('anonymizeData', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Share Analytics</Label>
                      <p className="text-sm text-slate-500">Help improve NeuroSEDA with anonymous usage data</p>
                    </div>
                    <Switch
                      checked={settings.shareAnalytics}
                      onCheckedChange={(value) => updateSetting('shareAnalytics', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Local Encryption</Label>
                      <p className="text-sm text-slate-500">Encrypt all data stored on this device</p>
                    </div>
                    <Switch
                      checked={settings.encryptLocally}
                      onCheckedChange={(value) => updateSetting('encryptLocally', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <div>
                      <Label className="text-slate-300">Workflow Suggestions</Label>
                      <p className="text-sm text-slate-500">Get notified about potential workflow matches</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.workflowSuggestions}
                    onCheckedChange={(value) => updateSetting('workflowSuggestions', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <Label className="text-slate-300">Pattern Alerts</Label>
                      <p className="text-sm text-slate-500">Notify when new behavioral patterns are detected</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.patternAlerts}
                    onCheckedChange={(value) => updateSetting('patternAlerts', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5 text-orange-400" />
                    <div>
                      <Label className="text-slate-300">System Updates</Label>
                      <p className="text-sm text-slate-500">Notifications about system updates and maintenance</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(value) => updateSetting('systemUpdates', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-green-400" />
                    <div>
                      <Label className="text-slate-300">Weekly Reports</Label>
                      <p className="text-sm text-slate-500">Receive weekly behavioral insights and summaries</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(value) => updateSetting('weeklyReports', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}