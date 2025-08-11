import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ChecklistTemplate, 
  TemplateRoom, 
  TemplateTask,
  TemplateSelectionState 
} from '@/lib/types/template';

interface CustomizationStore extends TemplateSelectionState {
  currentStep: 'template' | 'rooms' | 'tasks' | 'review';
  
  setSelectedTemplate: (template: ChecklistTemplate) => void;
  clearSelectedTemplate: () => void;
  
  toggleRoom: (roomId: string) => void;
  selectAllRooms: () => void;
  deselectAllRooms: () => void;
  selectRoomsByCategory: (categoryId: string) => void;
  deselectRoomsByCategory: (categoryId: string) => void;
  
  toggleTask: (roomId: string, taskId: string) => void;
  selectAllTasksInRoom: (roomId: string) => void;
  deselectAllTasksInRoom: (roomId: string) => void;
  
  addCustomTask: (roomId: string, task: TemplateTask) => void;
  removeCustomTask: (roomId: string, taskId: string) => void;
  editCustomTask: (roomId: string, taskId: string, updates: Partial<TemplateTask>) => void;
  
  editTask: (taskId: string, updates: Partial<TemplateTask>) => void;
  resetTaskEdits: (taskId: string) => void;
  
  setCurrentStep: (step: 'template' | 'rooms' | 'tasks' | 'review') => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  getSelectedRoomsWithTasks: () => TemplateRoom[];
  getTotalEstimatedTime: () => number;
  getTotalSelectedTasks: () => number;
  reset: () => void;
}

const initialState: TemplateSelectionState = {
  selectedTemplate: null,
  selectedRooms: [],
  selectedTasks: {},
  customTasks: {},
  editedTasks: {},
};

