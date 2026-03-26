import { describe, it, expect } from 'vitest';
import { 
  ApiError, 
  NotFoundError, 
  ValidationError, 
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  handleError,
  getErrorMessage,
  isNotFoundError,
  isValidationError,
  isAuthenticationError
} from './errors';

describe('Error Handling', () => {
  describe('ApiError', () => {
    it('creates ApiError with correct properties', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('applies default status code and code', () => {
      const error = new ApiError('Test error');
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('creates NotFoundError with 404 status', () => {
      const error = new NotFoundError('Shipment');
      
      expect(error.message).toBe('Shipment not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });

    it('uses default resource name', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ValidationError', () => {
    it('creates ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('uses default message', () => {
      const error = new ValidationError();
      
      expect(error.message).toBe('Validation failed');
    });
  });

  describe('AuthenticationError', () => {
    it('creates AuthenticationError with 401 status', () => {
      const error = new AuthenticationError();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('AuthorizationError', () => {
    it('creates AuthorizationError with 403 status', () => {
      const error = new AuthorizationError();
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('ConflictError', () => {
    it('creates ConflictError with 409 status', () => {
      const error = new ConflictError();
      
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('RateLimitError', () => {
    it('creates RateLimitError with 429 status', () => {
      const error = new RateLimitError();
      
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('DatabaseError', () => {
    it('creates DatabaseError with 500 status', () => {
      const error = new DatabaseError();
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('ExternalServiceError', () => {
    it('creates ExternalServiceError with 503 status', () => {
      const error = new ExternalServiceError('Payment gateway');
      
      expect(error.message).toBe('Payment gateway unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('handleError', () => {
    it('returns ApiError as-is', () => {
      const original = new ValidationError('Invalid');
      const result = handleError(original);
      
      expect(result).toBe(original);
    });

    it('wraps standard Error in ApiError', () => {
      const original = new Error('Something went wrong');
      const result = handleError(original);
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.message).toBe('Something went wrong');
    });

    it('handles unknown errors gracefully', () => {
      const result = handleError('string error');
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.message).toBe('An unknown error occurred');
    });
  });

  describe('getErrorMessage', () => {
    it('returns message from Error', () => {
      const error = new Error('Test message');
      
      expect(getErrorMessage(error)).toBe('Test message');
    });

    it('returns default for non-errors', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
    });
  });

  describe('type guards', () => {
    it('identifies NotFoundError', () => {
      const error = new NotFoundError();
      
      expect(isNotFoundError(error)).toBe(true);
      expect(isValidationError(error)).toBe(false);
    });

    it('identifies ValidationError', () => {
      const error = new ValidationError();
      
      expect(isValidationError(error)).toBe(true);
      expect(isNotFoundError(error)).toBe(false);
    });

    it('identifies AuthenticationError', () => {
      const error = new AuthenticationError();
      
      expect(isAuthenticationError(error)).toBe(true);
    });

    it('returns false for non-matching errors', () => {
      const error = new Error('Standard error');
      
      expect(isNotFoundError(error)).toBe(false);
      expect(isValidationError(error)).toBe(false);
      expect(isAuthenticationError(error)).toBe(false);
    });
  });
});
