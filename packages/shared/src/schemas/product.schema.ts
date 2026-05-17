import { z } from 'zod';

export const productCreateSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  category: z.string().max(100).optional(),
  supplierId: z.number().int().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productSearchSchema = z.object({
  query: z.string().min(1).max(200),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;