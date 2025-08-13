import { describe, it, expect } from 'vitest';
import { ValidationUtils } from '../validation.utils';

describe('ValidationUtils', () => {
  describe('validateTemplate', () => {
    it('should throw error when template is null', () => {
      expect(() => ValidationUtils.validateTemplate(null))
        .toThrow('Template is required');
    });

    it('should throw error when template title is missing', () => {
      const template = { sections: [] };
      expect(() => ValidationUtils.validateTemplate(template))
        .toThrow('Template title is required');
    });

    it('should throw error when sections array is empty', () => {
      const template = { title: 'Test', sections: [] };
      expect(() => ValidationUtils.validateTemplate(template))
        .toThrow('Template must have at least one section');
    });

    it('should pass validation for valid template', () => {
      const template = {
        title: 'Valid Template',
        sections: [{ title: 'Section 1', items: [] }]
      };
      expect(() => ValidationUtils.validateTemplate(template)).not.toThrow();
    });
  });

  describe('isValidObject', () => {
    it('should return true for plain objects', () => {
      expect(ValidationUtils.isValidObject({})).toBe(true);
    });

    it('should return false for null', () => {
      expect(ValidationUtils.isValidObject(null)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(ValidationUtils.isValidObject([])).toBe(false);
    });
  });
});
