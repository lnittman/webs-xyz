import { expect, test } from 'vitest'

const buildPost = (data: any) => new Request('http://example.com/api/feedback', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json' }
}) as any

const loadRoute = async () => {
  const mod = await import('../src/app/api/feedback/route')
  return mod
}

test('feedback POST returns success for valid body', async () => {
  const { POST } = await loadRoute()
  const req = buildPost({ topic: 'bug', message: 'oops' })
  const res = await POST(req)
  const body = await res.json()
  expect(res.status).toBe(201)
  expect(body.success).toBe(true)
  expect(body.id).toBeDefined()
})

test('feedback POST rejects invalid data', async () => {
  const { POST } = await loadRoute()
  const req = buildPost({ topic: 'bug' })
  const res = await POST(req)
  expect(res.status).toBe(400)
})
