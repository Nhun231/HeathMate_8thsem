#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const moduleType = args[0] || 'all';
const moduleName = args[1];

const testCommands = {
  service: 'npm test -- --config jest.config.js --testPathPatterns=".*\\.service\\.spec\\.ts$" --coverage --coverageReporters=text --collectCoverageFrom="src/routes/**/*.ts" --coveragePathIgnorePatterns="src/routes/**/*.spec.ts"',
  controller: 'npm test -- --config jest.config.js --testPathPatterns=".*\\.controller\\.spec\\.ts$" --coverage --coverageReporters=text --collectCoverageFrom="src/routes/**/*.ts" --coveragePathIgnorePatterns="src/routes/**/*.spec.ts"',
  all: 'npm test -- --config jest.config.js --coverage --coverageReporters=text',
  module: (name) => {
    const configFiles = {
      'ingredient': 'jest.module.config.js',
      'dish': 'jest.dish.config.js',
      'meal': 'jest.meal.config.js',
    };
    const configFile = configFiles[name] || 'jest.module.config.js';
    return `npm test -- --config ${configFile} --testPathPatterns="src/routes/${name}/.*\\.spec\\.ts$"`;
  },
};

function runTests() {
  try {
    console.log(`🧪 Running ${moduleType} tests${moduleName ? ` for ${moduleName}` : ''}...`);
    
    let command;
    if (moduleType === 'module' && moduleName) {
      command = testCommands.module(moduleName);
    } else if (testCommands[moduleType]) {
      command = testCommands[moduleType];
    } else {
      console.error(`❌ Unknown test type: ${moduleType}`);
      console.log('Available types: service, controller, all, module');
      process.exit(1);
    }

    console.log(`📋 Command: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Tests completed successfully!');
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 Test Runner for HealthMate Backend

Usage:
  node scripts/test-modules.js <type> [module]

Types:
  service     - Run only service tests
  controller  - Run only controller tests  
  all         - Run all tests (default)
  module      - Run tests for specific module

Examples:
  node scripts/test-modules.js service
  node scripts/test-modules.js controller
  node scripts/test-modules.js module ingredient
  node scripts/test-modules.js all

Available modules:
  - ingredient
  - user
  - calculation
  - dietplan
  - dish
  - meal
  - auth
`);
  process.exit(0);
}

runTests();
