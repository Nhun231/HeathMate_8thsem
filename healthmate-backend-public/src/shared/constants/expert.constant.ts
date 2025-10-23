export const CertificateStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
} as const;

export type CertificateStatusType = keyof typeof CertificateStatus;
