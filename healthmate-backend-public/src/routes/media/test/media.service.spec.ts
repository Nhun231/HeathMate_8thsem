import { MediaService } from '../media.service';
import { S3Service } from 'src/shared/services/s3.service';
import { unlink } from 'fs/promises';
import { generateRandomFilename } from 'src/shared/utils/helper';

jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
}));
jest.mock('src/shared/utils/helper', () => ({
  generateRandomFilename: jest.fn(),
}));

describe('MediaService', () => {
  let mediaService: MediaService;
  let s3Service: jest.Mocked<S3Service>;

  beforeEach(() => {
    s3Service = {
      uploadedFile: jest.fn(),
      createPresignedUrlWithClient: jest.fn(),
      createPresignedGetUrl: jest.fn(),
    } as any;

    mediaService = new MediaService(s3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload files to S3 and delete them locally', async () => {
      const files: any[] = [
        {
          filename: 'test1.png',
          path: '/tmp/test1.png',
          mimetype: 'image/png',
        },
        {
          filename: 'test2.jpg',
          path: '/tmp/test2.jpg',
          mimetype: 'image/jpeg',
        },
      ];

      s3Service.uploadedFile.mockImplementation(({ filename }) =>
        Promise.resolve({
          Location: `https://s3.amazonaws.com/${filename}`,
        } as any),
      );
      (unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await mediaService.uploadFile(files);

      expect(s3Service.uploadedFile).toHaveBeenCalledTimes(2);
      expect(unlink).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: [
          { url: 'https://s3.amazonaws.com/images/test1.png' },
          { url: 'https://s3.amazonaws.com/images/test2.jpg' },
        ],
      });
    });
  });

  describe('getPresignedPutURL', () => {
    it('should generate presigned PUT URL and key correctly', async () => {
      (generateRandomFilename as jest.Mock).mockReturnValue('abc123.png');
      s3Service.createPresignedUrlWithClient.mockResolvedValue(
        'https://s3.amazonaws.com/bucket/abc123.png?signature=xyz',
      );

      const result = await mediaService.getPresignedPutURL({
        filename: 'test.png',
      } as any);

      expect(generateRandomFilename).toHaveBeenCalledWith('test.png');
      expect(s3Service.createPresignedUrlWithClient).toHaveBeenCalledWith(
        'abc123.png',
      );
      expect(result).toEqual({
        presignedUrl:
          'https://s3.amazonaws.com/bucket/abc123.png?signature=xyz',
        key: 'bucket',
      });
    });
  });

  describe('getPresignedGetURL', () => {
    it('should return presigned GET URL from s3Service', async () => {
      s3Service.createPresignedGetUrl.mockResolvedValue(
        'https://s3.amazonaws.com/file123',
      );

      const result = await mediaService.getPresignedGetURL({ key: 'file123' });

      expect(s3Service.createPresignedGetUrl).toHaveBeenCalledWith('file123');
      expect(result).toEqual({
        presignedUrl: 'https://s3.amazonaws.com/file123',
      });
    });
  });
});
