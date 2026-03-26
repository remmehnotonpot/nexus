import { describe, it, expect } from 'vitest';
import { 
  registerUserSchema, 
  loginUserSchema, 
  updateProfileSchema,
  changePasswordSchema,
  callbackRequestSchema 
} from './user';

describe('User Schemas', () => {
  describe('registerUserSchema', () => {
    it('validates user registration', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'SecurePass123',
        full_name: 'John Doe',
        company_name: 'Acme Corp',
        phone: '+1234567890',
      };

      const result = registerUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('validates password strength - requires uppercase', () => {
      const weakPassword = {
        email: 'test@example.com',
        password: 'lowercase123',
        full_name: 'John Doe',
      };

      const result = registerUserSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('validates password strength - requires lowercase', () => {
      const weakPassword = {
        email: 'test@example.com',
        password: 'UPPERCASE123',
        full_name: 'John Doe',
      };

      const result = registerUserSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('validates password strength - requires number', () => {
      const weakPassword = {
        email: 'test@example.com',
        password: 'NoNumbersHere',
        full_name: 'John Doe',
      };

      const result = registerUserSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('validates password strength - minimum length', () => {
      const shortPassword = {
        email: 'test@example.com',
        password: 'Short1',
        full_name: 'John Doe',
      };

      const result = registerUserSchema.safeParse(shortPassword);
      expect(result.success).toBe(false);
    });

    it('validates email format', () => {
      const invalidEmail = {
        email: 'not-an-email',
        password: 'SecurePass123',
        full_name: 'John Doe',
      };

      const result = registerUserSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('rejects missing full_name', () => {
      const missingName = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const result = registerUserSchema.safeParse(missingName);
      expect(result.success).toBe(false);
    });
  });

  describe('loginUserSchema', () => {
    it('validates login credentials', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = loginUserSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalidLogin = {
        email: 'not-email',
        password: 'password',
      };

      const result = loginUserSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const emptyPassword = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginUserSchema.safeParse(emptyPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('validates profile updates', () => {
      const validUpdate = {
        full_name: 'Jane Doe',
        company_name: 'New Corp',
        phone: '+9876543210',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const result = updateProfileSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('validates partial updates', () => {
      const partialUpdate = {
        full_name: 'Jane Doe',
      };

      const result = updateProfileSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('validates avatar URL', () => {
      const invalidUrl = {
        avatar_url: 'not-a-url',
      };

      const result = updateProfileSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('validates password change with matching passwords', () => {
      const validChange = {
        current_password: 'OldPass123',
        new_password: 'NewPass123',
        confirm_password: 'NewPass123',
      };

      const result = changePasswordSchema.safeParse(validChange);
      expect(result.success).toBe(true);
    });

    it('rejects non-matching passwords', () => {
      const nonMatching = {
        current_password: 'OldPass123',
        new_password: 'NewPass123',
        confirm_password: 'DifferentPass123',
      };

      const result = changePasswordSchema.safeParse(nonMatching);
      expect(result.success).toBe(false);
    });

    it('requires strong new password', () => {
      const weakNewPassword = {
        current_password: 'OldPass123',
        new_password: 'weak',
        confirm_password: 'weak',
      };

      const result = changePasswordSchema.safeParse(weakNewPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('callbackRequestSchema', () => {
    it('validates callback request', () => {
      const validRequest = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company_name: 'Acme Corp',
        preferred_time: 'Morning',
        message: 'Please call me back',
      };

      const result = callbackRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('requires required fields', () => {
      const missingFields = {
        full_name: 'John Doe',
      };

      const result = callbackRequestSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });

    it('validates email format', () => {
      const invalidEmail = {
        full_name: 'John Doe',
        email: 'invalid-email',
        phone: '+1234567890',
      };

      const result = callbackRequestSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });
  });
});
