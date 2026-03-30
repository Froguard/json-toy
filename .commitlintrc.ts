/**
 * commitlint config
 * @see https://commitlint.js.org/#/
 */
import type { UserConfig } from '@commitlint/types';

//
const config: Partial<UserConfig> = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']],
  },
};

//
export default config;
