import { expect, test, vi } from 'vitest'

const buildRequest = () => new Request('http://example.com', { method: 'POST', body: '{}' }) as any

// reset module cache between tests
const loadRoute = async () => {
  const mod = await import('../app/webhooks/clerk/route')
  return mod.POST
}

test('clerk webhook returns not configured when secret missing', async () => {
  vi.resetModules()
  delete process.env.CLERK_WEBHOOK_SECRET
  const POST = await loadRoute()
  const res = await POST(buildRequest())
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ message: 'Not configured', ok: false })
})

test('clerk webhook returns 400 when svix headers missing', async () => {
  vi.resetModules()
  process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
  vi.mock('next/headers', () => ({ headers: () => new Map() }))
  const POST = await loadRoute()
  const res = await POST(buildRequest())
  expect(res.status).toBe(400)
  expect(await res.text()).toBe('Error occured -- no svix headers')
  delete process.env.CLERK_WEBHOOK_SECRET
})

const userEvent = {
  id: '1',
  email_addresses: [{ email_address: 'test@example.com' }],
  first_name: 'F',
  last_name: 'L',
  created_at: '2023-01-01',
  image_url: '/img',
  phone_numbers: [{ phone_number: '123' }]
}

test('clerk webhook processes user.created event', async () => {
  vi.resetModules()
  process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
  vi.mock('next/headers', () => ({
    headers: () => new Map([
      ['svix-id', '1'],
      ['svix-timestamp', '2'],
      ['svix-signature', '3']
    ])
  }))
  vi.mock('svix', () => ({
    Webhook: vi.fn().mockImplementation(() => ({ verify: () => ({ type: 'user.created', data: userEvent }) }))
  }))
  const analyticsMock = { identify: vi.fn(), capture: vi.fn(), groupIdentify: vi.fn(), shutdown: vi.fn() }
  vi.mock('@repo/analytics/posthog/server', () => ({ analytics: analyticsMock }))
  const POST = await loadRoute()
  const res = await POST(buildRequest())
  expect(res.status).toBe(201)
  expect(analyticsMock.identify).toHaveBeenCalled()
  expect(analyticsMock.capture).toHaveBeenCalledWith(expect.objectContaining({ event: 'User Created', distinctId: '1' }))
  expect(analyticsMock.shutdown).toHaveBeenCalled()
  delete process.env.CLERK_WEBHOOK_SECRET
})
