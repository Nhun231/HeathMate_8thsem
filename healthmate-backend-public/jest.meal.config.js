module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'routes/meal/**/*.(t|j)s',
    '!routes/meal/**/*.spec.ts',
    '!routes/meal/**/*.interface.ts',
    '!routes/meal/**/*.dto.ts',
    '!routes/meal/**/*.error.ts',
    '!routes/meal/**/*.module.ts',
    '!routes/meal/mock-data.ts',
    '!routes/meal/meal.repo.ts', // Exclude repo from coverage
  ],
  coverageDirectory: '../coverage/meal',
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
