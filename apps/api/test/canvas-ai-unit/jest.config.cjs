const path = require('path');
module.exports = {
  rootDir: path.resolve(__dirname, '../..'),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/canvas-ai-unit/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2020',
          module: 'commonjs',
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  clearMocks: true,
  collectCoverageFrom: [
    'src/flow/flow.controller.ts',
    'src/flow/canvas-analysis.service.ts',
    'src/flow/template-generator.service.ts',
  ],
  coverageDirectory: 'test/canvas-ai-unit/results/coverage',
  coverageReporters: ['text', 'json', 'json-summary', 'html', 'lcov'],
  maxWorkers: 1,
};
