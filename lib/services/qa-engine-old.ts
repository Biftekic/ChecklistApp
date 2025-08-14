import { 
  Question, 
  QuestionFlow, 
  Answer,
  RoomSuggestion,
  TaskSuggestion,
  QuestionCategory 
} from '@/lib/types/qa';
import { ChecklistTemplate, TemplateRoom, TemplateTask } from '@/lib/types/template';
import templates from '@/lib/data/templates';

// Question flows for different service types
export const questionFlows: Record<string, QuestionFlow> = {
  cleaning: {
    id: 'cleaning-flow',
    name: 'Cleaning Service Customization',
    description: 'Interactive questionnaire for cleaning services',
    initialQuestionId: 'service-type',
    questions: [
      {
        id: 'service-type',
        text: 'What type of cleaning service do you need?',
        description: 'This helps us understand your basic requirements',
        type: 'single-select',
        category: 'basic',
        order: 1,
        required: true,
        options: [
          {
            id: 'residential',
            label: 'Residential Cleaning',
            value: 'residential',
            description: 'Homes, apartments, condos',
            icon: 'home',
            followUpQuestions: ['property-size', 'bedrooms', 'bathrooms'],
            suggestedRooms: ['living-room', 'kitchen', 'bedroom', 'bathroom'],
          },
          {
            id: 'commercial',
            label: 'Commercial Cleaning',
            value: 'commercial',
            description: 'Offices, retail, warehouses',
            icon: 'building',
            followUpQuestions: ['business-type', 'square-footage', 'employees'],
            suggestedRooms: ['lobby', 'office', 'conference-room', 'restroom'],
          },
          {
            id: 'hospitality',
            label: 'Hospitality Cleaning',
            value: 'hospitality',
            description: 'Hotels, Airbnb, vacation rentals',
            icon: 'bed',
            followUpQuestions: ['property-type', 'guest-rooms', 'turnover-time'],
            suggestedRooms: ['guest-room', 'lobby', 'dining-area', 'pool-area'],
          },
        ],
      },
      {
        id: 'property-size',
        text: 'What is the size of your property?',
        type: 'single-select',
        category: 'property',
        order: 2,
        dependsOn: {
          questionId: 'service-type',
          expectedValue: 'residential',
          condition: 'equals',
        },
        options: [
          { id: 'small', label: 'Small (< 1000 sq ft)', value: 'small' },
          { id: 'medium', label: 'Medium (1000-2500 sq ft)', value: 'medium' },
          { id: 'large', label: 'Large (2500-4000 sq ft)', value: 'large' },
          { id: 'xlarge', label: 'Extra Large (> 4000 sq ft)', value: 'xlarge' },
        ],
      },
      {
        id: 'bedrooms',
        text: 'How many bedrooms?',
        type: 'number',
        category: 'property',
        order: 3,
        dependsOn: {
          questionId: 'service-type',
          expectedValue: 'residential',
          condition: 'equals',
        },
        validation: {
          min: 0,
          max: 20,
          message: 'Please enter a valid number of bedrooms',
        },
        placeholder: 'Enter number of bedrooms',
      },
      {
        id: 'bathrooms',
        text: 'How many bathrooms?',
        type: 'number',
        category: 'property',
        order: 4,
        dependsOn: {
          questionId: 'service-type',
          expectedValue: 'residential',
          condition: 'equals',
        },
        validation: {
          min: 0,
          max: 10,
          message: 'Please enter a valid number of bathrooms',
        },
        placeholder: 'Enter number of bathrooms',
      },
      {
        id: 'frequency',
        text: 'How often will you need this service?',
        type: 'single-select',
        category: 'service',
        order: 5,
        required: true,
        options: [
          { id: 'one-time', label: 'One-time', value: 'one-time' },
          { id: 'weekly', label: 'Weekly', value: 'weekly' },
          { id: 'bi-weekly', label: 'Bi-weekly', value: 'bi-weekly' },
          { id: 'monthly', label: 'Monthly', value: 'monthly' },
          { id: 'as-needed', label: 'As needed', value: 'as-needed' },
        ],
      },
      {
        id: 'priority-areas',
        text: 'Which areas need the most attention?',
        type: 'multi-select',
        category: 'focus',
        order: 6,
        options: [
          { id: 'kitchen', label: 'Kitchen', value: 'kitchen', suggestedTasks: ['clean-counters', 'clean-appliances', 'mop-floor'] },
          { id: 'bathrooms', label: 'Bathrooms', value: 'bathrooms', suggestedTasks: ['clean-toilet', 'clean-shower', 'clean-sink'] },
          { id: 'floors', label: 'Floors', value: 'floors', suggestedTasks: ['vacuum', 'mop', 'sweep'] },
          { id: 'windows', label: 'Windows', value: 'windows', suggestedTasks: ['clean-windows', 'clean-mirrors'] },
          { id: 'dusting', label: 'Dusting', value: 'dusting', suggestedTasks: ['dust-surfaces', 'dust-furniture'] },
        ],
      },
      {
        id: 'special-requirements',
        text: 'Do you have any special requirements?',
        type: 'multi-select',
        category: 'requirements',
        order: 7,
        options: [
          { id: 'eco-friendly', label: 'Eco-friendly products', value: 'eco-friendly' },
          { id: 'pet-safe', label: 'Pet-safe cleaning', value: 'pet-safe' },
          { id: 'allergies', label: 'Allergy considerations', value: 'allergies' },
          { id: 'deep-clean', label: 'Deep cleaning', value: 'deep-clean' },
          { id: 'sanitization', label: 'Extra sanitization', value: 'sanitization' },
        ],
      },
      {
        id: 'additional-services',
        text: 'Would you like any additional services?',
        type: 'multi-select',
        category: 'extras',
        order: 8,
        options: [
          { id: 'laundry', label: 'Laundry', value: 'laundry', suggestedTasks: ['wash-clothes', 'fold-laundry'] },
          { id: 'dishes', label: 'Dishes', value: 'dishes', suggestedTasks: ['wash-dishes', 'load-dishwasher'] },
          { id: 'organizing', label: 'Organizing', value: 'organizing', suggestedTasks: ['organize-closets', 'declutter'] },
          { id: 'inside-appliances', label: 'Inside appliances', value: 'inside-appliances', suggestedTasks: ['clean-oven', 'clean-fridge'] },
        ],
      },
    ],
    conditionalLogic: [
      {
        id: 'show-deep-clean-tasks',
        conditions: [
          {
            questionId: 'special-requirements',
            operator: 'contains',
            value: 'deep-clean',
          },
        ],
        actions: [
          { type: 'suggest-task', targetId: 'deep-clean-carpet', value: true },
          { type: 'suggest-task', targetId: 'clean-baseboards', value: true },
          { type: 'suggest-task', targetId: 'clean-light-fixtures', value: true },
        ],
      },
    ],
    completionCriteria: {
      minQuestions: 3,
      requiredQuestions: ['service-type', 'frequency'],
    },
  },
};

