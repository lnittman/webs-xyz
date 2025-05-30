import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
//import { keys as notifications } from '@repo/notifications/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as security } from '@repo/security/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [
    auth(),
    analytics(),
    core(),
    database(),
    email(),
    flags(),
    //notifications(),
    observability(),
    security(),
  ],
  server: {
    MASTRA_SERVER_URL: z.string().url().default('http://localhost:4111'),
  },
  client: {},
  runtimeEnv: {
    MASTRA_SERVER_URL: process.env.MASTRA_SERVER_URL,
  },
});
