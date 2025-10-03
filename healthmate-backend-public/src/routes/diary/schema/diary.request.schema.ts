import z from 'zod';
import { createZodDto } from 'nestjs-zod';

// Query: ?date=YYYY-MM-DD (optional)
export const GetDiaryQuerySchema = z
    .object({
        date: z.string().optional(), // ISO date string or yyyy-mm-dd
    })
    .strict();

export class GetDiaryQueryDto extends createZodDto(GetDiaryQuerySchema) { }
