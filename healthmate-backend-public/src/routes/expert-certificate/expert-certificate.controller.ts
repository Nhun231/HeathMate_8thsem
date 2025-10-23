import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ExpertCertificateService } from './expert-certificate.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { DeleteResult, Types } from 'mongoose';
import {
  CreateCertificateBodyDto,
  GetCertificateParamsDto,
  UpdateCertificateBodyDto,
} from './expert-certificate.dto';
import { QuerySchema } from 'src/shared/schemas/request/request.schema';

@Controller('v1/expert-certificate')
export class ExpertCertificateController {
  constructor(
    private readonly expertCertificateService: ExpertCertificateService,
  ) { }

  @Post()
  async create(
    @ActiveUser('userId') userId: Types.ObjectId,
    @Body() body: CreateCertificateBodyDto,
  ) {
    console.log(userId);
    return this.expertCertificateService.create({ userId, data: body });
  }

  @Get()
  list(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.expertCertificateService.list(parsed);
  }

  @Get(':certificateId')
  findOne(@Param() params: GetCertificateParamsDto) {
    return this.expertCertificateService.findOne(params.certificateId);
  }

  @Put(':certificateId')
  update(
    @Param() params: GetCertificateParamsDto,
    @Body() body: UpdateCertificateBodyDto,
  ) {
    return this.expertCertificateService.update({
      id: params.certificateId,
      data: body,
    });
  }

  @Delete(':certificateId')
  delete(@Param() params: GetCertificateParamsDto): Promise<DeleteResult> {
    return this.expertCertificateService.delete(params.certificateId);
  }
}
