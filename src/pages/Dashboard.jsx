import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Brain, Activity, Zap, Target, TrendingUp } from 'lucide-react';
import ActionPrediction from '../components/dashboard/ActionPrediction';
import RealTimeBehaviorMonitor from '../components/dashboard/RealTimeBehaviorMonitor';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Neural Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Real-time behavioral intelligence and intent prediction</p>
          </div>
          <Button variant="gradient" size="lg">
            <Zap className="w-4 h-4 mr-2" />
            Start Capture
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1"
          >
            <Brain className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'predictions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('predictions')}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            Action Predictions
          </Button>
          <Button
            variant={activeTab === 'monitor' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('monitor')}
            className="flex-1"
          >
            <Activity className="w-4 h-4 mr-2" />
            Live Monitor
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Intent Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">87%</div>
              <Progress value={87} className="mt-2" />
              <p className="text-sm text-slate-400 mt-2">High confidence in current prediction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Active Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">1,247</div>
              <Badge variant="success" className="mt-2">Live</Badge>
              <p className="text-sm text-slate-400 mt-2">Real-time behavioral data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">3</div>
              <Badge variant="info" className="mt-2">Active</Badge>
              <p className="text-sm text-slate-400 mt-2">Automated processes running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-400" />
                AI Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">Online</div>
              <Badge variant="success" className="mt-2">Ready</Badge>
              <p className="text-sm text-slate-400 mt-2">Neural engine operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Intent Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-400">87%</div>
                  <Progress value={87} className="mt-2" />
                  <p className="text-sm text-slate-400 mt-2">High confidence in current prediction</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Active Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">1,247</div>
                  <Badge variant="success" className="mt-2">Live</Badge>
                  <p className="text-sm text-slate-400 mt-2">Real-time behavioral data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">3</div>
                  <Badge variant="info" className="mt-2">Active</Badge>
                  <p className="text-sm text-slate-400 mt-2">Automated processes running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-400" />
                    AI Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">Online</div>
                  <Badge variant="success" className="mt-2">Ready</Badge>
                  <p className="text-sm text-slate-400 mt-2">Neural engine operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome to NeuroSEDA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Your behavioral intelligence dashboard is now running successfully! This application monitors user behavior patterns 
                  and provides real-time insights to improve productivity and workflow automation.
                </p>
                <div className="flex gap-2">
                  <Badge variant="success">React 18</Badge>
                  <Badge variant="info">Tailwind CSS</Badge>
                  <Badge variant="warning">Lucide Icons</Badge>
                  <Badge variant="secondary">Framer Motion</Badge>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'predictions' && (
          <ActionPrediction />
        )}

        {activeTab === 'monitor' && (
          <RealTimeBehaviorMonitor />
        )}
      </div>
    </div>
  );
}
