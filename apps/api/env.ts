import { createEnv } from '@t3-oss/env-nextjs';

import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as notifications } from '@repo/notifications/keys';
import { keys as webhooks } from '@repo/webhooks/keys';

export const env = createEnv({
  extends: [
    auth(),
    analytics(),
    core(),
    database(),
    email(),
    observability(),
    notifications(),
    webhooks(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
