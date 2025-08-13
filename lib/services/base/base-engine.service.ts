import { ValidationUtils } from '@/lib/utils/validation.utils';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { TemplateProcessor } from '@/lib/utils/template-processor';

export abstract class BaseEngineService {
  protected validateTemplate(template: any): void {
    ValidationUtils.validateTemplate(template);
  }

  protected handleError(operation: string, error: unknown): never {
    throw ErrorHandler.createError(error, operation);
  }

  protected async executeOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return ErrorHandler.wrapAsyncOperation(operation, operationName);
  }

  protected processTemplate(template: any): any {
    return TemplateProcessor.processTemplate(template);
  }

  protected generateId(): string {
    return TemplateProcessor.generateId();
  }
}
