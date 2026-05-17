import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(128),
});

export const userOutputSchema = z.object({
  id: z.number(),
  username: z.string(),
  isAdmin: z.boolean(),
});

export const loginResponseSchema = z.object({
  user: userOutputSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserOutput = z.infer<typeof userOutputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;