import { Config } from '@jest/types';

/**
 * ts-jest 测试配置文件
 * @warning
 * 【⚠️注意】要求对应的包版本
 *  {
 *    "@types/jest": "^27.4.0",
 *    "ts-node": "^10.4.0",
 *    "ts-jest": "^27.1.3",
 *    "typescript": "^4.5.5",
 *  }
 *  否则 jest 会各种报错！！！
 */
export default async (): Promise<Config.InitialOptions> => {
  return {
    passWithNoTests: true, // 没有 testcase 的时候跳过
    verbose: true,
    bail: true,
    noStackTrace: true,
    // test
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts'],
    testPathIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: { '^.+\\.ts$': 'ts-jest' },
    transformIgnorePatterns: ['node_modules/(?!variables/.*)'],
    // coverage
    collectCoverage: !!process.env.coverage,
    coverageDirectory: '__coverage__',
    coveragePathIgnorePatterns: ['/node_modules/'],
    coverageReporters: ['json', 'html'],
    coverageThreshold: {
      global: {
        branches: 0,
        functions: 20,
        lines: 50,
        statements: 50,
      },
    },
  };
};
