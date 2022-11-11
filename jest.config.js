/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
  testEnvironment: 'jsdom', // jsdom
  testEnvironmentOptions: { resources: 'usable' },
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
    '^src(.*)': '<rootDir>/src$1',
    '^test(.*)': '<rootDir>/test$1',
  },
  transform: { '^.+\\.[m|t]?js$': 'babel-jest' },
  transformIgnorePatterns: [],
  verbose: true,
  testURL: 'http://github.com/andreyvit/subtitle-tools/blob/master/sample.srt',
}
