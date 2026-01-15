import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Brain, Lightbulb, Zap, TrendingUp, Clock, Target, Globe, Search, BarChart3 } from 'lucide-react';
import { ChromeHistoryAnalyzer } from '../../entities/ChromeHistoryAnalyzer';
import { ActionPredictor } from '../../entities/ActionPredictor';
import { SmartSuggestionEngine } from '../../entities/SmartSuggestionEngine';

export default function ChromeHistoryPrediction() {
  const [chromeData, setChromeData] = useState(null);
  const [behavioralInsights, setBehavioralInsights] = useState(null);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [workflowSuggestions, setWorkflowSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChromeExtension, setIsChromeExtension] = useState(false);

  useEffect(() => {
    checkChromeExtension();
    initializeAnalysis();
  }, []);

  const checkChromeExtension = () => {
    // Check if Chrome extension is available
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      setIsChromeExtension(true);
      console.log('Chrome extension detected');
    } else {
      console.log('Chrome extension not available, using mock data');
    }
  };

  const initializeAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analyzer = new ChromeHistoryAnalyzer();
      const insights = await analyzer.getBehavioralInsights();
      setBehavioralInsights(insights);

      // Get Chrome-specific data if available
      if (isChromeExtension) {
        const chromeData = await getChromeExtensionData();
        setChromeData(chromeData);
      }

      // Generate predictions using enhanced data
      await generateEnhancedPredictions(insights);
    } catch (error) {
      console.error('Error initializing analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getChromeExtensionData = async () => {
    try {
      // Request data from Chrome extension
      const response = await chrome.runtime.sendMessage({
        action: 'getBehavioralData',
        timeRange: 24
      });

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Error getting Chrome extension data:', error);
    }
    return null;
  };

  const generateEnhancedPredictions = async (insights) => {
    try {
      const predictor = new ActionPredictor();
      const suggestionEngine = new SmartSuggestionEngine();

      // Create enhanced behavioral session with Chrome data
      const enhancedSession = {
        duration_seconds: 3600, // Mock duration
        mouseMovements: insights.browsingPatterns.researchIntensive * 10,
        keystrokes: insights.browsingPatterns.highProductivity * 15,
        scrollEvents: insights.browsingPatterns.researchIntensive * 2,
        windowSwitches: insights.browsingPatterns.socialMedia * 3,
        gazePoints: insights.focusPatterns * 100,
        chromeData: chromeData,
        insights: insights
      };

      // Get action prediction
      const prediction = predictor.predictNextAction(enhancedSession);
      setCurrentPrediction(prediction);

      // Get smart suggestions
      const suggestions = suggestionEngine.generatePersonalizedSuggestions(enhancedSession);
      
      // Get workflow suggestions
      const workflows = await getWorkflowSuggestions(prediction);
      setWorkflowSuggestions(workflows);
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const getWorkflowSuggestions = async (prediction) => {
    // Mock workflow data - in real app, fetch from Workflow entity
    const mockWorkflows = [
      {
        id: '1',
        name: 'Research Assistant',
        description: 'Automated research workflow based on browsing patterns',
        success_rate: 0.89,
        relevance_score: 0.92
      },
      {
        id: '2',
        name: 'Productivity Booster',
        description: 'Focus enhancement based on current work style',
        success_rate: 0.85,
        relevance_score: 0.88
      }
    ];

    return mockWorkflows;
  };

  const refreshAnalysis = () => {
    initializeAnalysis();
  };

  const formatActionName = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidenceVariant = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'destructive';
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Analyzing Chrome browsing patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chrome Extension Status */}
      <Card className="border-blue-500/20 bg-gradient-to-r from-slate-900/50 to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Globe className="w-5 h-5" />
            Chrome History Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={isChromeExtension ? 'success' : 'secondary'}>
                {isChromeExtension ? 'Connected' : 'Not Available'}
              </Badge>
              <span className="text-sm text-slate-400">
                {isChromeExtension 
                  ? 'Real-time browsing data available' 
                  : 'Using enhanced mock data for demonstration'
                }
              </span>
            </div>
            <Button onClick={refreshAnalysis} variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Prediction */}
      {currentPrediction && (
        <Card className="border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-cyan-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Brain className="w-5 h-5" />
              Enhanced Action Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {formatActionName(currentPrediction.action)}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Based on Chrome browsing patterns and behavioral analysis
                  </p>
                </div>
              </div>
              <Badge variant={getConfidenceVariant(currentPrediction.confidence)}>
                {Math.round(currentPrediction.confidence * 100)}% Confidence
              </Badge>
            </div>

            <Progress 
              value={currentPrediction.confidence * 100} 
              className="h-2"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Smart Suggestions
                </h4>
                <ul className="space-y-2">
                  {currentPrediction.suggestions?.map((suggestion, index) => (
                    <li key={index} className="text-sm text-slate-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  Contextual Tips
                </h4>
                <ul className="space-y-2">
                  {currentPrediction.contextualSuggestions?.map((tip, index) => (
                    <li key={index} className="text-sm text-slate-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chrome Browsing Insights */}
      {behavioralInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Chrome Browsing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Work Style</span>
                </div>
                <div className="text-lg font-bold text-blue-400 capitalize">
                  {behavioralInsights.workStyle.replace('_', ' ')}
                </div>
                <p className="text-xs text-slate-400 mt-1">Based on browsing patterns</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-300">Productivity Score</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  {Math.round(behavioralInsights.productivityScore)}%
                </div>
                <p className="text-xs text-slate-400 mt-1">Based on domain analysis</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-slate-300">Focus Patterns</span>
                </div>
                <div className="text-lg font-bold text-purple-400">
                  {Math.round(behavioralInsights.focusPatterns)}%
                </div>
                <p className="text-xs text-slate-400 mt-1">Based on time concentration</p>
              </div>
            </div>

            {/* Browsing Pattern Breakdown */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Browsing Pattern Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(behavioralInsights.browsingPatterns).map(([pattern, count]) => (
                  <div key={pattern} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 capitalize">
                      {pattern.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{count}</span>
                      <Progress 
                        value={(count / Math.max(...Object.values(behavioralInsights.browsingPatterns))) * 100} 
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chrome Extension Data */}
      {chromeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Real-Time Chrome Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chromeData.currentContext && (
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Current Context</h4>
                  <div className="text-sm text-slate-300">
                    <p><strong>Domain:</strong> {chromeData.currentContext.domain}</p>
                    <p><strong>Category:</strong> {chromeData.currentContext.category}</p>
                    <p><strong>Title:</strong> {chromeData.currentContext.title}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">
                    {chromeData.totalVisits}
                  </div>
                  <div className="text-sm text-slate-400">Total Visits</div>
                </div>
                
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {chromeData.uniqueDomains}
                  </div>
                  <div className="text-sm text-slate-400">Unique Domains</div>
                </div>
                
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {chromeData.patterns.productivity}
                  </div>
                  <div className="text-sm text-slate-400">Productivity Sites</div>
                </div>
                
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {chromeData.patterns.research}
                  </div>
                  <div className="text-sm text-slate-400">Research Sites</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Suggestions */}
      {workflowSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Recommended Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowSuggestions.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{workflow.name}</h4>
                    <p className="text-sm text-slate-400">{workflow.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(workflow.relevance_score * 100)}% Relevant
                      </Badge>
                      <Badge variant="success" className="text-xs">
                        {Math.round(workflow.success_rate * 100)}% Success
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Activate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
