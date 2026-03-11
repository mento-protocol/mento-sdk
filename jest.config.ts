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
      statements: 60,
      functions: 60,
      branches: 60,
    },
  },
  testTimeout: 900000,
  rootDir: '.',
  setupFiles: ['<rootDir>/tests/setup.ts'],
}

export default config
