import { randomInt } from 'crypto';
import { MongoServerError } from 'mongodb';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function isUniqueConstraintError(error: any): error is MongoServerError {
  return error instanceof MongoServerError && error.code === 11000;
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
