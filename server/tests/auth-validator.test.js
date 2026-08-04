const test = require('node:test');
const assert = require('node:assert/strict');
const signupSchema = require('../validators/auth-validator');

test('signup schema coerces numeric phone values to strings', async () => {
  const parsed = await signupSchema.parseAsync({
    username: 'testuser',
    email: 'testuser@example.com',
    phone: 1234567890,
    password: '12345678',
    role: 'Patient',
  });

  assert.equal(parsed.phone, '1234567890');
});
