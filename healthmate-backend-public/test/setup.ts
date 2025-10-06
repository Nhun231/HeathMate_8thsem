// Global test setup
import { Test } from '@nestjs/testing';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test';

// Global test utilities
global.createMockModule = async (providers: any[], controllers: any[] = []) => {
  return Test.createTestingModule({
    controllers,
    providers,
  }).compile();
};

// Mock MongoDB ObjectId
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  Types: {
    ObjectId: Object.assign(
      jest.fn().mockImplementation((id) => ({
        toString: () => id || '507f1f77bcf86cd799439011',
        toHexString: () => id || '507f1f77bcf86cd799439011',
      })),
      {
        isValid: jest.fn().mockImplementation((id) => {
          // Simple validation - check if it's a 24 character hex string
          return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        }),
      }
    ),
  },
}));
