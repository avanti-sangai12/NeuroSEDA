import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Brain, Lightbulb, Zap, TrendingUp, Clock, Target } from 'lucide-react';
import { ActionPredictor } from '../../entities/ActionPredictor';
import { BehavioralSession } from '../../entities/BehaviouralSession';
import { Workflow } from '../../entities/Workflow';

export default function ActionPrediction() {
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [workflowSuggestions, setWorkflowSuggestions] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    initializePrediction();
    loadPredictionHistory();
  }, []);

  const initializePrediction = async () => {
    setIsAnalyzing(true);
    try {
      // Get current behavioral session
      const sessions = await BehavioralSession.list();
      const latestSession = sessions[0];
      setCurrentSession(latestSession);

      // Create predictor and get prediction
      const predictor = new ActionPredictor();
      const prediction = predictor.predictNextAction(latestSession);
      setCurrentPrediction(prediction);

      // Get workflow suggestions
      const workflows = await Workflow.list();
      const suggestions = predictor.getWorkflowSuggestions(prediction, workflows);
      setWorkflowSuggestions(suggestions);
    } catch (error) {
      console.error('Error initializing prediction:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadPredictionHistory = async () => {
    try {
      const history = await ActionPredictor.getPredictionHistory();
      setPredictionHistory(history);
    } catch (error) {
      console.error('Error loading prediction history:', error);
    }
  };

  const refreshPrediction = () => {
    initializePrediction();
  };

  const formatActionName = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
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
          <p className="text-slate-400">Analyzing behavioral patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Prediction */}
      <Card className="border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-cyan-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Brain className="w-5 h-5" />
            Current Action Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPrediction && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-cyan-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {formatActionName(currentPrediction.action)}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Based on {currentPrediction.triggers?.length || 0} behavioral patterns
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

              <div className="flex gap-2">
                <Button onClick={refreshPrediction} variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
                <Button variant="gradient" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Apply Suggestions
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Prediction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Prediction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictionHistory.map((prediction) => (
              <div key={prediction.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {formatActionName(prediction.predicted_action)}
                    </span>
                    <Badge 
                      variant={prediction.accuracy ? 'success' : 'destructive'}
                      className="text-xs"
                    >
                      {prediction.accuracy ? 'Accurate' : 'Inaccurate'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">
                    {Math.round(prediction.confidence * 100)}% confidence • 
                    {new Date(prediction.timestamp).toLocaleTimeString()}
                  </p>
                  {prediction.suggestions_used && (
                    <p className="text-xs text-slate-500 mt-1">
                      Used: {prediction.suggestions_used.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