export const useCustomizationStore = create<CustomizationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentStep: 'template',
      
      setSelectedTemplate: (template) => set({ 
        selectedTemplate: template,
        selectedRooms: [],
        selectedTasks: {},
        customTasks: {},
        editedTasks: {},
      }),
      
      clearSelectedTemplate: () => set(initialState),
      
      toggleRoom: (roomId) => set((state) => {
        const isSelected = state.selectedRooms.includes(roomId);
        const selectedRooms = isSelected
          ? state.selectedRooms.filter(id => id !== roomId)
          : [...state.selectedRooms, roomId];
        
        if (!isSelected && state.selectedTemplate) {
          const room = state.selectedTemplate.categories
            .flatMap(cat => cat.rooms)
            .find(r => r.id === roomId);
          
          if (room) {
            const taskIds = room.tasks.map(t => t.id);
            return {
              selectedRooms,
              selectedTasks: {
                ...state.selectedTasks,
                [roomId]: taskIds,
              },
            };
          }
        } else if (isSelected) {
          const { [roomId]: _, ...remainingTasks } = state.selectedTasks;
          return {
            selectedRooms,
            selectedTasks: remainingTasks,
          };
        }
        
        return { selectedRooms };
      }),
      
      selectAllRooms: () => set((state) => {
        if (!state.selectedTemplate) return state;
        
        const allRooms = state.selectedTemplate.categories.flatMap(cat => cat.rooms);
        const selectedRooms = allRooms.map(room => room.id);
        const selectedTasks: Record<string, string[]> = {};
        
        allRooms.forEach(room => {
          selectedTasks[room.id] = room.tasks.map(task => task.id);
        });
        
        return { selectedRooms, selectedTasks };
      }),
      
      deselectAllRooms: () => set({ 
        selectedRooms: [], 
        selectedTasks: {},
        customTasks: {},
      }),
      
      selectRoomsByCategory: (categoryId) => set((state) => {
        if (!state.selectedTemplate) return state;
        
        const category = state.selectedTemplate.categories.find(cat => cat.id === categoryId);
        if (!category) return state;
        
        const categoryRoomIds = category.rooms.map(room => room.id);
        const selectedRooms = [...new Set([...state.selectedRooms, ...categoryRoomIds])];
        
        const selectedTasks = { ...state.selectedTasks };
        category.rooms.forEach(room => {
          selectedTasks[room.id] = room.tasks.map(task => task.id);
        });
        
        return { selectedRooms, selectedTasks };
      }),
      
      deselectRoomsByCategory: (categoryId) => set((state) => {
        if (!state.selectedTemplate) return state;
        
        const category = state.selectedTemplate.categories.find(cat => cat.id === categoryId);
        if (!category) return state;
        
        const categoryRoomIds = new Set(category.rooms.map(room => room.id));
        const selectedRooms = state.selectedRooms.filter(id => !categoryRoomIds.has(id));
        
        const selectedTasks = { ...state.selectedTasks };
        category.rooms.forEach(room => {
          delete selectedTasks[room.id];
        });
        
        return { selectedRooms, selectedTasks };
      }),
      
      toggleTask: (roomId, taskId) => set((state) => {
        const roomTasks = state.selectedTasks[roomId] || [];
        const isSelected = roomTasks.includes(taskId);
        
        const updatedTasks = isSelected
          ? roomTasks.filter(id => id !== taskId)
          : [...roomTasks, taskId];
        
        return {
          selectedTasks: {
            ...state.selectedTasks,
            [roomId]: updatedTasks,
          },
        };
      }),
      
      selectAllTasksInRoom: (roomId) => set((state) => {
        if (!state.selectedTemplate) return state;
        
        const room = state.selectedTemplate.categories
          .flatMap(cat => cat.rooms)
          .find(r => r.id === roomId);
        
        if (!room) return state;
        
        return {
          selectedTasks: {
            ...state.selectedTasks,
            [roomId]: room.tasks.map(task => task.id),
          },
        };
      }),
      
      deselectAllTasksInRoom: (roomId) => set((state) => ({
        selectedTasks: {
          ...state.selectedTasks,
          [roomId]: [],
        },
      })),
      
      addCustomTask: (roomId, task) => set((state) => ({
        customTasks: {
          ...state.customTasks,
          [roomId]: [...(state.customTasks[roomId] || []), task],
        },
      })),
      
      removeCustomTask: (roomId, taskId) => set((state) => ({
        customTasks: {
          ...state.customTasks,
          [roomId]: (state.customTasks[roomId] || []).filter(t => t.id !== taskId),
        },
      })),
      
      editCustomTask: (roomId, taskId, updates) => set((state) => ({
        customTasks: {
          ...state.customTasks,
          [roomId]: (state.customTasks[roomId] || []).map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        },
      })),
      
      editTask: (taskId, updates) => set((state) => ({
        editedTasks: {
          ...state.editedTasks,
          [taskId]: { ...state.editedTasks[taskId], ...updates },
        },
      })),
      
      resetTaskEdits: (taskId) => set((state) => {
        const { [taskId]: _, ...remainingEdits } = state.editedTasks;
        return { editedTasks: remainingEdits };
      }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      goToNextStep: () => set((state) => {
        const steps: Array<'template' | 'rooms' | 'tasks' | 'review'> = ['template', 'rooms', 'tasks', 'review'];
        const currentIndex = steps.indexOf(state.currentStep);
        if (currentIndex < steps.length - 1) {
          return { currentStep: steps[currentIndex + 1] };
        }
        return state;
      }),
      
      goToPreviousStep: () => set((state) => {
        const steps: Array<'template' | 'rooms' | 'tasks' | 'review'> = ['template', 'rooms', 'tasks', 'review'];
        const currentIndex = steps.indexOf(state.currentStep);
        if (currentIndex > 0) {
          return { currentStep: steps[currentIndex - 1] };
        }
        return state;
      }),
      
      getSelectedRoomsWithTasks: () => {
        const state = get();
        if (!state.selectedTemplate) return [];
        
        return state.selectedTemplate.categories
          .flatMap(cat => cat.rooms)
          .filter(room => state.selectedRooms.includes(room.id))
          .map(room => ({
            ...room,
            tasks: room.tasks
              .filter(task => 
                state.selectedTasks[room.id]?.includes(task.id)
              )
              .map(task => ({
                ...task,
                ...state.editedTasks[task.id],
              })),
            customTasks: state.customTasks[room.id] || [],
          }));
      },
      
      getTotalEstimatedTime: () => {
        const state = get();
        if (!state.selectedTemplate) return 0;
        
        let totalTime = 0;
        
        state.selectedTemplate.categories.forEach(cat => {
          cat.rooms.forEach(room => {
            if (state.selectedRooms.includes(room.id)) {
              room.tasks.forEach(task => {
                if (state.selectedTasks[room.id]?.includes(task.id)) {
                  const editedTask = state.editedTasks[task.id];
                  totalTime += editedTask?.estimatedTime || task.estimatedTime;
                }
              });
              
              const customTasks = state.customTasks[room.id] || [];
              customTasks.forEach(task => {
                totalTime += task.estimatedTime;
              });
            }
          });
        });
        
        return totalTime;
      },
      
      getTotalSelectedTasks: () => {
        const state = get();
        let total = 0;
        
        Object.values(state.selectedTasks).forEach(taskIds => {
          total += taskIds.length;
        });
        
        Object.values(state.customTasks).forEach(tasks => {
          total += tasks.length;
        });
        
        return total;
      },
      
      reset: () => set({ 
        ...initialState, 
        currentStep: 'template' 
      }),
    }),
    {
      name: 'checklist-customization',
      partialize: (state) => ({
        selectedTemplate: state.selectedTemplate,
        selectedRooms: state.selectedRooms,
        selectedTasks: state.selectedTasks,
        customTasks: state.customTasks,
        editedTasks: state.editedTasks,
        currentStep: state.currentStep,
      }),
    }
  )
);