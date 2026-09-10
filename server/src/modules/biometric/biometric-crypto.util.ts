import * as crypto from 'crypto';

export class BiometricCryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  private static getKey(customKey?: string): Buffer {
    const rawKey =
      customKey ||
      process.env.BIOMETRIC_ENCRYPTION_KEY ||
      'circuit-biometric-secret-encryption-key-2026-secure';
    // Ensure key is strictly 32 bytes (256 bits)
    return crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Encrypts a biometric embedding vector or template using AES-256-GCM authenticated encryption.
   * Returns a serialized string formatted as "ivHex:authTagHex:ciphertextHex".
   */
  public static encryptTemplate(template: number[] | string, customKey?: string): string {
    const dataStr = typeof template === 'string' ? template : JSON.stringify(template);
    const key = this.getKey(customKey);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    let encrypted = cipher.update(dataStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an authenticated AES-256-GCM biometric ciphertext back into a numeric embedding vector.
   */
  public static decryptTemplate(encryptedPayload: string, customKey?: string): number[] {
    if (!encryptedPayload || !encryptedPayload.includes(':')) {
      throw new Error('Invalid encrypted biometric payload format');
    }

    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed biometric ciphertext components');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = this.getKey(customKey);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const parsed = JSON.parse(decrypted);
    if (!Array.isArray(parsed)) {
      throw new Error('Decrypted biometric template is not a valid vector array');
    }
    return parsed;
  }
}
