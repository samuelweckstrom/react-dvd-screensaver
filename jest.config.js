module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js|jsx)?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules', '.history', '/dist'],
  modulePaths: ['<rootDir>/node_modules'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};
