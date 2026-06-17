import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/reports',
      filename: 'jest-unit-report.html',
      pageTitle: 'DevForge Unit Test Report',
      expand: true,
    }]
  ],
  coverageDirectory: './tests/reports/coverage',
  collectCoverageFrom: [
    'src/app/actions/**/*.ts',
    'src/lib/**/*.ts',
    '!src/**/*.d.ts',
  ],
};

export default config;
