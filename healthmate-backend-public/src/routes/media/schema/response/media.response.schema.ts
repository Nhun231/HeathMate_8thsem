import z from 'zod';

export const UploadFilesResponseSchema = z.object({
  data: z.array(
    z.object({
      url: z.string(),
    }),
  ),
});

export const PresignedUploadFileResponseSchema = z.object({
  presignedUrl: z.string(),
  key: z.string(),
});
