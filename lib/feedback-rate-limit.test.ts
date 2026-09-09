import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { consumeFeedbackRateLimit, resetFeedbackRateLimitForTests } from './feedback-rate-limit'

beforeEach(resetFeedbackRateLimitForTests)

test('cleanup preserves active sessions and releases expired attempts at the boundary', () => {
  for (let index = 0; index < 3; index++) {
    assert.equal(consumeFeedbackRateLimit('expired', 0).allowed, true)
    assert.equal(consumeFeedbackRateLimit('active', 300_000).allowed, true)
  }
  assert.equal(consumeFeedbackRateLimit('expired', 599_999).allowed, false)
  assert.equal(consumeFeedbackRateLimit('new-session', 600_000).allowed, true)
  assert.equal(consumeFeedbackRateLimit('expired', 600_000).allowed, true)
  assert.deepEqual(consumeFeedbackRateLimit('active', 600_000), {
    allowed: false, retryAfterSeconds: 300,
  })
})

test('session keys remain isolated including empty and prototype-like strings', () => {
  for (const session of ['', '__proto__', 'constructor']) {
    for (let index = 0; index < 3; index++) {
      assert.equal(consumeFeedbackRateLimit(session, 1000).allowed, true)
    }
    assert.equal(consumeFeedbackRateLimit(session, 1000).allowed, false)
  }
})

test('large expired session batches do not alter later limits', () => {
  for (let index = 0; index < 1000; index++) consumeFeedbackRateLimit(`old-${index}`, 0)
  for (let index = 0; index < 3; index++) assert.equal(consumeFeedbackRateLimit('next', 600_000).allowed, true)
  assert.deepEqual(consumeFeedbackRateLimit('next', 600_000), { allowed:false, retryAfterSeconds:600 })
})
