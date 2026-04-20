const { test } = require('@playwright/test');

test.describe('Manual External Verification', () => {
  test.skip('manual verification against external signed-in environment', async () => {
    // This file intentionally stays skipped.
    // Use it only when you explicitly want to validate the extension manually
    // against the real external environment after updating credentials and URLs.
  });
});
