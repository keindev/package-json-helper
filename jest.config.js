export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(tsx?)$',
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/'],
  transform: {},
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
