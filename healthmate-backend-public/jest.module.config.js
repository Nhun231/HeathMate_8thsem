module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'routes/ingredient/**/*.(t|j)s',
    '!routes/ingredient/**/*.spec.ts',
    '!routes/ingredient/**/*.interface.ts',
    '!routes/ingredient/**/*.dto.ts',
    '!routes/ingredient/**/*.error.ts',
    '!routes/ingredient/**/*.module.ts',
    '!routes/ingredient/mock-data.ts',
    '!routes/ingredient/ingredient.repo.ts', // Exclude repo from coverage
  ],
  coverageDirectory: '../coverage/ingredient',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 100, // 100% for tested files only
      lines: 70,
      statements: 70,
    },
  },
};