export class QAEngine {
  private template: ChecklistTemplate | null = null;
  private answers: Record<string, Answer> = {};

  constructor(templateId?: string) {
    if (templateId) {
      this.template = templates.find(t => t.id === templateId) || null;
    }
  }

  setTemplate(templateId: string) {
    this.template = templates.find(t => t.id === templateId) || null;
  }

  setAnswers(answers: Record<string, Answer>) {
    this.answers = answers;
  }

  generateRoomSuggestions(): RoomSuggestion[] {
    if (!this.template) return [];

    const suggestions: RoomSuggestion[] = [];
    const serviceTypeAnswer = this.answers['service-type'];
    const priorityAreasAnswer = this.answers['priority-areas'];
    const propertySize = this.answers['property-size'];

    // Iterate through all rooms in the template
    this.template.categories.forEach(category => {
      category.rooms.forEach(room => {
        let confidence = 0.5; // Base confidence
        let reasons: string[] = [];

        // Increase confidence based on service type match
        if (serviceTypeAnswer) {
          if (room.type === serviceTypeAnswer) {
            confidence += 0.2;
            reasons.push(`Matches ${serviceTypeAnswer} service type`);
          }
        }

        // Increase confidence for priority areas
        if (priorityAreasAnswer && Array.isArray(priorityAreasAnswer)) {
          const priorities = priorityAreasAnswer as string[];
          if (priorities.some(p => room.name.toLowerCase().includes(p))) {
            confidence += 0.3;
            reasons.push('High priority area');
          }
        }

        // Adjust for property size
        if (propertySize) {
          if (propertySize === 'small' && room.name.includes('Guest')) {
            confidence -= 0.2;
          } else if (propertySize === 'large') {
            confidence += 0.1;
            reasons.push('Suitable for large property');
          }
        }

        // Generate task suggestions for this room
        const taskSuggestions = this.generateTaskSuggestions(room);

        suggestions.push({
          roomId: room.id,
          confidence: Math.min(Math.max(confidence, 0), 1),
          reason: reasons.join('; ') || 'Standard cleaning area',
          isSelected: confidence > 0.6,
          suggestedTasks: taskSuggestions,
        });
      });
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  generateTaskSuggestions(room: TemplateRoom): TaskSuggestion[] {
    const suggestions: TaskSuggestion[] = [];
    const frequencyAnswer = this.answers['frequency'];
    const specialRequirements = this.answers['special-requirements'];
    const additionalServices = this.answers['additional-services'];

    room.tasks.forEach(task => {
      let confidence = 0.7; // Base confidence for all tasks
      let reasons: string[] = [];

      // Adjust confidence based on frequency
      if (frequencyAnswer) {
        if (frequencyAnswer === 'one-time' && task.frequency === 'daily') {
          confidence -= 0.2;
        } else if (frequencyAnswer === 'weekly' && task.frequency === 'weekly') {
          confidence += 0.2;
          reasons.push('Matches service frequency');
        }
      }

      // Adjust for special requirements
      if (specialRequirements && Array.isArray(specialRequirements)) {
        const requirements = specialRequirements as string[];
        if (requirements.includes('deep-clean') && task.priority === 'high') {
          confidence += 0.2;
          reasons.push('Deep cleaning priority');
        }
        if (requirements.includes('sanitization') && task.name.toLowerCase().includes('disinfect')) {
          confidence += 0.3;
          reasons.push('Sanitization required');
        }
      }

      // Check additional services
      if (additionalServices && Array.isArray(additionalServices)) {
        const services = additionalServices as string[];
        services.forEach(service => {
          if (task.name.toLowerCase().includes(service)) {
            confidence += 0.3;
            reasons.push(`Additional service: ${service}`);
          }
        });
      }

      suggestions.push({
        taskId: task.id,
        roomId: room.id,
        confidence: Math.min(Math.max(confidence, 0), 1),
        reason: reasons.join('; ') || 'Standard cleaning task',
        isSelected: confidence > 0.5,
      });
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  calculateEstimatedTime(suggestions: RoomSuggestion[]): number {
    if (!this.template) return 0;

    let totalTime = 0;
    const frequencyAnswer = this.answers['frequency'];
    const frequencyMultiplier = frequencyAnswer === 'one-time' ? 1.3 : 1;

    suggestions.forEach(roomSuggestion => {
      if (!roomSuggestion.isSelected) return;

      const room = this.template!.categories
        .flatMap(c => c.rooms)
        .find(r => r.id === roomSuggestion.roomId);

      if (room) {
        roomSuggestion.suggestedTasks.forEach(taskSuggestion => {
          if (taskSuggestion.isSelected) {
            const task = room.tasks.find(t => t.id === taskSuggestion.taskId);
            if (task) {
              const taskTime = taskSuggestion.editedContent?.estimatedTime || task.estimatedTime;
              totalTime += taskTime * frequencyMultiplier;
            }
          }
        });
      }
    });

    return Math.round(totalTime);
  }

  getRecommendedTemplate(): string | null {
    const serviceType = this.answers['service-type'];
    if (!serviceType) return null;

    // Map service types to template IDs
    const templateMap: Record<string, string> = {
      'residential': 'residential-standard',
      'commercial': 'office-standard',
      'hospitality': 'hospitality-hotel',
    };

    return templateMap[serviceType as string] || null;
  }
}