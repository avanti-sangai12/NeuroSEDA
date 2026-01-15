export class SmartSuggestionEngine {
  constructor() {
    this.suggestionHistory = [];
    this.userPreferences = {};
    this.learningWeights = {
      clickThrough: 0.3,
      timeSpent: 0.2,
      userRating: 0.4,
      workflowActivation: 0.1
    };
    
    this.suggestionCategories = {
      'productivity': {
        weight: 1.0,
        tags: ['efficiency', 'automation', 'shortcuts'],
        baseSuggestions: [
          'Enable keyboard shortcuts',
          'Set up auto-save',
          'Use productivity templates',
          'Create custom workflows'
        ]
      },
      'focus': {
        weight: 0.9,
        tags: ['concentration', 'breaks', 'environment'],
        baseSuggestions: [
          'Take a 5-minute break',
          'Enable focus mode',
          'Minimize distractions',
          'Set work intervals'
        ]
      },
      'organization': {
        weight: 0.8,
        tags: ['structure', 'planning', 'management'],
        baseSuggestions: [
          'Organize your workspace',
          'Create task lists',
          'Set project milestones',
          'Use time blocking'
        ]
      },
      'learning': {
        weight: 0.7,
        tags: ['improvement', 'skills', 'knowledge'],
        baseSuggestions: [
          'Review recent patterns',
          'Learn new shortcuts',
          'Explore advanced features',
          'Join training sessions'
        ]
      }
    };
  }

  generatePersonalizedSuggestions(userBehavior, previousSuggestions = []) {
    const suggestions = [];
    const userContext = this.analyzeUserContext(userBehavior);
    
    // Generate category-based suggestions
    Object.entries(this.suggestionCategories).forEach(([category, config]) => {
      const categoryScore = this.calculateCategoryRelevance(category, userContext);
      
      if (categoryScore > 0.6) {
        const personalizedSuggestions = this.personalizeCategorySuggestions(
          category, 
          config.baseSuggestions, 
          userContext,
          previousSuggestions
        );
        
        suggestions.push(...personalizedSuggestions.map(suggestion => ({
          id: this.generateSuggestionId(),
          text: suggestion,
          category: category,
          relevance: categoryScore,
          confidence: this.calculateSuggestionConfidence(suggestion, userContext),
          tags: config.tags,
          timestamp: new Date().toISOString()
        })));
      }
    });

    // Add contextual suggestions based on current behavior
    const contextualSuggestions = this.generateContextualSuggestions(userBehavior);
    suggestions.push(...contextualSuggestions);

    // Sort by relevance and confidence
    return suggestions
      .sort((a, b) => (b.relevance * b.confidence) - (a.relevance * a.confidence))
      .slice(0, 5);
  }

  analyzeUserContext(userBehavior) {
    const context = {
      productivityLevel: this.calculateProductivityLevel(userBehavior),
      focusPattern: this.analyzeFocusPattern(userBehavior),
      workStyle: this.determineWorkStyle(userBehavior),
      timeOfDay: this.getTimeOfDay(),
      sessionDuration: userBehavior.duration_seconds || 0,
      activityIntensity: this.calculateActivityIntensity(userBehavior)
    };

    return context;
  }

  calculateProductivityLevel(behavior) {
    const keystrokeEfficiency = behavior.keystrokes / Math.max(behavior.duration_seconds / 60, 1);
    const mouseEfficiency = behavior.mouseMovements / Math.max(behavior.duration_seconds / 60, 1);
    
    if (keystrokeEfficiency > 15 && mouseEfficiency < 20) return 'high';
    if (keystrokeEfficiency > 10 && mouseEfficiency < 30) return 'medium';
    return 'low';
  }

  analyzeFocusPattern(behavior) {
    const focusRatio = behavior.gazePoints / Math.max(behavior.mouseMovements, 1);
    const switchFrequency = behavior.windowSwitches / Math.max(behavior.duration_seconds / 300, 1);
    
    if (focusRatio > 2 && switchFrequency < 0.1) return 'deep_focus';
    if (focusRatio > 1 && switchFrequency < 0.3) return 'moderate_focus';
    return 'distracted';
  }

  determineWorkStyle(behavior) {
    const typingIntensity = behavior.keystrokes / Math.max(behavior.duration_seconds / 60, 1);
    const navigationIntensity = behavior.mouseMovements / Math.max(behavior.duration_seconds / 60, 1);
    
    if (typingIntensity > 20) return 'writer';
    if (navigationIntensity > 50) return 'researcher';
    if (behavior.scrollEvents > 30) return 'reader';
    return 'general';
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  calculateActivityIntensity(behavior) {
    const totalActivity = behavior.keystrokes + behavior.mouseMovements + behavior.scrollEvents;
    const timeMinutes = behavior.duration_seconds / 60;
    
    return totalActivity / Math.max(timeMinutes, 1);
  }

  calculateCategoryRelevance(category, userContext) {
    let relevance = 0.5; // Base relevance
    
    // Adjust based on productivity level
    if (category === 'productivity' && userContext.productivityLevel === 'low') {
      relevance += 0.3;
    }
    
    // Adjust based on focus pattern
    if (category === 'focus' && userContext.focusPattern === 'distracted') {
      relevance += 0.4;
    }
    
    // Adjust based on work style
    if (category === 'organization' && userContext.workStyle === 'researcher') {
      relevance += 0.2;
    }
    
    // Adjust based on time of day
    if (category === 'focus' && userContext.timeOfDay === 'afternoon') {
      relevance += 0.1;
    }
    
    return Math.min(1.0, relevance);
  }

  personalizeCategorySuggestions(category, baseSuggestions, userContext, previousSuggestions) {
    const personalized = [...baseSuggestions];
    
    // Add time-based suggestions
    if (userContext.timeOfDay === 'morning') {
      personalized.push('Start with your most important task');
      personalized.push('Review your daily goals');
    } else if (userContext.timeOfDay === 'afternoon') {
      personalized.push('Take a short energy break');
      personalized.push('Switch to less demanding tasks');
    }
    
    // Add productivity-based suggestions
    if (userContext.productivityLevel === 'low') {
      personalized.push('Try the Pomodoro technique');
      personalized.push('Eliminate one distraction');
    }
    
    // Add focus-based suggestions
    if (userContext.focusPattern === 'distracted') {
      personalized.push('Close unnecessary browser tabs');
      personalized.push('Set your phone to Do Not Disturb');
    }
    
    // Filter out recently suggested items
    const recentSuggestions = previousSuggestions.slice(-10).map(s => s.text);
    return personalized.filter(suggestion => !recentSuggestions.includes(suggestion));
  }

  generateContextualSuggestions(userBehavior) {
    const suggestions = [];
    
    // Session duration suggestions
    if (userBehavior.duration_seconds > 3600) {
      suggestions.push({
        id: this.generateSuggestionId(),
        text: 'You\'ve been working for over an hour. Consider taking a break.',
        category: 'focus',
        relevance: 0.9,
        confidence: 0.95,
        tags: ['break', 'health', 'productivity'],
        timestamp: new Date().toISOString()
      });
    }
    
    // High activity suggestions
    if (userBehavior.keystrokes > 1000) {
      suggestions.push({
        id: this.generateSuggestionId(),
        text: 'High typing activity detected. Enable auto-save for safety.',
        category: 'productivity',
        relevance: 0.8,
        confidence: 0.85,
        tags: ['auto-save', 'safety', 'efficiency'],
        timestamp: new Date().toISOString()
      });
    }
    
    // Multitasking suggestions
    if (userBehavior.windowSwitches > 8) {
      suggestions.push({
        id: this.generateSuggestionId(),
        text: 'Multiple window switches detected. Consider consolidating your work.',
        category: 'focus',
        relevance: 0.7,
        confidence: 0.8,
        tags: ['consolidation', 'focus', 'efficiency'],
        timestamp: new Date().toISOString()
      });
    }
    
    return suggestions;
  }

  calculateSuggestionConfidence(suggestion, userContext) {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence for time-sensitive suggestions
    if (suggestion.includes('break') && userContext.sessionDuration > 3600) {
      confidence += 0.2;
    }
    
    // Increase confidence for productivity suggestions during low productivity
    if (suggestion.includes('productivity') && userContext.productivityLevel === 'low') {
      confidence += 0.15;
    }
    
    // Increase confidence for focus suggestions during distraction
    if (suggestion.includes('focus') && userContext.focusPattern === 'distracted') {
      confidence += 0.2;
    }
    
    return Math.min(1.0, confidence);
  }

  recordUserFeedback(suggestionId, feedback) {
    const suggestion = this.suggestionHistory.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.feedback = feedback;
      suggestion.feedbackTimestamp = new Date().toISOString();
      
      // Update learning weights based on feedback
      this.updateLearningWeights(feedback);
      
      // Store in suggestion history
      this.suggestionHistory.push(suggestion);
    }
  }

  updateLearningWeights(feedback) {
    // Adjust weights based on user feedback
    if (feedback.rating > 4) {
      this.learningWeights.userRating += 0.01;
    } else if (feedback.rating < 2) {
      this.learningWeights.userRating -= 0.01;
    }
    
    // Normalize weights
    const totalWeight = Object.values(this.learningWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(this.learningWeights).forEach(key => {
      this.learningWeights[key] /= totalWeight;
    });
  }

  generateSuggestionId() {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSuggestionAnalytics() {
    const totalSuggestions = this.suggestionHistory.length;
    const positiveFeedback = this.suggestionHistory.filter(s => 
      s.feedback && s.feedback.rating > 3
    ).length;
    
    return {
      totalSuggestions,
      positiveFeedback,
      satisfactionRate: totalSuggestions > 0 ? positiveFeedback / totalSuggestions : 0,
      topCategories: this.getTopCategories(),
      learningProgress: this.getLearningProgress()
    };
  }

  getTopCategories() {
    const categoryCounts = {};
    this.suggestionHistory.forEach(suggestion => {
      categoryCounts[suggestion.category] = (categoryCounts[suggestion.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }

  getLearningProgress() {
    return {
      totalInteractions: this.suggestionHistory.length,
      averageRating: this.suggestionHistory
        .filter(s => s.feedback && s.feedback.rating)
        .reduce((sum, s) => sum + s.feedback.rating, 0) / 
        Math.max(this.suggestionHistory.filter(s => s.feedback && s.feedback.rating).length, 1),
      improvementTrend: this.calculateImprovementTrend()
    };
  }

  calculateImprovementTrend() {
    const recentSuggestions = this.suggestionHistory.slice(-10);
    const olderSuggestions = this.suggestionHistory.slice(-20, -10);
    
    if (recentSuggestions.length === 0 || olderSuggestions.length === 0) {
      return 'insufficient_data';
    }
    
    const recentAvg = recentSuggestions
      .filter(s => s.feedback && s.feedback.rating)
      .reduce((sum, s) => sum + s.feedback.rating, 0) / 
      Math.max(recentSuggestions.filter(s => s.feedback && s.feedback.rating).length, 1);
    
    const olderAvg = olderSuggestions
      .filter(s => s.feedback && s.feedback.rating)
      .reduce((sum, s) => sum + s.feedback.rating, 0) / 
      Math.max(olderSuggestions.filter(s => s.feedback && s.feedback.rating).length, 1);
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }
}
