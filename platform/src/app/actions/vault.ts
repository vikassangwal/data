'use server';

import crypto from 'crypto';
import prisma from '@/lib/db';
import { auth } from '@/auth';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
// Master secret key must be exactly 32 bytes (256 bits).
// In production, load this from process.env.VAULT_SECRET
const MASTER_KEY_STRING = process.env.VAULT_SECRET || 'devforge_vault_super_key_32bytes!';
const ENCRYPTION_KEY = crypto.scryptSync(MASTER_KEY_STRING, 'salt', 32);

/**
 * Encrypts a string value using AES-256-GCM
 */
export async function encryptKey(plainText: string): Promise<string> {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12); // GCM standard IV is 12 bytes
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:encrypted_payload:auth_tag
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string
 */
export async function decryptKey(cipherText: string): Promise<string> {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid cipher text format.');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return 'DECRYPTION_ERROR';
  }
}

/**
 * Enforces strict super-admin session guard before vault actions
 */
async function enforceSuperAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'SUPER-ADMIN') {
    throw new Error('ACCESS DENIED: Super Admin role credentials required.');
  }
}

/**
 * Saves a system secret key securely after encryption
 */
export async function saveSystemSetting(key: string, rawValue: string) {
  await enforceSuperAdmin();
  if (!key || !rawValue) {
    return { error: 'Setting key and value are required.' };
  }
  
  try {
    const encryptedValue = await encryptKey(rawValue);
    
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: encryptedValue, updatedAt: new Date() },
      create: { key, value: encryptedValue }
    });
    
    return { success: true, message: `Setting "${key}" encrypted and written to vault.` };
  } catch (err) {
    return { error: 'Failed to commit setting to cryptographic vault.' };
  }
}

/**
 * Retrieves a system setting key in its raw (decrypted) form (strictly backend memory)
 */
export async function getSystemSettingDecrypted(key: string): Promise<string> {
  // Safe to run inside server-side transactions; does not expose encrypted key to client
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    });
    if (!setting) return '';
    return await decryptKey(setting.value);
  } catch (err) {
    return '';
  }
}

/**
 * UI Action to retrieve masked vault settings (just keys, not values)
 */
export async function getVaultKeysInfo() {
  await enforceSuperAdmin();
  try {
    const settings = await prisma.systemSetting.findMany({
      select: { key: true, updatedAt: true }
    });
    return { success: true, keys: settings };
  } catch (err) {
    return { error: 'Failed to retrieve vault credentials info.' };
  }
}
