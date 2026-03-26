/**
 * User Validation Schemas
 * Zod schemas for user authentication and profile data
 */

import { z } from 'zod';

/**
 * User role enum
 */
export const userRoleSchema = z.enum(['customer', 'admin', 'operator']);

/**
 * User registration schema
 */
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z.string().min(2, 'Full name is required'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * User login schema
 */
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

/**
 * Password change schema
 */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

/**
 * Callback request schema
 */
export const callbackRequestSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company_name: z.string().optional(),
  preferred_time: z.string().optional(),
  message: z.string().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CallbackRequestInput = z.infer<typeof callbackRequestSchema>;
