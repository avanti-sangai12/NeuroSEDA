import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Activity, Eye, MousePointer, Keyboard, Scroll, Monitor, Play, Pause, Square } from 'lucide-react';

export default function RealTimeBehaviorMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    mouseMovements: 0,
    keystrokes: 0,
    scrollEvents: 0,
    windowSwitches: 0,
    gazePoints: 0,
    sessionDuration: 0
  });
  const [behavioralPatterns, setBehavioralPatterns] = useState([]);
  const [sessionStart, setSessionStart] = useState(null);
  const [predictionUpdates, setPredictionUpdates] = useState([]);
  
  const monitoringInterval = useRef(null);
  const sessionInterval = useRef(null);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isMonitoring]);

  const startMonitoring = () => {
    setSessionStart(Date.now());
    
    // Start session timer
    sessionInterval.current = setInterval(() => {
      setCurrentMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
      }));
    }, 1000);

    // Start behavioral monitoring
    monitoringInterval.current = setInterval(() => {
      updateBehavioralMetrics();
    }, 2000); // Update every 2 seconds
  };

  const stopMonitoring = () => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    if (sessionInterval.current) {
      clearInterval(sessionInterval.current);
      sessionInterval.current = null;
    }
  };

  const updateBehavioralMetrics = () => {
    // Simulate real-time behavioral data
    const newMetrics = {
      mouseMovements: currentMetrics.mouseMovements + Math.floor(Math.random() * 50),
      keystrokes: currentMetrics.keystrokes + Math.floor(Math.random() * 20),
      scrollEvents: currentMetrics.scrollEvents + Math.floor(Math.random() * 5),
      windowSwitches: currentMetrics.windowSwitches + Math.floor(Math.random() * 2),
      gazePoints: currentMetrics.gazePoints + Math.floor(Math.random() * 100),
      sessionDuration: currentMetrics.sessionDuration
    };

    setCurrentMetrics(newMetrics);
    analyzeBehavioralPatterns(newMetrics);
  };

  const analyzeBehavioralPatterns = (metrics) => {
    const patterns = [];
    
    // Analyze typing patterns
    if (metrics.keystrokes > 100) {
      patterns.push({
        type: 'typing_intensity',
        description: 'High typing activity detected',
        confidence: Math.min(0.9, metrics.keystrokes / 200),
        timestamp: new Date().toISOString()
      });
    }

    // Analyze mouse movement patterns
    if (metrics.mouseMovements > 500) {
      patterns.push({
        type: 'navigation_activity',
        description: 'Active navigation detected',
        confidence: Math.min(0.8, metrics.mouseMovements / 1000),
        timestamp: new Date().toISOString()
      });
    }

    // Analyze focus patterns
    if (metrics.gazePoints > 1000 && metrics.windowSwitches < 3) {
      patterns.push({
        type: 'focused_work',
        description: 'Sustained focus detected',
        confidence: 0.85,
        timestamp: new Date().toISOString()
      });
    }

    // Analyze multitasking patterns
    if (metrics.windowSwitches > 5) {
      patterns.push({
        type: 'multitasking',
        description: 'Multiple task switching detected',
        confidence: 0.75,
        timestamp: new Date().toISOString()
      });
    }

    if (patterns.length > 0) {
      setBehavioralPatterns(prev => [...patterns.slice(-5), ...prev.slice(0, 4)]);
      
      // Add prediction updates
      const predictionUpdate = {
        id: Date.now(),
        pattern: patterns[0],
        predictedAction: predictActionFromPattern(patterns[0]),
        timestamp: new Date().toISOString()
      };
      
      setPredictionUpdates(prev => [predictionUpdate, ...prev.slice(0, 4)]);
    }
  };

  const predictActionFromPattern = (pattern) => {
    const actionMap = {
      'typing_intensity': 'Document editing or communication',
      'navigation_activity': 'Research or browsing',
      'focused_work': 'Deep work or analysis',
      'multitasking': 'Project management or coordination'
    };
    
    return actionMap[pattern.type] || 'General workflow';
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const resetSession = () => {
    setCurrentMetrics({
      mouseMovements: 0,
      keystrokes: 0,
      scrollEvents: 0,
      windowSwitches: 0,
      gazePoints: 0,
      sessionDuration: 0
    });
    setBehavioralPatterns([]);
    setPredictionUpdates([]);
    setSessionStart(null);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Real-Time Behavior Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={toggleMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              size="lg"
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
            
            {isMonitoring && (
              <Button onClick={resetSession} variant="outline" size="lg">
                <Square className="w-4 h-4 mr-2" />
                Reset Session
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">
                {formatDuration(currentMetrics.sessionDuration)}
              </div>
              <div className="text-sm text-slate-400">Session Duration</div>
            </div>
            
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {currentMetrics.keystrokes}
              </div>
              <div className="text-sm text-slate-400">Keystrokes</div>
            </div>
            
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {currentMetrics.mouseMovements}
              </div>
              <div className="text-sm text-slate-400">Mouse Movements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Live Behavioral Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Mouse Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{currentMetrics.mouseMovements}</span>
                <Progress 
                  value={Math.min(100, (currentMetrics.mouseMovements / 2000) * 100)} 
                  className="w-20 h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-green-400" />
                <span className="text-sm">Typing Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{currentMetrics.keystrokes}</span>
                <Progress 
                  value={Math.min(100, (currentMetrics.keystrokes / 1500) * 100)} 
                  className="w-20 h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Scroll Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{currentMetrics.scrollEvents}</span>
                <Progress 
                  value={Math.min(100, (currentMetrics.scrollEvents / 100) * 100)} 
                  className="w-20 h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Focus Points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{currentMetrics.gazePoints}</span>
                <Progress 
                  value={Math.min(100, (currentMetrics.gazePoints / 3000) * 100)} 
                  className="w-20 h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Patterns */}
      {behavioralPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Detected Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {behavioralPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {pattern.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-slate-400">
                        {Math.round(pattern.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-white">{pattern.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(pattern.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Updates */}
      {predictionUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Live Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictionUpdates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs text-cyan-400">
                        New Prediction
                      </Badge>
                    </div>
                    <p className="text-sm text-white">{update.predictedAction}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Based on {update.pattern.type.replace('_', ' ')} pattern
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
