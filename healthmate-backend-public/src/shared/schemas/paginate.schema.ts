import z from 'zod';

export const PaginateSchema = z
  .object({
    // ---- Offset pagination ----
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).default(10).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    
    // ---- Search and filtering ----
    type: z.string().optional(),
    search: z.string().optional(),
    
    // ---- Keyset pagination ----
    cursor: z.string().optional(), // lastId
    lastSortValue: z.coerce.number().optional(),
    
    // ---- Sorting ----
    sortBy: z.string().default('_id').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
  })
  .strict();

export type PaginateType = z.infer<typeof PaginateSchema>;
