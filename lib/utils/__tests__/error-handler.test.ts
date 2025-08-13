import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler } from '../error-handler';

describe('ErrorHandler', () => {
  describe('wrapOperation', () => {
    it('should return result when operation succeeds', () => {
      const operation = () => 'success';
      const result = ErrorHandler.wrapOperation(operation, 'Test operation');
      expect(result).toBe('success');
    });

    it('should throw formatted error when operation fails', () => {
      const operation = () => { throw new Error('Operation failed'); };
      expect(() => ErrorHandler.wrapOperation(operation, 'Test operation'))
        .toThrow('Test operation failed: Operation failed');
    });

    it('should handle non-Error throws', () => {
      const operation = () => { throw 'string error'; };
      expect(() => ErrorHandler.wrapOperation(operation, 'Test operation'))
        .toThrow('Test operation failed: string error');
    });
  });

  describe('wrapAsyncOperation', () => {
    it('should return result when async operation succeeds', async () => {
      const operation = async () => 'async success';
      const result = await ErrorHandler.wrapAsyncOperation(operation, 'Async operation');
      expect(result).toBe('async success');
    });

    it('should throw formatted error when async operation fails', async () => {
      const operation = async () => { throw new Error('Async failed'); };
      await expect(ErrorHandler.wrapAsyncOperation(operation, 'Async operation'))
        .rejects.toThrow('Async operation failed: Async failed');
    });
  });

  describe('createError', () => {
    it('should create error with message from Error object', () => {
      const error = new Error('Original error');
      const result = ErrorHandler.createError(error, 'Operation');
      expect(result.message).toBe('Operation failed: Original error');
    });

    it('should create error with string error', () => {
      const result = ErrorHandler.createError('String error', 'Operation');
      expect(result.message).toBe('Operation failed: String error');
    });

    it('should handle unknown error types', () => {
      const result = ErrorHandler.createError(null, 'Operation');
      expect(result.message).toBe('Operation failed: Unknown error');
    });

    it('should add context when provided', () => {
      const error = new Error('Test');
      const context = { userId: 123 };
      const result = ErrorHandler.createError(error, 'Operation', context);
      expect((result as any).context).toEqual(context);
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await ErrorHandler.retryOperation(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce('success');
      
      const result = await ErrorHandler.retryOperation(operation, {
        maxRetries: 2,
        initialDelay: 1
      });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(ErrorHandler.retryOperation(operation, {
        maxRetries: 2,
        initialDelay: 1
      })).rejects.toThrow('Always fails');
      
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});
