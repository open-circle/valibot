import { describe, test } from 'vitest';
import { expectNoActionIssue } from '../../vitest/index.ts';
import { ipv4 } from './ipv4.ts';

/**
 * Verify that the updated `IPV4_REGEX` now accepts octets with leading zeros.
 * This was previously treated as invalid, but the new pattern permits values
 * such as `001.002.003.004` while still rejecting out‑of‑range octets.
 */
describe('ipv4 – leading‑zero support', () => {
  const action = ipv4();

  test('accepts IPv4 with leading zeros', () => {
    expectNoActionIssue(action, ['001.002.003.004', '010.020.030.040']);
  });
});
