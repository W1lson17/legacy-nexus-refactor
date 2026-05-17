import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/api/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['express'],
              message: 'domain/ must not depend on Express — use a port/adapter instead',
            },
            {
              group: ['@prisma/client'],
              message: 'domain/ must not depend on Prisma — use a repository port instead',
            },
            {
              group: ['../infrastructure/*'],
              message: 'application/ must not import infrastructure/ — depend on domain ports instead',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.prisma/**'],
  },
);