import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Question,
  Answer,
  QASession,
  TaskSuggestion,
  RoomSuggestion,
  QuestionFlow,
  ConditionalLogic,
} from '@/lib/types/qa';
import { TemplateTask } from '@/lib/types/template';

interface QAStore {
  // Session Management
  currentSession: QASession | null;
  questionFlow: QuestionFlow | null;
  
  // Question Navigation
  currentQuestion: Question | null;
  availableQuestions: Question[];
  answeredQuestions: string[];
  
  // Suggestions
  roomSuggestions: RoomSuggestion[];
  taskSuggestions: TaskSuggestion[];
  customTasks: Array<{
    roomId: string;
    task: Partial<TemplateTask>;
  }>;
  
  // Actions
  startSession: (templateId?: string) => void;
  setQuestionFlow: (flow: QuestionFlow) => void;
  answerQuestion: (questionId: string, value: any) => void;
  getNextQuestion: () => Question | null;
  goToPreviousQuestion: () => void;
  
  // Suggestion Management
  toggleRoomSelection: (roomId: string) => void;
  toggleTaskSelection: (roomId: string, taskId: string) => void;
  editTaskSuggestion: (roomId: string, taskId: string, edits: Partial<TemplateTask>) => void;
  addCustomTask: (roomId: string, task: Partial<TemplateTask>) => void;
  removeCustomTask: (roomId: string, taskIndex: number) => void;
  
  // Utility
  evaluateConditionalLogic: () => void;
  generateSuggestions: () => void;
  calculateConfidence: (answers: Record<string, Answer>) => number;
  getSessionResult: () => any;
  reset: () => void;
}

