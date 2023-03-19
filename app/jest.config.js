module.exports = {
  'roots': [
    '<rootDir>/src',
    '<rootDir>/tests',
  ],
  'testMatch': [
    '**/tests/**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  'transform': {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
