require('@testing-library/jest-dom/extend-expect');
const tsc = require('typescript');
const tsConfig = require('./tsconfig.json');

module.exports = {
  process(src: string, path: string): string {
    if (
      path.endsWith('.ts') ||
      path.endsWith('.tsx') ||
      path.endsWith('.js') ||
      path.endsWith('.jsx')
    ) {
      return tsc.transpile(src, tsConfig.compilerOptions, path, []);
    }
    return src;
  },
};
