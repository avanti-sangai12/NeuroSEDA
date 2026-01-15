export class BehavioralSession {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.session_start = data.session_start || new Date().toISOString();
    this.duration_seconds = data.duration_seconds || 0;
    this.behavioral_intent_vector = data.behavioral_intent_vector || [0, 0, 0, 0, 0];
    this.predicted_action = data.predicted_action || '';
    this.confidence_score = data.confidence_score || 0;
    this.mouseMovements = data.mouseMovements || 0;
    this.keystrokes = data.keystrokes || 0;
    this.scrollEvents = data.scrollEvents || 0;
    this.windowSwitches = data.windowSwitches || 0;
    this.gazePoints = data.gazePoints || 0;
    this.created_date = data.created_date || new Date().toISOString();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  static async list(sortBy = '-created_date', limit = 10) {
    // Mock data for now
    const mockSessions = [
      {
        id: '1',
        session_start: new Date(Date.now() - 3600000).toISOString(),
        duration_seconds: 3600,
        behavioral_intent_vector: [0.8, 0.6, 0.9, 0.7, 0.5],
        predicted_action: 'Document editing workflow',
        confidence_score: 0.92,
        mouseMovements: 1250,
        keystrokes: 890,
        scrollEvents: 45,
        windowSwitches: 3,
        gazePoints: 2100,
        created_date: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        session_start: new Date(Date.now() - 7200000).toISOString(),
        duration_seconds: 1800,
        behavioral_intent_vector: [0.3, 0.8, 0.4, 0.9, 0.6],
        predicted_action: 'Research and browsing',
        confidence_score: 0.87,
        mouseMovements: 890,
        keystrokes: 120,
        scrollEvents: 67,
        windowSwitches: 8,
        gazePoints: 1500,
        created_date: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    return mockSessions.slice(0, limit);
  }

  static async create(data) {
    const session = new BehavioralSession(data);
    // In a real app, this would save to a database
    console.log('Created session:', session);
    return session;
  }

  static async get(id) {
    const sessions = await this.list();
    return sessions.find(s => s.id === id);
  }
}
