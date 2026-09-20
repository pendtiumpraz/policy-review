import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

/**
 * AES-256-GCM encryption for tenant BYOK provider keys.
 * Key is 32-byte base64 in CREDENTIALS_ENCRYPTION_KEY.
 */

function key(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!raw) return Buffer.from(process.env.NEXTAUTH_SECRET || 'dev', 'utf8').subarray(0, 32);
  const buf = Buffer.from(raw, 'base64');
  if (buf.length === 32) return buf;
  // Fallback: hash to 32 bytes
  return require('node:crypto').createHash('sha256').update(raw).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decryptSecret(cipherText: string): string {
  const [ivB64, tagB64, encB64] = cipherText.split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(Buffer.from(encB64, 'base64')), decipher.final()]).toString('utf8');
}
