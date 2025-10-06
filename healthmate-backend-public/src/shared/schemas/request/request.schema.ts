import z from 'zod';

export const EmptyBodySchema = z.object({}).strict();

export const QuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    sort: z.string().optional(), // name,-age
  })
  .loose();

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>;

export type QueryType = z.infer<typeof QuerySchema>;
