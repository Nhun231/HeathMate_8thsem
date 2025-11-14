import { createZodDto } from 'nestjs-zod';
import { BankInfoCreateBodySchema, BankInfoUpdateBodySchema, BankInfoParamsSchema } from './schema/bankinfo.request.schema';

export class CreateBankInfoDTO extends createZodDto(BankInfoCreateBodySchema) {}
export class UpdateBankInfoDTO extends createZodDto(BankInfoUpdateBodySchema) {}
export class BankInfoParamsDTO extends createZodDto(BankInfoParamsSchema) {}
