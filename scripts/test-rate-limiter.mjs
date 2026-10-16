import assert from 'assert';
import { checkPersistentRateLimit } from '../lib/rate-limit.js';

console.log('====================================================');
console.log('🧪 RUNNING RATE LIMITER TEST SUITE');
console.log('====================================================\n');

async function run() {
  const testKey = `test-key-${Date.now()}`;
  const limit = 3;
  const windowMs = 2000; // 2 seconds

  console.log('Testing limit of 3 requests...');

  // 1st request -> pass
  const r1 = await checkPersistentRateLimit({ key: testKey, limit, windowMs });
  assert.strictEqual(r1.success, true, '1st request should succeed');
  assert.strictEqual(r1.remaining, 2, '2 remaining');

  // 2nd request -> pass
  const r2 = await checkPersistentRateLimit({ key: testKey, limit, windowMs });
  assert.strictEqual(r2.success, true, '2nd request should succeed');
  assert.strictEqual(r2.remaining, 1, '1 remaining');

  // 3rd request -> pass
  const r3 = await checkPersistentRateLimit({ key: testKey, limit, windowMs });
  assert.strictEqual(r3.success, true, '3rd request should succeed');
  assert.strictEqual(r3.remaining, 0, '0 remaining');

  // 4th request -> blocked
  const r4 = await checkPersistentRateLimit({ key: testKey, limit, windowMs });
  assert.strictEqual(r4.success, false, '4th request should be rate limited');
  assert.strictEqual(r4.remaining, 0, '0 remaining');

  console.log('✅ PASS: Rate limiter blocks requests beyond limit');

  // Wait for window expiration
  console.log('Waiting for window to expire (2.1s)...');
  await new Promise((r) => setTimeout(r, 2100));

  // 5th request -> should pass again after window expires
  const r5 = await checkPersistentRateLimit({ key: testKey, limit, windowMs });
  assert.strictEqual(r5.success, true, 'Request after window expiration should succeed');
  console.log('✅ PASS: Rate limiter allows requests after window expiration');

  console.log('\n====================================================');
  console.log('📊 ALL RATE LIMITER TESTS PASSED');
  console.log('====================================================\n');
}

run().catch((err) => {
  console.error('Rate limiter test failed:', err);
  process.exit(1);
});
