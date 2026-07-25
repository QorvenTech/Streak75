type ErrorWithCode = {
  code?: unknown;
};

export function firebaseAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as ErrorWithCode).code;
  return typeof code === 'string' ? code : null;
}

export function isCredentialAlreadyInUseError(error: unknown): boolean {
  const code = firebaseAuthErrorCode(error);
  return (
    code === 'auth/credential-already-in-use' ||
    code === 'auth/email-already-in-use'
  );
}
