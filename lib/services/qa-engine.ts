import type {
  QASession,
  Question,
  Answer,
  QuestionType,
  QuestionOption
} from '../types/qa';
import { ChecklistService } from './checklist-service';
import { TemplateService } from './template-service';
import type { Checklist, ServiceType, PropertyType } from '../types/checklist';

interface AnswerResult {
  success: boolean;
  error?: string;
}

interface Progress {
  current: number;
  total: number;
  percentage: number;
}

export class QAEngine {
  private sessions: Map<string, QASession> = new Map();
  private checklistService: ChecklistService;
  private templateService: TemplateService;
  private nextSessionId = 1;
  private currentAnswers: Record<string, Answer> = {};

  constructor() {
    this.checklistService = new ChecklistService();
    this.templateService = new TemplateService();
  }

  private generateSessionId(): string {
    return `session-${this.nextSessionId++}`;
  }

  createSession(): QASession {
    const session: QASession = {
      id: this.generateSessionId(),
      currentQuestionIndex: 0,
      answers: {},
      isComplete: false,
      startedAt: new Date(),
      questions: this.getQuestionFlow()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): QASession | undefined {
    return this.sessions.get(sessionId);
  }

  private getQuestionFlow(): Question[] {
    return [
      {
        id: 'service_type',
        text: 'What type of service do you need?',
        type: 'single-select',
        required: true,
        options: [
          'move_in',
          'move_out',
          'deep_clean',
          'regular',
          'post_construction',
          'airbnb'
        ]
      },
      {
        id: 'property_type',
        text: 'What type of property is this?',
        type: 'single-select',
        required: true,
        options: [
          'apartment',
          'house',
          'condo',
          'office',
          'retail',
          'warehouse'
        ]
      },
      {
        id: 'include_photos',
        text: 'Would you like to upload photos for room analysis?',
        type: 'boolean',
        required: true
      },
      {
        id: 'photo_upload',
        text: 'Please upload photos of the rooms',
        type: 'file',
        required: false,
        condition: (answers) => answers['include_photos'] === true
      },
      {
        id: 'rooms',
        text: 'Which rooms need cleaning?',
        type: 'multi-select',
        required: true,
        options: [] // Will be dynamically set based on property type
      }
    ];
  }

  getCurrentQuestion(sessionId: string): Question | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const questions = session.questions;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Check if question has a condition
      if (question.condition && !question.condition(session.answers)) {
        continue; // Skip this question
      }

      // Check if question is already answered
      if (session.answers[question.id] !== undefined) {
        continue;
      }

      // This is the current question
      // Set dynamic options for rooms based on property type
      if (question.id === 'rooms') {
        return {
          ...question,
          options: this.getRoomOptions(session.answers['property_type'] as PropertyType)
        };
      }

      return question;
    }

    // All questions answered - check if all required questions are answered
    const requiredQuestions = questions.filter(q => {
      // Skip conditional questions that don't apply
      if (q.condition && !q.condition(session.answers)) {
        return false;
      }
      return q.required;
    });

    const allRequiredAnswered = requiredQuestions.every(q => 
      session.answers[q.id] !== undefined
    );

