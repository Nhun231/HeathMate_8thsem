import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/shared/services/s3.service';
import { unlink } from 'fs/promises';
import { PresignedUploadFileBodyType } from './schema/request/media.request.schema';
import { generateRandomFilename } from 'src/shared/utils/helper';
@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadedFile({
            filename: 'images/' + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return { url: res.Location };
          });
      }),
    );
    // Xóa file sau khi upload lên S3
    await Promise.all(
      files.map((file) => {
        return unlink(file.path);
      }),
    );
    return {
      data: result,
    };
  }

  async getPresignedPutURL(body: PresignedUploadFileBodyType) {
    const randomFileName = generateRandomFilename(body.filename);
    const presignedUrl =
      await this.s3Service.createPresignedUrlWithClient(randomFileName);
    const url = presignedUrl.split('?')[0];
    const key = url.split('/')[3];

    return {
      presignedUrl,
      key,
    };
  }

  async getPresignedGetURL(body: { key: string }) {
    const presignedUrl = await this.s3Service.createPresignedGetUrl(body.key);
    return { presignedUrl };
  }
}
