import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseEngineService } from '../base-engine.service';
import { ValidationUtils } from '@/lib/utils/validation.utils';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { TemplateProcessor } from '@/lib/utils/template-processor';

// Create a concrete implementation for testing
class TestEngineService extends BaseEngineService {
  public testValidateTemplate(template: any): void {
    return this.validateTemplate(template);
  }

  public async testExecuteOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return this.executeOperation(operation, operationName);
  }

  public testProcessTemplate(template: any): any {
    return this.processTemplate(template);
  }

  public testGenerateId(): string {
    return this.generateId();
  }
}

describe('BaseEngineService', () => {
  let service: TestEngineService;

  beforeEach(() => {
    service = new TestEngineService();
    vi.clearAllMocks();
  });

  describe('validateTemplate', () => {
    it('should call ValidationUtils.validateTemplate', () => {
      const spy = vi.spyOn(ValidationUtils, 'validateTemplate');
      const template = { title: 'Test', sections: [{ title: 'Section' }] };
      
      service.testValidateTemplate(template);
      
      expect(spy).toHaveBeenCalledWith(template);
    });
  });

  describe('executeOperation', () => {
    it('should return operation result', async () => {
      const operation = async () => 'test-result';
      
      const result = await service.testExecuteOperation(operation, 'TestOp');
      
      expect(result).toBe('test-result');
    });

    it('should handle operation errors', async () => {
      const operation = async () => { throw new Error('Operation failed'); };
      
      await expect(service.testExecuteOperation(operation, 'TestOp'))
        .rejects.toThrow('TestOp failed: Operation failed');
    });
  });

  describe('processTemplate', () => {
    it('should return processed template', () => {
      const template = { title: 'Test', sections: [] };
      
      const result = service.testProcessTemplate(template);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('generateId', () => {
    it('should return a valid UUID', () => {
      const id = service.testGenerateId();
      
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});
