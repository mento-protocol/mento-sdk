import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: 'tests/.*\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/types/**/*',
    '!src/constants/**/*',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  coveragePathIgnorePatterns: ['src/constants', 'src/types'],
  coverageThreshold: {
    global: {
      statements: 80,
      functions: 80,
      branches: 70,
    },
    './src/services/borrow/': {
      statements: 80,
    },
    './src/services/trading/TradingService.ts': {
      statements: 90,
    },
    './src/utils/retry.ts': {
      statements: 80,
    },
    './src/utils/chainConfig.ts': {
      statements: 80,
    },
  },
  testTimeout: 900000,
  rootDir: '.',
  setupFiles: ['<rootDir>/tests/setup.ts'],
}

export default config
