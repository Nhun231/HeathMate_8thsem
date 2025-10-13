import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import path from 'path';
import { UPLOAD_DIR } from 'src/shared/constants/media.constant';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { MediaService } from './media.service';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  PresignedUploadFileBodyDTO,
  PresignedUploadFileResponseDTO,
  UploadFilesResponseDTO,
} from './media.dto';

@Controller('v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @ZodSerializerDto(UploadFilesResponseDTO)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  )
  uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    // console.log(files);
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    // }));
    return this.mediaService.uploadFile(files);
  }

  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        const notFound = new NotFoundException('File not found');
        res.status(notFound.getStatus()).json(notFound.getResponse());
      }
    });
  }

  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResponseDTO)
  @IsPublic()
  async getPresignedURL(@Body() body: PresignedUploadFileBodyDTO) {
    console.log(body);
    return this.mediaService.getPresignedPutURL(body);
  }

  @Post('images/presigned-get-url')
  @IsPublic()
  async getPresignedGetURL(@Body() body: { key: string }) {
    return this.mediaService.getPresignedGetURL(body);
  }
}
