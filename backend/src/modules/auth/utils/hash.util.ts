import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return { salt, hash: derivedKey.toString('hex') };
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return derivedKey.toString('hex') === hash;
}
