'use client';

/**
 * WebAuthn & Apple Mac Touch ID Integration Utility.
 * Uses W3C Web Authentication API with 'platform' authenticator attachment
 * to interface directly with macOS Touch ID via the Apple Secure Enclave.
 */

export function isMacDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
  return /Mac|iPhone|iPod|iPad/i.test(platform) || /Macintosh|Mac OS X/i.test(ua);
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
    return false;
  }
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function isTouchIdSupported(): Promise<boolean> {
  const isMac = isMacDevice();
  const hasPlatform = await isPlatformAuthenticatorAvailable();
  return isMac && hasPlatform;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function stringToBuffer(str: string): BufferSource {
  const encoder = new TextEncoder();
  return encoder.encode(str) as unknown as BufferSource;
}

export interface TouchIdResult {
  success: boolean;
  credential?: any;
  error?: string;
  isCancelled?: boolean;
}

/**
 * Triggers native macOS Touch ID prompt using WebAuthn platform authenticator.
 */
export async function authenticateWithTouchId(
  challengeId: string,
  user: { id?: string; email: string; name?: string }
): Promise<TouchIdResult> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    return {
      success: false,
      error: 'WebAuthn biometric authentication is not supported in this browser.',
    };
  }

  const hostname = window.location.hostname || 'localhost';
  const challengeBuffer = stringToBuffer(challengeId);
  const userIdBuffer = stringToBuffer(user.id || user.email);

  try {
    // Attempt authentication (assertion) or registration with platform attachment (Mac Touch ID)
    let credential: any = null;

    try {
      // First attempt: Get assertion using Touch ID platform sensor
      credential = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          rpId: hostname,
          userVerification: 'required',
          timeout: 60000,
        },
      });
    } catch {
      // If no resident credentials exist on this device yet, register with Touch ID
      credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: {
            name: 'CIRCUIT Intelligence System',
            id: hostname,
          },
          user: {
            id: userIdBuffer,
            name: user.email,
            displayName: user.name || user.email,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Targets Mac Touch ID specifically
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      });
    }

    if (!credential) {
      return {
        success: false,
        error: 'No biometric credential returned from Touch ID sensor.',
      };
    }

    const resp = credential.response;
    const serializedCredential = {
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64Url(resp.clientDataJSON),
        authenticatorData: resp.authenticatorData ? bufferToBase64Url(resp.authenticatorData) : undefined,
        signature: resp.signature ? bufferToBase64Url(resp.signature) : undefined,
        attestationObject: resp.attestationObject ? bufferToBase64Url(resp.attestationObject) : undefined,
      },
    };

    return {
      success: true,
      credential: serializedCredential,
    };
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    const isCancelled =
      err.name === 'NotAllowedError' ||
      err.name === 'AbortError' ||
      errorMsg.toLowerCase().includes('cancel') ||
      errorMsg.toLowerCase().includes('user denied');

    return {
      success: false,
      isCancelled,
      error: isCancelled
        ? 'Touch ID prompt was cancelled or timed out.'
        : errorMsg || 'Biometric hardware communication failed.',
    };
  }
}
