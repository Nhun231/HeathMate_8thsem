import { createZodDto } from 'nestjs-zod';
import {
    AddWaterSchema,
    GetWaterByDateSchema,
    UpdateWaterHistorySchema,
    DeleteWaterHistorySchema,
} from './schema/request/water.request.schema';

export class AddWaterDto extends createZodDto(AddWaterSchema) { }
export class GetWaterByDateDto extends createZodDto(GetWaterByDateSchema) { }
export class UpdateWaterHistoryDto extends createZodDto(UpdateWaterHistorySchema) { }
export class DeleteWaterHistoryDto extends createZodDto(DeleteWaterHistorySchema) { }
