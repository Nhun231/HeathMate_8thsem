module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'routes/dish/**/*.(t|j)s',
    '!routes/dish/**/*.spec.ts',
    '!routes/dish/**/*.interface.ts',
    '!routes/dish/**/*.dto.ts',
    '!routes/dish/**/*.error.ts',
    '!routes/dish/**/*.module.ts',
    '!routes/dish/mock-data.ts',
    '!routes/dish/dish.repo.ts', // Exclude repo from coverage
  ],
  coverageDirectory: '../coverage/dish',
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
