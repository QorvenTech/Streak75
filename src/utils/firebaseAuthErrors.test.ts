import assert from 'node:assert/strict';
import test from 'node:test';

import {
  firebaseAuthErrorCode,
  isCredentialAlreadyInUseError,
} from './firebaseAuthErrors';

test('detects Firebase credential ownership conflicts', () => {
  assert.equal(
    isCredentialAlreadyInUseError({
      code: 'auth/credential-already-in-use',
    }),
    true,
  );
  assert.equal(
    isCredentialAlreadyInUseError({ code: 'auth/email-already-in-use' }),
    true,
  );
  assert.equal(isCredentialAlreadyInUseError({ code: 'auth/network-request-failed' }), false);
});

test('reads only string Firebase error codes', () => {
  assert.equal(firebaseAuthErrorCode({ code: 'auth/operation-not-allowed' }), 'auth/operation-not-allowed');
  assert.equal(firebaseAuthErrorCode({ code: 42 }), null);
  assert.equal(firebaseAuthErrorCode(null), null);
});
