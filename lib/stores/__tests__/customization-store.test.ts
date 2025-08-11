import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCustomizationStore } from '../customization-store';
import { ChecklistTemplate } from '@/lib/types/template';

// Mock template data
const mockTemplate: ChecklistTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'Test Description',
  industry: { id: 'test', name: 'Test Industry', code: 'TEST' },
  estimatedTotalTime: 60,
  categories: [
    {
      id: 'cat-1',
      name: 'Category 1',
      description: 'Category 1 description',
      rooms: [
        {
          id: 'room-1',
          name: 'Room 1',
          type: 'room',
          tasks: [
            {
              id: 'task-1',
              name: 'Task 1',
              description: 'Task 1 description',
              estimatedTime: 10,
              priority: 'high',
              frequency: 'daily',
              supplies: []
            },
            {
              id: 'task-2',
              name: 'Task 2',
              description: 'Task 2 description',
              estimatedTime: 20,
              priority: 'medium',
              frequency: 'daily',
              supplies: []
            }
          ]
        },
        {
          id: 'room-2',
          name: 'Room 2',
          type: 'room',
          tasks: [
            {
              id: 'task-3',
              name: 'Task 3',
              description: 'Task 3 description',
              estimatedTime: 30,
              priority: 'low',
              frequency: 'weekly',
              supplies: []
            }
          ]
        }
      ]
    }
  ],
  tags: []
};

describe('useCustomizationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCustomizationStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should set and clear selected template', () => {
    const { result } = renderHook(() => useCustomizationStore());
    
    expect(result.current.selectedTemplate).toBeNull();
    
    act(() => {
      result.current.setSelectedTemplate(mockTemplate);
    });
    
    expect(result.current.selectedTemplate).toEqual(mockTemplate);
    
    act(() => {
      result.current.clearSelectedTemplate();
    });
    
    expect(result.current.selectedTemplate).toBeNull();
  });

  it('should toggle room selection', () => {
    const { result } = renderHook(() => useCustomizationStore());
    
    act(() => {
      result.current.setSelectedTemplate(mockTemplate);
    });
    
    expect(result.current.selectedRooms).toEqual([]);
    
    act(() => {
      result.current.toggleRoom('room-1');
    });
    
    expect(result.current.selectedRooms).toContain('room-1');
    expect(result.current.selectedTasks['room-1']).toEqual(['task-1', 'task-2']);
    
    act(() => {
      result.current.toggleRoom('room-1');
    });
    
    expect(result.current.selectedRooms).not.toContain('room-1');
    expect(result.current.selectedTasks['room-1']).toBeUndefined();
  });

  it('should select and deselect all rooms', () => {
    const { result } = renderHook(() => useCustomizationStore());
    
    act(() => {
      result.current.setSelectedTemplate(mockTemplate);
      result.current.selectAllRooms();
    });
    
    expect(result.current.selectedRooms).toEqual(['room-1', 'room-2']);
    expect(result.current.selectedTasks['room-1']).toEqual(['task-1', 'task-2']);
    expect(result.current.selectedTasks['room-2']).toEqual(['task-3']);
    
    act(() => {
      result.current.deselectAllRooms();
    });
    
    expect(result.current.selectedRooms).toEqual([]);
    expect(result.current.selectedTasks).toEqual({});
  });

  it('should toggle task selection', () => {
    const { result } = renderHook(() => useCustomizationStore());
    
    act(() => {
      result.current.setSelectedTemplate(mockTemplate);
      result.current.toggleRoom('room-1');
    });
    
    expect(result.current.selectedTasks['room-1']).toContain('task-1');
    
    act(() => {
      result.current.toggleTask('room-1', 'task-1');
    });
    
    expect(result.current.selectedTasks['room-1']).not.toContain('task-1');
    
    act(() => {
      result.current.toggleTask('room-1', 'task-1');
    });
    
    expect(result.current.selectedTasks['room-1']).toContain('task-1');
  });

  it('should calculate total estimated time', () => {
    const { result } = renderHook(() => useCustomizationStore());
    
    act(() => {
      result.current.setSelectedTemplate(mockTemplate);
      result.current.toggleRoom('room-1');
    });
    
    expect(result.current.getTotalEstimatedTime()).toBe(30); // task-1 (10) + task-2 (20)
    
    act(() => {
      result.current.toggleRoom('room-2');
    });
    
    expect(result.current.getTotalEstimatedTime()).toBe(60); // task-1 (10) + task-2 (20) + task-3 (30)
  });

  it('should navigate through steps', () => {
    const { result } = renderHook(() => useCustomizationStore());
    
    expect(result.current.currentStep).toBe('template');
    
    act(() => {
      result.current.goToNextStep();
    });
    
    expect(result.current.currentStep).toBe('rooms');
    
    act(() => {
      result.current.goToNextStep();
    });
    
    expect(result.current.currentStep).toBe('tasks');
    
    act(() => {
      result.current.goToPreviousStep();
    });
    
    expect(result.current.currentStep).toBe('rooms');
    
    act(() => {
      result.current.setCurrentStep('review');
    });
    
    expect(result.current.currentStep).toBe('review');
  });
});
