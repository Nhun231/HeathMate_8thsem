import { z } from 'zod';

// 1. Track / Add water intake 
export const AddWaterSchema = z.object({
    amount: z.number().positive(), // ml
}).strict();

// 2. Get water data by date 
export const GetWaterByDateSchema = z.object({

    date: z.string().optional(), // YYYY-MM-DD, nếu không gửi thì lấy ngày hôm nay
}).strict();

// 3. Update water intake amount 
export const UpdateWaterHistorySchema = z.object({
    date: z.string(),
    recordId: z.string().min(1),
    amount: z.number().positive(),
}).strict();

// 4. Delete water intake record 
export const DeleteWaterHistorySchema = z.object({
    date: z.string(),
    recordId: z.string().min(1),
}).strict();

// Type inference
export type AddWaterType = z.infer<typeof AddWaterSchema>;
export type GetWaterByDateType = z.infer<typeof GetWaterByDateSchema>;
export type UpdateWaterHistoryType = z.infer<typeof UpdateWaterHistorySchema>;
export type DeleteWaterHistoryType = z.infer<typeof DeleteWaterHistorySchema>;
