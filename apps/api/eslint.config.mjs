import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['express', '@types/express'],
              message: 'domain/ must not depend on Express — use a port/adapter instead',
            },
            {
              group: ['@prisma/client'],
              message: 'domain/ must not depend on Prisma — use a repository port instead',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../infrastructure/*', '../../infrastructure/*'],
              message: 'application/ must not import infrastructure/ — depend on domain ports instead',
            },
            {
              group: ['express', '@types/express'],
              message: 'application/ must not depend on Express — use a port/adapter instead',
            },
            {
              group: ['@prisma/client'],
              message: 'application/ must not depend on Prisma — use a repository port instead',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.prisma/**', '**/generated/**'],
  },
);