    if (allRequiredAnswered) {
      session.isComplete = true;
      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);
    }

    return undefined;
  }

  private getRoomOptions(propertyType: PropertyType): string[] {
    const roomsByPropertyType: Record<PropertyType, string[]> = {
      apartment: ['bedroom', 'bathroom', 'kitchen', 'living_room', 'balcony'],
      house: ['bedroom', 'bathroom', 'kitchen', 'living_room', 'dining_room', 'garage', 'basement'],
      condo: ['bedroom', 'bathroom', 'kitchen', 'living_room', 'balcony'],
      office: ['office_space', 'conference_room', 'kitchen', 'bathroom', 'reception'],
      retail: ['sales_floor', 'storage', 'bathroom', 'office'],
      warehouse: ['warehouse_floor', 'office', 'bathroom', 'loading_dock']
    };

    return roomsByPropertyType[propertyType] || ['bedroom', 'bathroom', 'kitchen'];
  }

  answerQuestion(sessionId: string, questionId: string, answer: Answer): AnswerResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const question = session.questions.find(q => q.id === questionId);

    // For rooms question, set dynamic options based on property type
    if (questionId === 'rooms' && question) {
      question.options = this.getRoomOptions(session.answers['property_type'] as PropertyType);
    }
    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Validate answer
    const validation = this.validateAnswer(question, answer);
    if (!validation.success) {
      return validation;
    }

    // Store answer
    session.answers[questionId] = answer;
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    // Check if session is complete by calling getCurrentQuestion
    // This will also update session.isComplete if all questions are answered
    this.getCurrentQuestion(sessionId);

    return { success: true };
  }

  private validateAnswer(question: Question, answer: Answer): AnswerResult {
    // Check required
    if (question.required && (answer === '' || answer === null || answer === undefined)) {
      return { success: false, error: 'This question is required' };
    }

    // Validate single select
    if (question.type === 'single-select' && question.options) {
      if (!this.getValidOptionValues(question.options).includes(answer as string)) {
        return { success: false, error: 'Invalid option selected' };
      }
    }

    // Validate multi select
    if (question.type === 'multi-select' && question.options) {
      const answers = answer as string[];
      for (const ans of answers) {
        if (!this.getValidOptionValues(question.options).includes(ans)) {
          return { success: false, error: 'Invalid option selected' };
        }
      }
    }

    return { success: true };
  }

  canGoBack(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if there are any answered questions
    return Object.keys(session.answers).length > 0;
  }

  goBack(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Get ordered list of question IDs that have been answered
    const answeredIds: string[] = [];
    
    for (const question of session.questions) {
      if (session.answers[question.id] !== undefined) {
        answeredIds.push(question.id);
      }
    }

    if (answeredIds.length > 0) {
      // Remove only the last answered question
      const lastAnsweredId = answeredIds[answeredIds.length - 1];
      delete session.answers[lastAnsweredId];
      session.isComplete = false;
      session.updatedAt = new Date();
    }
  }

  getAnswers(sessionId: string): Record<string, Answer> {
    const session = this.sessions.get(sessionId);
    return session?.answers || {};
  }

  setAnswers(answers: Record<string, Answer>): void {
    // This would typically be used with a session ID
    // For now, just store in memory
    this.currentAnswers = answers;
  }

  generateRoomSuggestions(): any[] {
    // Generate room suggestions based on answers
    const suggestions: any[] = [];
    // Add logic here to generate room suggestions
    return suggestions;
  }

  getRecommendedTemplate(): string | undefined {
    // Return a recommended template ID based on answers
    // For now, return a default template
    return 'default-template';
  }

  calculateEstimatedTime(roomSuggestions: any[]): number {
    // Calculate estimated time based on room suggestions
    // Simple calculation: 30 minutes per room
    return roomSuggestions.length * 30;
  }

  async generateChecklist(sessionId: string): Promise<Checklist> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.isComplete) {
      throw new Error('Session not complete');
    }

    const serviceType = session.answers['service_type'] as ServiceType;
    const propertyType = session.answers['property_type'] as PropertyType;
    const rooms = session.answers['rooms'] as string[];

    // Get appropriate template
    const templates = await this.templateService.getDefaultTemplates(serviceType, propertyType);
    
    if (templates.length > 0) {
      // Use the first matching template
      const checklist = await this.checklistService.createChecklistFromTemplate(templates[0]);
      
      // Filter items based on selected rooms
      if (rooms && rooms.length > 0) {
        checklist.items = checklist.items.filter(item => {
          // Simple room-based filtering
          return rooms.some(room => 
            item.category?.toLowerCase().includes(room.toLowerCase()) ||
            item.text.toLowerCase().includes(room.toLowerCase())
          );
        });
      }
      
      return checklist;
    } else {
      // Create empty checklist if no template found
      const checklist = await this.checklistService.createEmptyChecklist(
        `${serviceType} - ${propertyType}`,
        serviceType,
        propertyType
      );
      
      // Add basic tasks for selected rooms
      for (const room of rooms) {
        await this.checklistService.addItemToChecklist(checklist.id, {
          text: `Clean ${room.replace('_', ' ')}`,
          category: room
        });
      }
      
      return checklist;
    }
  }

  getProgress(sessionId: string): Progress {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { current: 0, total: 0, percentage: 0 };
    }

    // For initial state, we know we'll have at least 4 questions (service, property, photos, rooms)
    // Photo upload is conditional
    let totalQuestions = 4; // Default visible questions
    let answeredCount = 0;

    // Count answered questions
    if (session.answers['service_type'] !== undefined) answeredCount++;
    if (session.answers['property_type'] !== undefined) answeredCount++;
    if (session.answers['include_photos'] !== undefined) {
      answeredCount++;
      // If photos are included, we have one more question
      if (session.answers['include_photos'] === true) {
        totalQuestions = 5;
        if (session.answers['photo_upload'] !== undefined) answeredCount++;
      }
    }
    if (session.answers['rooms'] !== undefined) answeredCount++;

    const current = Math.min(answeredCount, totalQuestions);
    // Calculate percentage based on current position, not just answered
    const percentage = totalQuestions > 0 ? Math.round((current / totalQuestions) * 100) : 0;

    return {
      current,
      total: totalQuestions,
      percentage
    };
  }

  private getValidOptionValues(options: string[] | QuestionOption[]): string[] {
    if (!options || options.length === 0) return [];
    
    // Check if it's an array of strings
    if (typeof options[0] === 'string') {
      return options as string[];
    }
    
    // It's an array of QuestionOption objects
    return (options as QuestionOption[]).map(opt => String(opt.value));
  }
}
