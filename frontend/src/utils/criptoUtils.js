/**
 * Converts an ArrayBuffer to a Base64 encoded string.
 * @param {ArrayBuffer} buffer - The ArrayBuffer to convert.
 * @returns {Promise<string>} A Promise that resolves to the Base64 encoded string.
 */
export const arrayBufferToBase64 = async (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a public key buffer to PEM format.
 * @param {ArrayBuffer} publicKeyBuffer - The public key as an ArrayBuffer.
 * @returns {Promise<string>} A Promise that resolves to the PEM formatted public key.
 */
export const publicKeyToPEM = async (publicKeyBuffer) => {
  const base64String = arrayBufferToBase64(publicKeyBuffer);
  const formattedKey = base64String.match(/.{1,64}/g).join('\n');
  return `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
}

/**
 * Converts a private key buffer to PEM format.
 * @param {ArrayBuffer} privateKeyBuffer - The private key as an ArrayBuffer.
 * @returns {Promise<string>} A Promise that resolves to the PEM formatted private key.
 */
export const privateKeyToPEM = async (privateKeyBuffer) => {
  const base64String = arrayBufferToBase64(privateKeyBuffer);
  const formattedKey = base64String.match(/.{1,64}/g).join('\n');
  return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
}

/**
 * Imports a public key in PEM format for use with Web Crypto API.
 * @param {string} pem - The public key in PEM format.
 * @returns {Promise<CryptoKey>} A Promise that resolves to the imported CryptoKey.
 */
export const importPublicKey = async (pem) => {
  const binaryDerString = atob(pem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["encrypt"]
  );
}

/**
 * Imports a private key in PEM format for use with Web Crypto API.
 * @param {string} pem - The private key in PEM format.
 * @returns {Promise<CryptoKey>} A Promise that resolves to the imported CryptoKey.
 */
export const importPrivateKey = async (pem) => { 
  // Convierte de base64 a un ArrayBuffer
  const binaryDerString = window.atob(pem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
};

/**
 * Derives an AES key from a password using PBKDF2.
 * @param {string} password - The password to derive the key from.
 * @returns {Promise<{aesKey: CryptoKey, salt: Uint8Array}>} A Promise that resolves to an object containing the derived AES key and the salt used.
 */
export const deriveAESKey = async (password) => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", passwordBytes, { name: "PBKDF2" }, false, ["deriveKey"]
  );
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const aesKey = await window.crypto.subtle.deriveKey({
    name: "PBKDF2",
    salt: salt,
    iterations: 100000,
    hash: "SHA-256"
  }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

  return { aesKey, salt };
};

/**
 * Encrypts a private key with a password and stores it in sessionStorage.
 * @param {string} privateKey - The private key to encrypt.
 * @param {string} password - The password to use for encryption.
 * @returns {Promise<void>}
 */
export const encryptPrivateKey = async (privateKey, password) => {
  const { aesKey, salt } = await deriveAESKey(password);
  const encoder = new TextEncoder();
  const privateKeyBytes = encoder.encode(privateKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedPrivateKey = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    privateKeyBytes
  );

  const encryptedData = new Uint8Array([...salt, ...iv, ...new Uint8Array(encryptedPrivateKey)]);
  const encryptedPrivateKeyBase64 = btoa(String.fromCharCode(...encryptedData));
  sessionStorage.setItem("encryptedPrivateKey", encryptedPrivateKeyBase64);
};

/**
 * Derives an AES key for decryption using PBKDF2.
 * @param {string} password - The password to derive the key from.
 * @param {Uint8Array} salt - The salt used in the original key derivation.
 * @returns {Promise<CryptoKey>} A Promise that resolves to the derived AES key.
 */
export const deriveAESKeyForDecryption = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", passwordBytes, { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey({
    name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256"
  }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
};

/**
 * Decrypts an encrypted private key using a password.
 * @param {string} encriptedPrivateKey - The encrypted private key in Base64 format.
 * @param {string} password - The password used to decrypt the private key.
 * @returns {Promise<string|null>} - The decrypted private key as a string, or null if decryption fails.
 * @throws {Error} - Throws an error if decryption fails.
 */
export const decryptPrivateKeyWithPassword = async (encriptedPrivateKey, password) => {
  try {
    const encryptedPrivateKeyBase64 = encriptedPrivateKey;
    const encryptedData = Uint8Array.from(atob(encryptedPrivateKeyBase64), c => c.charCodeAt(0));
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const encryptedPrivateKey = encryptedData.slice(28);

    const aesKey = await deriveAESKeyForDecryption(password, salt);
    const decryptedPrivateKeyBytes = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encryptedPrivateKey
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedPrivateKeyBytes);
  } catch (error) {
    console.error('Error al desencriptar la clave privada:', error);
    return null;
  }
};

/**
 * Generates a symmetric key using PBKDF2.
 * @param {string} secret - The secret used to generate the key.
 * @param {Uint8Array} salt - The salt used in the key derivation.
 * @returns {Promise<CryptoKey>} A Promise that resolves to the generated symmetric key.
 */
export const generateSymmetricKey = async (secret, salt) => {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts the initial secret with the public key of user 2.
 * @param {string} secret - The secret to encrypt.
 * @param {CryptoKey} publicKey - The public key of user 2.
 * @returns {Promise<ArrayBuffer>} A Promise that resolves to the encrypted secret.
 */
export const encryptSecretForUser2 = async (secret, publicKey) => {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);

  return await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    publicKey,
    secretBytes
  );
};

/**
 * Decrypts the secret with the private key.
 * @param {ArrayBuffer} encryptedSecret - The encrypted secret.
 * @param {CryptoKey} privateKey - The private key for decryption.
 * @returns {Promise<ArrayBuffer>} A Promise that resolves to the decrypted secret.
 * @throws {Error} Throws an error if decryption fails.
 */
export const decryptSecretWithPrivateKey = async (encryptedSecret, privateKey) => {
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      privateKey,
      encryptedSecret
    );
    return decrypted;
  } catch (error) {
    console.error("Error during decryption:", error);
    throw error;
  }
};

/**
 * Encrypts a message using AES-GCM with the provided symmetric key.
 * @param {string} message - The message to encrypt.
 * @param {CryptoKey} symmetricKey - The symmetric key for encryption.
 * @returns {Promise<{iv: Uint8Array, encryptedMessage: Uint8Array}>} A Promise that resolves to an object containing the IV and encrypted message.
 */
export const encryptMessage = async (message, symmetricKey) => { 
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedMessage = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    symmetricKey,
    messageBytes
  );

  return {
    iv: iv,
    encryptedMessage: new Uint8Array(encryptedMessage)
  };
}

/**
 * Decrypts a message using AES-GCM with the provided symmetric key.
 * @param {{iv: Uint8Array, encryptedMessage: Uint8Array}} encryptedData - The encrypted data containing IV and encrypted message.
 * @param {CryptoKey} symmetricKey - The symmetric key for decryption.
 * @returns {Promise<string>} A Promise that resolves to the decrypted message.
 */
export const decryptMessage = async (encryptedData, symmetricKey) => {
  const { iv, encryptedMessage } = encryptedData;

  const decryptedMessage = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    symmetricKey,
    encryptedMessage
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedMessage);
}

/**
 * Signs a message using RSA-PSS.
 * @param {CryptoKey} privateKey - The private key for signing.
 * @param {string} message - The message to sign.
 * @returns {Promise<ArrayBuffer>} A Promise that resolves to the signature.
 */
export const signMessage = async (privateKey, message) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return await crypto.subtle.sign(
      {
          name: "RSA-PSS",
          saltLength: 32,
      },
      privateKey,
      data
  );
}

// Note: The verifySignature function is missing from the provided code.
// It should be implemented to complete the signature verification process.

/**
 * Verifies a signature using RSA-PSS.
 * @param {CryptoKey} publicKey - The public key for verification.
 * @param {string} message - The message to verify.
 * @param {ArrayBuffer} signature - The signature to verify.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating if the signature is valid.
 */

export const verifySignature = async (publicKey, message, signature) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return await crypto.subtle.verify(
      {
          name: "RSA-PSS",
          saltLength: 32,
      },
      publicKey,
      signature,
      data
  );
}