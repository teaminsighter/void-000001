import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.VOID_JWT_SECRET;
  if (!secret) {
    throw new Error('VOID_JWT_SECRET is not set — cannot sign or verify tokens');
  }
  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'void-session';

export async function signToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const password = process.env.VOID_PASSWORD;
  if (!password) return false;
  return input === password;
}

export { COOKIE_NAME };
