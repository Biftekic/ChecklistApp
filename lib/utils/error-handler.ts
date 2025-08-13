export class ErrorHandler {
  static wrapOperation<T>(
    operation: () => T,
    operationName: string,
    context?: Record<string, any>
  ): T {
    try {
      return operation();
    } catch (error) {
      throw this.createError(error, operationName, context);
    }
  }

  static async wrapAsyncOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.createError(error, operationName, context);
    }
  }

  static createError(
    error: unknown,
    operationName: string,
    context?: Record<string, any>
  ): Error {
    const baseMessage = `${operationName} failed`;
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'Unknown error';
    }

    const fullMessage = `${baseMessage}: ${errorMessage}`;
    const customError = new Error(fullMessage);

    if (context) {
      (customError as any).context = context;
    }

    (customError as any).operation = operationName;

    return customError;
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelay?: number;
      backoffFactor?: number;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      backoffFactor = 2,
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        await this.delay(delay);
        delay *= backoffFactor;
      }
    }

    throw lastError!;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
