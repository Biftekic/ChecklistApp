import { describe, it, expect, beforeEach } from 'vitest';
import { QAEngine } from '../qa-engine';
import type { Question, Answer, QASession } from '../../types/qa';

describe('QAEngine', () => {
  let engine: QAEngine;

  beforeEach(() => {
    engine = new QAEngine();
  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });

  describe('Session Management', () => {
    it('should create a new QA session', () => {
      const session = engine.createSession();
      
      expect(session.id).toBeDefined();
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.answers).toEqual({});
      expect(session.isComplete).toBe(false);
    });

    it('should retrieve an existing session', () => {
      const session = engine.createSession();
      const retrieved = engine.getSession(session.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(session.id);
    });
  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });

  describe('Question Flow', () => {
    it('should start with service type question', () => {
      const session = engine.createSession();
      const question = engine.getCurrentQuestion(session.id);
      
      expect(question).toBeDefined();
      expect(question?.id).toBe('service_type');
      expect(question?.type).toBe('single_select');
      expect(question?.options).toBeDefined();
      expect(question?.options?.length).toBeGreaterThan(0);
    });

    it('should progress to property type after service selection', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      const nextQuestion = engine.getCurrentQuestion(session.id);
      
      expect(nextQuestion?.id).toBe('property_type');
      expect(nextQuestion?.type).toBe('single_select');
    });

    it('should ask about photo upload after property type', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      const nextQuestion = engine.getCurrentQuestion(session.id);
      
      expect(nextQuestion?.id).toBe('include_photos');
      expect(nextQuestion?.type).toBe('boolean');
    });

    it('should ask about rooms after photo decision', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      const nextQuestion = engine.getCurrentQuestion(session.id);
      
      expect(nextQuestion?.id).toBe('rooms');
      expect(nextQuestion?.type).toBe('multi_select');
    });

    it('should complete session after all questions', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const updatedSession = engine.getSession(session.id);
      expect(updatedSession?.isComplete).toBe(true);
    });
  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });

  describe('Answer Validation', () => {
    it('should validate required questions', () => {
      const session = engine.createSession();
      
      const result = engine.answerQuestion(session.id, 'service_type', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate single select answers', () => {
      const session = engine.createSession();
      
      const result = engine.answerQuestion(session.id, 'service_type', 'invalid_option');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid option');
    });

    it('should validate multi select answers', () => {
      const session = engine.createSession();
      
      // Progress to rooms question
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      
      const result = engine.answerQuestion(session.id, 'rooms', ['invalid_room']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid option');
    });
  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });

  describe('Conditional Questions', () => {
    it('should show photo upload question only when photos included', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', true);
      
      const nextQuestion = engine.getCurrentQuestion(session.id);
      
      expect(nextQuestion?.id).toBe('photo_upload');
      expect(nextQuestion?.type).toBe('file');
    });

    it('should skip photo upload when photos not included', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      
      const nextQuestion = engine.getCurrentQuestion(session.id);
      
      expect(nextQuestion?.id).toBe('rooms');
      expect(nextQuestion?.type).toBe('multi_select');
    });

    it('should show different room options based on property type', () => {
      const session1 = engine.createSession();
      const session2 = engine.createSession();
      
      // Apartment flow
      engine.answerQuestion(session1.id, 'service_type', 'move_out');
      engine.answerQuestion(session1.id, 'property_type', 'apartment');
      engine.answerQuestion(session1.id, 'include_photos', false);
      
      // Office flow
      engine.answerQuestion(session2.id, 'service_type', 'regular');
      engine.answerQuestion(session2.id, 'property_type', 'office');
      engine.answerQuestion(session2.id, 'include_photos', false);
      
      const apartmentRooms = engine.getCurrentQuestion(session1.id);
      const officeRooms = engine.getCurrentQuestion(session2.id);
      
      expect(apartmentRooms?.options).toContain('bedroom');
      expect(officeRooms?.options).toContain('conference_room');
      expect(officeRooms?.options).not.toContain('bedroom');
    });
  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });

  describe('Navigation', () => {
    it('should allow going back to previous question', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      
      const canGoBack = engine.canGoBack(session.id);
      expect(canGoBack).toBe(true);
      
      engine.goBack(session.id);
      const currentQuestion = engine.getCurrentQuestion(session.id);
      
      expect(currentQuestion?.id).toBe('property_type');
    });

    it('should not allow going back from first question', () => {
      const session = engine.createSession();
      
      const canGoBack = engine.canGoBack(session.id);
      expect(canGoBack).toBe(false);
    });

    it('should preserve answers when navigating back', () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      
      engine.goBack(session.id);
      
      const answers = engine.getAnswers(session.id);
      expect(answers['service_type']).toBe('move_out');
      expect(answers['property_type']).toBeUndefined();
    });

  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress through questions', () => {
      const session = engine.createSession();
      
      let progress = engine.getProgress(session.id);
      expect(progress.current).toBe(1);
      expect(progress.total).toBe(4);
      expect(progress.percentage).toBe(25);
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      progress = engine.getProgress(session.id);
      expect(progress.current).toBe(2);
      expect(progress.percentage).toBe(50);
    });
  });

  describe('Generate Checklist', () => {
    it('should generate checklist from completed session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      engine.answerQuestion(session.id, 'property_type', 'apartment');
      engine.answerQuestion(session.id, 'include_photos', false);
      engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      engine.getCurrentQuestion(session.id); // Trigger completion check
      
      const checklist = await engine.generateChecklist(session.id);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
    });

    it('should not generate checklist from incomplete session', async () => {
      const session = engine.createSession();
      
      engine.answerQuestion(session.id, 'service_type', 'move_out');
      
      await expect(engine.generateChecklist(session.id)).rejects.toThrow('Session not complete');
    });
  });
});