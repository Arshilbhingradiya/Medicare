const test = require('node:test');
const assert = require('node:assert/strict');

const { validateRequiredEnv } = require('../utils/validate-env');

test('validateRequiredEnv fails when a required variable is missing', () => {
  const original = { ...process.env };

  delete process.env.MONGODB_URI;
  delete process.env.JWT_SECRET;
  delete process.env.CLIENT_URL;

  assert.throws(() => validateRequiredEnv(), /MONGODB_URI|JWT_SECRET|CLIENT_URL/);

  process.env = original;
});
