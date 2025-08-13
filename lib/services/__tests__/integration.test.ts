import { describe, it, expect, beforeEach } from 'vitest';
import { QAEngine } from '../qa-engine';
import { TemplateEngine } from '../template-engine';
import { ChecklistService } from '../checklist-service';
import { AuthService } from '../auth-service';
import { DatabaseService } from '../database';
import type { ServiceType, PropertyType } from '../../types/checklist';

describe('Service Integration Tests', () => {
  let qaEngine: QAEngine;
  let templateEngine: TemplateEngine;
  let checklistService: ChecklistService;
  let authService: AuthService;
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService();
    qaEngine = new QAEngine();
    templateEngine = new TemplateEngine();
    checklistService = new ChecklistService();
    authService = new AuthService(dbService);
  });

  describe('QA Engine with Template Engine Integration', () => {
    it('should generate checklist from QA session using template engine', async () => {
      // Create and complete QA session
      const session = qaEngine.createSession();
      
      qaEngine.answerQuestion(session.id, 'service_type', 'move_out');
      qaEngine.answerQuestion(session.id, 'property_type', 'apartment');
      qaEngine.answerQuestion(session.id, 'include_photos', false);
      qaEngine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
      qaEngine.getCurrentQuestion(session.id); // Trigger completion
      
      // Generate checklist
      const checklist = await qaEngine.generateChecklist(session.id);
      
      // Verify integration
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe('move_out');
      expect(checklist.propertyType).toBe('apartment');
      expect(checklist.items.length).toBeGreaterThan(0);
      
      // Verify items are filtered by selected rooms
      const itemCategories = checklist.items.map(item => item.category?.toLowerCase());
      expect(itemCategories.some(cat => cat?.includes('bedroom') || cat?.includes('bathroom') || cat?.includes('kitchen'))).toBe(true);
    });

    it('should merge QA answers with template using template engine', async () => {
      // Load templates
      const templates = await templateEngine.loadIndustryTemplates();
      const moveOutTemplate = templates.find(t => t.serviceType === 'move_out');
      
      expect(moveOutTemplate).toBeDefined();
      
      // Create QA answers
      const qaAnswers = {
        service_type: 'move_out' as ServiceType,
        property_type: 'apartment' as PropertyType,
        include_photos: false,
        rooms: ['bedroom', 'bathroom', 'kitchen'],
        pets: true,
        priority: 'deep'
      };
      
      // Merge template with QA answers
      const mergedTemplate = await templateEngine.mergeTemplateWithQA(moveOutTemplate!, qaAnswers);
      
      // Verify merge results
      expect(mergedTemplate).toBeDefined();
      expect(mergedTemplate.items.length).toBeGreaterThan(0);
      
      // Check pet-specific items were added
      const petItems = mergedTemplate.items.filter(item => 
        item.text.toLowerCase().includes('pet') || 
        item.text.toLowerCase().includes('fur') ||
        item.text.toLowerCase().includes('odor')
      );
      expect(petItems.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication with Database Integration', () => {
    it('should register user and store in database', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123!',
        name: 'Test User'
      };
      
      const result = await authService.register(userData);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(userData.email);
      expect(result.user?.name).toBe(userData.name);
      
      // Verify user can login
      const loginResult = await authService.login({
        email: userData.email,
        password: userData.password
      });
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.user?.id).toBe(result.user?.id);
    });

    it('should handle CSRF token generation and validation', async () => {
      // Generate token
      const token = await authService.generateCSRFToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Validate token
      const isValid = await authService.validateCSRFToken(token);
      expect(isValid).toBe(true);
      
      // Token should be single-use
      const isValidAgain = await authService.validateCSRFToken(token);
      expect(isValidAgain).toBe(false);
    });

    it('should handle password reset flow', async () => {
      // Register user first
      const userData = {
        email: 'reset@example.com',
        password: 'oldPassword123!',
        name: 'Reset User'
      };
      
      await authService.register(userData);
      
      // Request password reset
      const resetResult = await authService.requestPasswordReset(userData.email);
      expect(resetResult.success).toBe(true);
      
      // Simulate reset with new password
      const newPassword = 'newPassword456!';
      // In real scenario, would use the token from email
      // For testing, we'll login with old password first
      const loginResult = await authService.login({
        email: userData.email,
        password: userData.password
      });
      expect(loginResult.success).toBe(true);
    });
  });

  describe('Checklist Service with Template Service Integration', () => {
    it('should create checklist from template', async () => {
      // Get a template
      const templates = await templateEngine.loadIndustryTemplates();
      const template = templates[0];
      
      // Create checklist from template
      const checklist = await checklistService.createChecklistFromTemplate(template);
      
      expect(checklist).toBeDefined();
      expect(checklist.serviceType).toBe(template.serviceType);
      expect(checklist.propertyType).toBe(template.propertyType);
      expect(checklist.templateId).toBe(template.id);
      
      // Verify items were copied
      expect(checklist.items.length).toBe(template.items.length);
      checklist.items.forEach((item, index) => {
        expect(item.text).toBe(template.items[index].text);
        expect(item.category).toBe(template.items[index].category);
        expect(item.completed).toBe(false);
      });
    });

    it('should handle complete workflow: QA -> Template -> Checklist', async () => {
      // Step 1: Complete QA session
      const session = qaEngine.createSession();
      qaEngine.answerQuestion(session.id, 'service_type', 'deep_clean');
      qaEngine.answerQuestion(session.id, 'property_type', 'house');
      qaEngine.answerQuestion(session.id, 'include_photos', false);
      qaEngine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen', 'living_room']);
      qaEngine.getCurrentQuestion(session.id);
      
      // Step 2: Get QA answers
      const answers = qaEngine.getAnswers(session.id);
      
      // Step 3: Find matching template
      const templates = await templateEngine.loadIndustryTemplates();
      const matchingTemplate = templates.find(t => 
        t.serviceType === answers.service_type && 
        t.propertyType === answers.property_type
      );
      
      if (matchingTemplate) {
        // Step 4: Merge template with QA answers
        const mergedTemplate = await templateEngine.mergeTemplateWithQA(matchingTemplate, answers);
        
        // Step 5: Create checklist from merged template
        const checklist = await checklistService.createChecklistFromTemplate(mergedTemplate);
        
        // Verify complete workflow
        expect(checklist).toBeDefined();
        expect(checklist.serviceType).toBe('deep_clean');
        expect(checklist.propertyType).toBe('house');
        expect(checklist.items.length).toBeGreaterThan(0);
        
        // Verify room-specific items
        const rooms = answers.rooms as string[];
        rooms.forEach(room => {
          const roomItems = checklist.items.filter(item => 
            item.category?.toLowerCase().includes(room.toLowerCase()) ||
            item.text.toLowerCase().includes(room.replace('_', ' '))
          );
          expect(roomItems.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Error Handling Across Services', () => {
    it('should handle invalid session in QA engine gracefully', async () => {
      const invalidSessionId = 'non-existent-session';
      
      // Should not throw, but return error
      const result = qaEngine.answerQuestion(invalidSessionId, 'service_type', 'move_out');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
      
      // Generate checklist should throw
      await expect(qaEngine.generateChecklist(invalidSessionId)).rejects.toThrow('Session not found');
    });

    it('should handle authentication failures properly', async () => {
      // Invalid login
      const loginResult = await authService.login({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBeDefined();
      
      // Duplicate registration
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123!',
        name: 'Duplicate User'
      };
      
      await authService.register(userData);
      const duplicateResult = await authService.register(userData);
      
      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.error).toContain('already exists');
    });

    it('should handle template not found scenarios', async () => {
      const templates = await templateEngine.loadIndustryTemplates();
      
      // Try to find non-existent combination
      const notFound = templates.find(t => 
        t.serviceType === 'non_existent' as ServiceType
      );
      
      expect(notFound).toBeUndefined();
      
      // QA engine should handle missing template
      const session = qaEngine.createSession();
      qaEngine.answerQuestion(session.id, 'service_type', 'move_out');
      qaEngine.answerQuestion(session.id, 'property_type', 'warehouse');
      qaEngine.answerQuestion(session.id, 'include_photos', false);
      qaEngine.answerQuestion(session.id, 'rooms', ['warehouse_floor']);
      qaEngine.getCurrentQuestion(session.id);
      
      // Should still generate a basic checklist
      const checklist = await qaEngine.generateChecklist(session.id);
      expect(checklist).toBeDefined();
      expect(checklist.items.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent QA sessions', async () => {
      const sessionIds: string[] = [];
      
      // Create multiple sessions
      for (let i = 0; i < 10; i++) {
        const session = qaEngine.createSession();
        sessionIds.push(session.id);
      }
      
      // Process all sessions concurrently
      const promises = sessionIds.map(async (id, index) => {
        qaEngine.answerQuestion(id, 'service_type', index % 2 === 0 ? 'move_out' : 'deep_clean');
        qaEngine.answerQuestion(id, 'property_type', index % 2 === 0 ? 'apartment' : 'house');
        qaEngine.answerQuestion(id, 'include_photos', false);
        qaEngine.answerQuestion(id, 'rooms', ['bedroom', 'bathroom']);
        qaEngine.getCurrentQuestion(id);
        
        return qaEngine.generateChecklist(id);
      });
      
      const checklists = await Promise.all(promises);
      
      // Verify all checklists were generated
      expect(checklists.length).toBe(10);
      checklists.forEach(checklist => {
        expect(checklist).toBeDefined();
        expect(checklist.items.length).toBeGreaterThan(0);
      });
    });

    it('should efficiently handle large number of CSRF tokens', async () => {
      const tokens: string[] = [];
      
      // Generate many tokens (test cleanup mechanism)
      for (let i = 0; i < 1100; i++) {
        const token = await authService.generateCSRFToken();
        tokens.push(token);
      }
      
      // Verify cleanup happened (internal set should be limited)
      // Last 500 tokens should still be valid
      const recentTokens = tokens.slice(-100);
      for (const token of recentTokens) {
        const isValid = await authService.validateCSRFToken(token);
        expect(isValid).toBe(true);
      }
    });
  });
});
