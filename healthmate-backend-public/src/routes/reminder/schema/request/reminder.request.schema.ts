import { z } from 'zod';

const ScheduleItemSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:mm format required'),
  amount: z.number().int().positive(),
});

// 1. Cập nhật cài đặt nhắc nhở uống nước
export const UpdateReminderSettingSchema = z.object({
  wakeUpTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:mm format required'),
  sleepTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:mm format required'),
  reminderGap: z.number().int().positive(), // phút
  expoPushToken: z.string().optional(),    // ExponentPushToken
  schedule: z.array(ScheduleItemSchema).optional(), // cho phép user gửi custom schedule
}).strict(); 

// 2. Lấy lịch nhắc nhở
export const GetReminderScheduleSchema = z.object({}).strict(); // Không cần param

// Type inference
export type UpdateReminderSettingType = z.infer<typeof UpdateReminderSettingSchema>;
export type GetReminderScheduleType = z.infer<typeof GetReminderScheduleSchema>;
