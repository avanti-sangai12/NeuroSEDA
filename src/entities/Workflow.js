export class Workflow {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.trigger_conditions = data.trigger_conditions || [];
    this.actions = data.actions || [];
    this.success_rate = data.success_rate || 0;
    this.execution_count = data.execution_count || 0;
    this.last_executed = data.last_executed || null;
    this.created_date = data.created_date || new Date().toISOString();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  static async list() {
    // Mock data for now
    const mockWorkflows = [
      {
        id: '1',
        name: 'Document Automation',
        description: 'Automatically format and organize documents based on user behavior',
        is_active: true,
        trigger_conditions: ['high_typing_speed', 'document_focus'],
        actions: ['format_document', 'suggest_templates'],
        success_rate: 0.94,
        execution_count: 156,
        last_executed: new Date(Date.now() - 1800000).toISOString(),
        created_date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        name: 'Research Assistant',
        description: 'Help with research tasks by analyzing browsing patterns',
        is_active: true,
        trigger_conditions: ['research_mode', 'multiple_tabs'],
        actions: ['suggest_sources', 'organize_findings'],
        success_rate: 0.87,
        execution_count: 89,
        last_executed: new Date(Date.now() - 3600000).toISOString(),
        created_date: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '3',
        name: 'Focus Enhancer',
        description: 'Improve productivity by monitoring attention patterns',
        is_active: true,
        trigger_conditions: ['low_attention', 'frequent_switching'],
        actions: ['suggest_breaks', 'focus_timer'],
        success_rate: 0.78,
        execution_count: 234,
        last_executed: new Date(Date.now() - 900000).toISOString(),
        created_date: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    
    return mockWorkflows;
  }

  static async create(data) {
    const workflow = new Workflow(data);
    // In a real app, this would save to a database
    console.log('Created workflow:', workflow);
    return workflow;
  }

  static async get(id) {
    const workflows = await this.list();
    return workflows.find(w => w.id === id);
  }

  static async update(id, data) {
    const workflow = await this.get(id);
    if (workflow) {
      Object.assign(workflow, data);
      // In a real app, this would update the database
      console.log('Updated workflow:', workflow);
      return workflow;
    }
    return null;
  }

  static async delete(id) {
    // In a real app, this would delete from the database
    console.log('Deleted workflow:', id);
    return true;
  }
}
