import { CertificateStatus } from 'src/shared/constants/expert.constant';
import z from 'zod';

export const CreateCertificateBodySchema = z.object({
  certificateURLKey: z.string().max(500),
});

export const GetCertificateParamsSchema = z
  .object({
    certificateId: z.string(),
  })
  .strict();

export const UpdateCertificateBodySchema = z
  .object({
    certificateURLKey: z.string().max(500),
    status: z.enum([
      CertificateStatus.Pending,
      CertificateStatus.Approved,
      CertificateStatus.Rejected,
    ]),
  })
  .partial();

export const DeleteCertificateParamsSchema = GetCertificateParamsSchema;

export type CreateCertificateBodyType = z.infer<
  typeof CreateCertificateBodySchema
>;

export type GetCertificateParamsType = z.infer<
  typeof GetCertificateParamsSchema
>;

export type UpdateCertificateBodyType = z.infer<
  typeof UpdateCertificateBodySchema
>;

export type DeleteCertificateParamsType = z.infer<
  typeof DeleteCertificateParamsSchema
>;
