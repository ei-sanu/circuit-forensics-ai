import os
import json
import hashlib
from typing import List, Union
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

class BiometricCryptoUtil:
    ALGORITHM = "aes-256-gcm"
    IV_LENGTH = 16
    AUTH_TAG_LENGTH = 16

    @staticmethod
    def _get_key(custom_key: str = None) -> bytes:
        raw_key = (
            custom_key
            or os.getenv("BIOMETRIC_ENCRYPTION_KEY")
            or "circuit-biometric-secret-encryption-key-2026-secure"
        )
        return hashlib.sha256(raw_key.encode("utf-8")).digest()

    @classmethod
    def encrypt_template(cls, template: Union[List[float], str], custom_key: str = None) -> str:
        """
        Encrypts a biometric embedding vector or template using AES-256-GCM authenticated encryption.
        Returns a serialized string formatted as "ivHex:authTagHex:ciphertextHex".
        """
        data_str = template if isinstance(template, str) else json.dumps(template)
        data_bytes = data_str.encode("utf-8")
        
        key = cls._get_key(custom_key)
        iv = os.urandom(cls.IV_LENGTH)
        
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(data_bytes) + encryptor.finalize()
        auth_tag = encryptor.tag

        return f"{iv.hex()}:{auth_tag.hex()}:{ciphertext.hex()}"

    @classmethod
    def decrypt_template(cls, encrypted_payload: str, custom_key: str = None) -> List[float]:
        """
        Decrypts an authenticated AES-256-GCM biometric ciphertext back into a numeric embedding vector.
        """
        if not encrypted_payload or ":" not in encrypted_payload:
            raise ValueError("Invalid encrypted biometric payload format")

        parts = encrypted_payload.split(":")
        if len(parts) != 3:
            raise ValueError("Malformed biometric ciphertext components")

        iv_hex, auth_tag_hex, ciphertext_hex = parts
        key = cls._get_key(custom_key)
        iv = bytes.fromhex(iv_hex)
        auth_tag = bytes.fromhex(auth_tag_hex)
        ciphertext = bytes.fromhex(ciphertext_hex)

        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, auth_tag), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted_bytes = decryptor.update(ciphertext) + decryptor.finalize()
        
        parsed = json.loads(decrypted_bytes.decode("utf-8"))
        if not isinstance(parsed, list):
            raise ValueError("Decrypted biometric template is not a valid vector array")
        return parsed
