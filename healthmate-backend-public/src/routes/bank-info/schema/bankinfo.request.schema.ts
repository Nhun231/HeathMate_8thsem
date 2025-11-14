import z from 'zod';

export const BankInfoCreateBodySchema = z.object({
    bankName: z.string().min(3),
    accountNumber: z.string()
        .min(8)
        .max(15),
    accountHolderName: z.string()
        .min(5)
        .max(64),
    branch: z.string().optional(),
}).strict();

export const BankInfoUpdateBodySchema = z.object({
    bankName: z.string().min(3).optional(),
    accountNumber: z.string().min(8).max(15).optional(),
    accountHolderName: z.string().min(5).max(64).optional(),
    branch: z.string().min(2).max(15).optional(),
}).strict();

export const BankInfoParamsSchema = z.object({
    bankInfoId: z.string().min(1),
}).strict();

export type BankInfoCreateBodyType = z.infer<typeof BankInfoCreateBodySchema>;
export type BankInfoUpdateBodyType = z.infer<typeof BankInfoUpdateBodySchema>;
export type BankInfoParamsType = z.infer<typeof BankInfoParamsSchema>;