export const useQAStore = create<QAStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      questionFlow: null,
      currentQuestion: null,
      availableQuestions: [],
      answeredQuestions: [],
      roomSuggestions: [],
      taskSuggestions: [],
      customTasks: [],

      startSession: (templateId) => {
        const sessionId = `qa-${Date.now()}`;
        set({
          currentSession: {
            id: sessionId,
            templateId,
            startedAt: new Date(),
            answers: {},
            currentQuestionIndex: 0,
            isComplete: false,
            questions: [],
            suggestedRooms: [],
            suggestedTasks: {},
            customRequirements: [],
          },
          answeredQuestions: [],
          roomSuggestions: [],
          taskSuggestions: [],
          customTasks: [],
        });
      },

      setQuestionFlow: (flow) => {
        set({
          questionFlow: flow,
          availableQuestions: flow.questions,
          currentQuestion: flow.questions.find(q => q.id === flow.initialQuestionId) || flow.questions[0],
        });
      },

      answerQuestion: (questionId, value) => {
        const state = get();
        if (!state.currentSession) return;

        const updatedAnswers = { ...state.currentSession.answers, [questionId]: value };
        const answeredQuestions = [...state.answeredQuestions, questionId];

        set({
          currentSession: {
            ...state.currentSession,
            answers: updatedAnswers,
          },
          answeredQuestions,
        });

        // Evaluate conditional logic and generate suggestions
        get().evaluateConditionalLogic();
        get().generateSuggestions();

        // Move to next question
        const nextQuestion = get().getNextQuestion();
        if (nextQuestion) {
          set({ currentQuestion: nextQuestion });
        }
      },

      getNextQuestion: () => {
        const state = get();
        if (!state.questionFlow) return null;

        const { availableQuestions, answeredQuestions, currentSession } = state;
        
        // Find questions that haven't been answered and meet dependency criteria
        const nextQuestion = availableQuestions.find(q => {
          if (answeredQuestions.includes(q.id)) return false;
          
          if (q.dependsOn) {
            const dependencyAnswer = currentSession?.answers[q.dependsOn!.questionId];
            
            if (!dependencyAnswer) return false;
            
            // Check dependency condition
            const { condition, expectedValue } = q.dependsOn;
            const actualValue = dependencyAnswer;
            
            switch (condition) {
              case 'equals':
                return actualValue === expectedValue;
              case 'contains':
                return String(actualValue).includes(String(expectedValue));
              case 'greaterThan':
                return Number(actualValue) > Number(expectedValue);
              case 'lessThan':
                return Number(actualValue) < Number(expectedValue);
              case 'notEmpty':
                return actualValue !== null && actualValue !== undefined && actualValue !== '';
              default:
                return true;
            }
          }
          
          return true;
        });

        return nextQuestion || null;
      },

      goToPreviousQuestion: () => {
        const state = get();
        const { answeredQuestions, questionFlow } = state;
        
        if (answeredQuestions.length > 0) {
          const lastAnsweredId = answeredQuestions[answeredQuestions.length - 1];
          const previousQuestion = questionFlow?.questions.find(q => q.id === lastAnsweredId);
          
          if (previousQuestion) {
            // Remove the last answer
            const updatedAnswers = { ...state.currentSession?.answers }; delete updatedAnswers[answeredQuestions[answeredQuestions.length - 1]];
            const updatedAnsweredQuestions = answeredQuestions.slice(0, -1);
            
            set({
              currentQuestion: previousQuestion,
              answeredQuestions: updatedAnsweredQuestions,
              currentSession: state.currentSession ? {
                ...state.currentSession,
                answers: updatedAnswers,
              } : null,
            });
          }
        }
      },

      toggleRoomSelection: (roomId) => {
        set((state) => {
          const roomSuggestions = state.roomSuggestions.map(room =>
            room.roomId === roomId
              ? { ...room, isSelected: !room.isSelected }
              : room
          );
          return { roomSuggestions };
        });
      },

      toggleTaskSelection: (roomId, taskId) => {
        set((state) => {
          const taskSuggestions = state.taskSuggestions.map(task =>
            task.roomId === roomId && task.taskId === taskId
              ? { ...task, isSelected: !task.isSelected }
              : task
          );
          return { taskSuggestions };
        });
      },

      editTaskSuggestion: (roomId, taskId, edits) => {
        set((state) => {
          const taskSuggestions = state.taskSuggestions.map(task =>
            task.roomId === roomId && task.taskId === taskId
              ? {
                  ...task,
                  isEdited: true,
                  editedContent: { ...task.editedContent, ...edits },
                }
              : task
          );
          return { taskSuggestions };
        });
      },

      addCustomTask: (roomId, task) => {
        set((state) => ({
          customTasks: [...state.customTasks, { roomId, task }],
        }));
      },

      removeCustomTask: (roomId, taskIndex) => {
        set((state) => ({
          customTasks: state.customTasks.filter(
            (ct, index) => !(ct.roomId === roomId && index === taskIndex)
          ),
        }));
      },

      evaluateConditionalLogic: () => {
        const state = get();
        if (!state.questionFlow || !state.currentSession) return;

        const { conditionalLogic } = state.questionFlow;
        const { answers } = state.currentSession;

        conditionalLogic.forEach((logic) => {
          const conditionsMet = logic.conditions.every((condition, index) => {
            const answer = answers[condition.questionId];
            if (!answer) return false;

            const met = evaluateCondition(answer, condition.operator, condition.value);
            
            // Handle join operators
            if (index > 0 && logic.conditions[index - 1].joinOperator === 'OR') {
              return met || evaluateCondition(
                answers[logic.conditions[index - 1].questionId],
                logic.conditions[index - 1].operator,
                logic.conditions[index - 1].value
              );
            }
            
            return met;
          });

          if (conditionsMet) {
            // Execute actions
            logic.actions.forEach((action) => {
              switch (action.type) {
                case 'suggest-room':
                  // Add room suggestion logic
                  break;
                case 'suggest-task':
                  // Add task suggestion logic
                  break;
                // Add other action types
              }
            });
          }
        });

        function evaluateCondition(value: any, operator: string, expected: any): boolean {
          switch (operator) {
            case 'equals': return value === expected;
            case 'contains': return String(value).includes(String(expected));
            case 'greaterThan': return Number(value) > Number(expected);
            case 'lessThan': return Number(value) < Number(expected);
            case 'in': return Array.isArray(expected) && expected.includes(value);
            default: return false;
          }
        }
      },

      generateSuggestions: () => {
        const state = get();
        if (!state.currentSession) return;

        // This would integrate with your template system to generate
        // intelligent suggestions based on the answers provided
        // For now, this is a placeholder for the suggestion generation logic
      },

      calculateConfidence: (answers: Record<string, Answer>) => {
        // Calculate confidence score based on answers
        // More specific answers = higher confidence
        return Math.min(Object.keys(answers).length * 0.15, 1);
      },

      getSessionResult: () => {
        const state = get();
        if (!state.currentSession) return null;

        return {
          sessionId: state.currentSession.id,
          templateId: state.currentSession.templateId,
          answers: state.currentSession.answers,
          selectedRooms: state.roomSuggestions.filter(r => r.isSelected),
          selectedTasks: state.taskSuggestions.filter(t => t.isSelected),
          customTasks: state.customTasks,
          estimatedTime: state.currentSession.estimatedTime,
        };
      },

      reset: () => {
        set({
          currentSession: null,
          questionFlow: null,
          currentQuestion: null,
          availableQuestions: [],
          answeredQuestions: [],
          roomSuggestions: [],
          taskSuggestions: [],
          customTasks: [],
        });
      },
    }),
    {
      name: 'qa-session',
      partialize: (state) => ({
        currentSession: state.currentSession,
        answeredQuestions: state.answeredQuestions,
        roomSuggestions: state.roomSuggestions,
        taskSuggestions: state.taskSuggestions,
        customTasks: state.customTasks,
      }),
    }
  )
);