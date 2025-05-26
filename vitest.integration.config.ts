import base from '@repo/testing';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
  },
});
