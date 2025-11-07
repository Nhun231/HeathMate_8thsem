import { createZodDto } from 'nestjs-zod';
import {
  UpdateReminderSettingSchema,
  GetReminderScheduleSchema
} from './schema/request/reminder.request.schema';

export class UpdateReminderSettingDto extends createZodDto(UpdateReminderSettingSchema) {}
export class GetReminderScheduleDto extends createZodDto(GetReminderScheduleSchema) {}
