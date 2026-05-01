/**
 * API Tests for SweetDream Backend
 * Run with: npx tsx src/tests/api.test.ts
 */
import assert from 'assert';

const BASE_URL = 'http://localhost:9091/api/v1';

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error: any) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function assertEqual(actual: any, expected: any, message?: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Expected ${expectedStr}, got ${actualStr}`);
  }
}

async function assertTrue(value: any, message?: string) {
  if (!value) {
    throw new Error(message || `Expected truthy value, got ${value}`);
  }
}

// Health Check
await test('Health check', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  const data = await res.json();
  assertTrue(data.success, 'health check should return success');
  // Database is now connected in our setup
  assertTrue(data.data?.status === 'ok', 'health should return ok status');
});

// Stories API
await test('GET /stories returns stories list', async () => {
  const res = await fetch(`${BASE_URL}/stories`);
  const data = await res.json();
  assertTrue(data.success, 'stories should return success');
  assertTrue(Array.isArray(data.data?.stories), 'stories should be array');
  assertTrue(data.data?.stories.length > 0, 'should have at least one story');
});

await test('GET /stories/:id returns single story', async () => {
  const res = await fetch(`${BASE_URL}/stories/1`);
  const data = await res.json();
  assertTrue(data.success, 'story should return success');
  assertTrue(data.data?.id === 1, 'story id should be 1');
});

// Sounds API
await test('GET /sounds returns sounds list', async () => {
  const res = await fetch(`${BASE_URL}/sounds`);
  const data = await res.json();
  assertTrue(data.success, 'sounds should return success');
  assertTrue(Array.isArray(data.data?.sounds), 'sounds should be array');
  assertTrue(data.data?.sounds.length > 0, 'should have at least one sound');
});

// Ritual Templates API
await test('GET /ritual-templates returns templates', async () => {
  const res = await fetch(`${BASE_URL}/ritual-templates`);
  const data = await res.json();
  assertTrue(data.success, 'ritual-templates should return success');
  assertTrue(Array.isArray(data.data?.templates), 'templates should be array');
  assertTrue(data.data?.templates.length >= 5, 'should have at least 5 templates');
});

// Sleep Records API
await test('GET /sleep-records returns records', async () => {
  const res = await fetch(`${BASE_URL}/sleep-records`);
  const data = await res.json();
  assertTrue(data.success, 'sleep-records should return success');
  assertTrue(Array.isArray(data.data?.records), 'records should be array');
});

await test('POST /sleep-records creates record', async () => {
  const res = await fetch(`${BASE_URL}/sleep-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bedtime: '21:30',
      wakeTime: '07:00',
      quality: 4,
      rituals: ['洗漱', '听故事']
    })
  });
  const data = await res.json();
  assertTrue(data.success, 'create sleep record should return success');
  assertTrue(data.data?.id, 'should have an id');
  assertEqual(data.data?.bedtime, '21:30', 'bedtime should match');
});

// Statistics API
await test('GET /statistics returns stats', async () => {
  const res = await fetch(`${BASE_URL}/statistics`);
  const data = await res.json();
  assertTrue(data.success, 'statistics should return success');
  assertTrue(typeof data.data?.totalSleepHours === 'number', 'should have totalSleepHours');
});

// Parent Guides API
await test('GET /parent-guides returns guides', async () => {
  const res = await fetch(`${BASE_URL}/parent-guides`);
  const data = await res.json();
  assertTrue(data.success, 'parent-guides should return success');
  assertTrue(Array.isArray(data.data?.guides), 'guides should be array');
  assertTrue(data.data?.guides.length > 0, 'should have at least one guide');
});

// Subscription API
await test('GET /subscription returns subscription info', async () => {
  const res = await fetch(`${BASE_URL}/subscription`);
  const data = await res.json();
  assertTrue(data.success, 'subscription should return success');
  assertTrue(typeof data.data?.isActive === 'boolean', 'should have isActive');
});

await test('POST /subscription/activate activates subscription', async () => {
  const res = await fetch(`${BASE_URL}/subscription/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'yearly' })
  });
  const data = await res.json();
  assertTrue(data.success, 'activate subscription should return success');
  assertTrue(data.data?.isActive === true, 'should be active after activation');
  assertEqual(data.data?.plan, 'yearly', 'plan should be yearly');
});

// User Settings API
await test('GET /user-settings returns settings', async () => {
  const res = await fetch(`${BASE_URL}/user-settings`);
  const data = await res.json();
  assertTrue(data.success, 'user-settings should return success');
  assertTrue(data.data?.childName, 'should have childName');
});

await test('PUT /user-settings updates settings', async () => {
  const res = await fetch(`${BASE_URL}/user-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childName: '小星星', childAge: 6 })
  });
  const data = await res.json();
  assertTrue(data.success, 'update settings should return success');
  assertEqual(data.data?.childName, '小星星', 'childName should be updated');
});

// Push Tokens API
await test('POST /push-tokens registers token', async () => {
  const res = await fetch(`${BASE_URL}/push-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'ExponentPushToken[test-token-123]',
      platform: 'ios',
      deviceName: 'iPhone 15'
    })
  });
  const data = await res.json();
  assertTrue(data.success, 'push-tokens should return success');
  assertTrue(data.data?.registered, 'should be registered');
});

await test('DELETE /push-tokens/:token removes token', async () => {
  const res = await fetch(`${BASE_URL}/push-tokens/ExponentPushToken[test-token-123]`, {
    method: 'DELETE'
  });
  const data = await res.json();
  assertTrue(data.success, 'delete push-token should return success');
});

console.log('\n✅ All API tests completed!');
