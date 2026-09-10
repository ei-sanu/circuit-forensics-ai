import { BiometricCryptoUtil } from './biometric-crypto.util';

describe('BiometricCryptoUtil', () => {
  it('should securely encrypt and decrypt a 128-dimensional biometric embedding', () => {
    const originalVec = Array.from({ length: 128 }, (_, i) => Math.sin(i) * 0.5);

    const encrypted = BiometricCryptoUtil.encryptTemplate(originalVec);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.split(':').length).toBe(3);

    const decrypted = BiometricCryptoUtil.decryptTemplate(encrypted);
    expect(decrypted.length).toBe(128);
    for (let i = 0; i < 128; i++) {
      expect(decrypted[i]).toBeCloseTo(originalVec[i], 5);
    }
  });

  it('should throw an error when attempting to decrypt tampered ciphertext or tags', () => {
    const originalVec = [0.1, 0.2, 0.3, 0.4];
    const encrypted = BiometricCryptoUtil.encryptTemplate(originalVec);
    const [iv, tag, data] = encrypted.split(':');

    // Tampered tag
    const tamperedTag = tag.slice(0, -2) + (tag.slice(-2) === 'aa' ? 'bb' : 'aa');
    const tamperedPayload = `${iv}:${tamperedTag}:${data}`;

    expect(() => BiometricCryptoUtil.decryptTemplate(tamperedPayload)).toThrow();
  });
});
