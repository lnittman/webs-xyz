import { expect, test } from 'vitest';
import { GET } from '../../apps/api/app/health/route';

test('api health endpoint responds', async () => {
  const res = await GET();
  expect(res.status).toBe(200);
  expect(await res.text()).toBe('OK');
});
