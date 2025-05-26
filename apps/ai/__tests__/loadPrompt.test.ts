import { describe, it, expect } from 'vitest'
import { loadPrompt, fillTemplate } from '../src/mastra/utils/loadPrompt'

// Uses an existing prompt file shipped with the repo
const promptPath = 'agents/chat/prompt.xml'

describe('loadPrompt', () => {
  it('returns fallback when file missing', () => {
    const result = loadPrompt('does-not-exist.xml', 'fallback')
    expect(result).toBe('fallback')
  })

  it('loads existing prompt', () => {
    const result = loadPrompt(promptPath)
    expect(result).toContain('<instructions>')
  })
})

describe('fillTemplate', () => {
  it('replaces placeholders', () => {
    const result = fillTemplate('Hello {{name}}', { name: 'Webs' })
    expect(result).toBe('Hello Webs')
  })
})
