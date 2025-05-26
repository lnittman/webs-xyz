import { expect, test, vi } from 'vitest'

const create = vi.fn().mockResolvedValue({ id: 1 })
const del = vi.fn()
vi.mock('@repo/database', () => ({
  database: {
    web: { create, delete: del }
  }
}))

import { GET } from '../app/cron/keep-alive/route'

test('keep alive creates and deletes temp record', async () => {
  const response = await GET()
  expect(create).toHaveBeenCalledWith({
    data: { url: 'https://cron-temp.example.com', title: 'cron-temp' }
  })
  expect(del).toHaveBeenCalledWith({ where: { id: 1 } })
  expect(response.status).toBe(200)
  expect(await response.text()).toBe('OK')
})
