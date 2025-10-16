import { randomInt } from 'crypto';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function isUniqueConstraintError(error: any): boolean {
  return (
    error &&
    typeof error === 'object' &&
    error.code === 11000 &&
    (error.name === 'MongoServerError' || error.name === 'MongoError')
  );
}

export function isNotFoundError(error: any): boolean {
  return error instanceof Error && error.name === 'DocumentNotFoundError';
}

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const generateRandomFilename = (filename: string) => {
  const ext = path.extname(filename);
  return `${uuidv4()}${ext}`;
};
