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
