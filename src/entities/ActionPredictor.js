export class ActionPredictor {
  constructor() {
    this.patternWeights = {
      mouseMovements: 0.25,
      keystrokes: 0.30,
      scrollEvents: 0.15,
      windowSwitches: 0.20,
      gazePoints: 0.10
    };
    
    this.actionPatterns = {
      'document_editing': {
        triggers: ['high_typing_speed', 'low_mouse_movement', 'focused_gaze'],
        confidence_threshold: 0.75,
        suggestions: ['Auto-save enabled', 'Format suggestions', 'Template recommendations']
      },
      'research_browsing': {
        triggers: ['high_scroll_rate', 'multiple_tabs', 'search_patterns'],
        confidence_threshold: 0.70,
        suggestions: ['Bookmark manager', 'Research notes', 'Source organizer']
      },
      'communication': {
        triggers: ['typing_pauses', 'window_switching', 'notification_responses'],
        confidence_threshold: 0.80,
        suggestions: ['Quick replies', 'Meeting scheduler', 'Contact shortcuts']
      },
      'creative_work': {
        triggers: ['long_gaze_focus', 'slow_precise_mouse', 'extended_sessions'],
        confidence_threshold: 0.65,
        suggestions: ['Inspiration gallery', 'Color palette', 'Asset library']
      },
      'data_analysis': {
        triggers: ['repetitive_patterns', 'data_entry', 'calculation_focus'],
        confidence_threshold: 0.85,
        suggestions: ['Data validation', 'Chart templates', 'Formula library']
      }
    };
  }

  analyzeBehavioralPattern(session) {
    const patterns = {
      high_typing_speed: session.keystrokes > 500,
      low_mouse_movement: session.mouseMovements < 1000,
      focused_gaze: session.gazePoints > 1500,
      high_scroll_rate: session.scrollEvents > 50,
      multiple_tabs: session.windowSwitches > 5,
      typing_pauses: session.keystrokes > 200 && session.keystrokes < 800,
      slow_precise_mouse: session.mouseMovements > 800 && session.mouseMovements < 1500,
      extended_sessions: session.duration_seconds > 1800,
      repetitive_patterns: session.keystrokes > 1000,
      data_entry: session.keystrokes > 800 && session.mouseMovements < 500
    };

    return patterns;
  }

  calculateIntentScore(session) {
    const patterns = this.analyzeBehavioralPattern(session);
    let score = 0;
    let totalWeight = 0;

    // Calculate weighted score based on behavioral metrics
    Object.entries(this.patternWeights).forEach(([metric, weight]) => {
      const normalizedValue = this.normalizeMetric(session[metric], metric);
      score += normalizedValue * weight;
      totalWeight += weight;
    });

    // Adjust score based on pattern matches
    const patternMatches = Object.values(patterns).filter(Boolean).length;
    const patternBonus = (patternMatches / Object.keys(patterns).length) * 0.2;

    return Math.min(1.0, (score / totalWeight) + patternBonus);
  }

  normalizeMetric(value, metric) {
    const maxValues = {
      mouseMovements: 2000,
      keystrokes: 1500,
      scrollEvents: 100,
      windowSwitches: 20,
      gazePoints: 3000
    };

    return Math.min(1.0, value / maxValues[metric]);
  }

  predictNextAction(session) {
    const patterns = this.analyzeBehavioralPattern(session);
    const intentScore = this.calculateIntentScore(session);
    
    let bestPrediction = null;
    let highestConfidence = 0;

    // Analyze each action pattern
    Object.entries(this.actionPatterns).forEach(([action, config]) => {
      const patternMatch = config.triggers.filter(trigger => patterns[trigger]).length;
      const confidence = (patternMatch / config.triggers.length) * intentScore;

      if (confidence > highestConfidence && confidence >= config.confidence_threshold) {
        highestConfidence = confidence;
        bestPrediction = {
          action: action,
          confidence: confidence,
          suggestions: config.suggestions,
          triggers: config.triggers.filter(trigger => patterns[trigger])
        };
      }
    });

    // Generate contextual suggestions
    if (bestPrediction) {
      bestPrediction.contextualSuggestions = this.generateContextualSuggestions(
        bestPrediction.action, 
        session, 
        patterns
      );
    }

    return bestPrediction || {
      action: 'general_workflow',
      confidence: intentScore * 0.5,
      suggestions: ['Productivity tips', 'Workflow optimization', 'Focus enhancement'],
      contextualSuggestions: ['Take a short break', 'Review current tasks', 'Optimize workspace']
    };
  }

  generateContextualSuggestions(action, session, patterns) {
    const suggestions = {
      'document_editing': [
        session.duration_seconds > 3600 ? 'Consider taking a break' : 'Continue with current focus',
        'Enable auto-save for safety',
        'Use keyboard shortcuts for efficiency'
      ],
      'research_browsing': [
        'Organize findings in a structured way',
        'Use bookmarks for important sources',
        'Consider using research tools'
      ],
      'communication': [
        'Set up quick reply templates',
        'Schedule follow-up reminders',
        'Use communication shortcuts'
      ],
      'creative_work': [
        'Save work frequently',
        'Use inspiration boards',
        'Take creative breaks'
      ],
      'data_analysis': [
        'Validate data accuracy',
        'Use templates for consistency',
        'Backup important calculations'
      ]
    };

    return suggestions[action] || suggestions['general_workflow'];
  }

  getWorkflowSuggestions(prediction, workflows) {
    if (!prediction || !workflows) return [];

    const relevantWorkflows = workflows.filter(workflow => {
      // Check if workflow actions align with predicted action
      const actionAlignment = workflow.actions.some(action => 
        action.toLowerCase().includes(prediction.action.replace('_', ' '))
      );
      
      // Check if workflow is active and has good success rate
      const qualityCheck = workflow.is_active && workflow.success_rate > 0.7;
      
      return actionAlignment && qualityCheck;
    });

    return relevantWorkflows
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 3)
      .map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        success_rate: workflow.success_rate,
        relevance_score: this.calculateWorkflowRelevance(workflow, prediction)
      }));
  }

  calculateWorkflowRelevance(workflow, prediction) {
    let score = 0;
    
    // Base score from success rate
    score += workflow.success_rate * 0.4;
    
    // Action alignment score
    const actionMatch = workflow.actions.some(action => 
      action.toLowerCase().includes(prediction.action.replace('_', ' '))
    );
    score += actionMatch ? 0.3 : 0;
    
    // Recent execution bonus
    if (workflow.last_executed) {
      const daysSinceExecution = (Date.now() - new Date(workflow.last_executed)) / (1000 * 60 * 60 * 24);
      if (daysSinceExecution < 7) score += 0.2;
      else if (daysSinceExecution < 30) score += 0.1;
    }
    
    // Execution count bonus
    score += Math.min(0.1, workflow.execution_count / 1000);
    
    return Math.min(1.0, score);
  }

  static async getPredictionHistory(limit = 10) {
    // Mock prediction history
    const mockHistory = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        predicted_action: 'document_editing',
        confidence: 0.89,
        actual_action: 'document_editing',
        accuracy: true,
        suggestions_used: ['Auto-save enabled', 'Format suggestions']
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        predicted_action: 'research_browsing',
        confidence: 0.76,
        actual_action: 'research_browsing',
        accuracy: true,
        suggestions_used: ['Bookmark manager', 'Research notes']
      }
    ];
    
    return mockHistory.slice(0, limit);
  }
}
