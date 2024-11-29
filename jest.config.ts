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
  testTimeout: 20000,
  rootDir: '.',
  setupFiles: ['<rootDir>/tests/setup.ts'],
}

export default config
