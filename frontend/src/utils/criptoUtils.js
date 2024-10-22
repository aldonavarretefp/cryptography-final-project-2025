import CryptoJS from "crypto-js";


export const generateSymmetricKey = (password, salt) => {
  const iterations = 100000;
  const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,  // 256 bits
      iterations: iterations,
      hasher: CryptoJS.algo.SHA256
  });
  return key.toString(CryptoJS.enc.Hex);
};

export const encryptSymmetric = (message, symmetricKey) => {
  const iv = CryptoJS.lib.WordArray.random(16);  // Vector de inicialización
  const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(symmetricKey), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  return { iv: iv.toString(CryptoJS.enc.Hex), encryptedData: encrypted.toString() };
};

export const decryptSymmetric = (cipherText, symmetricKey, iv) => {
  const decrypted = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Hex.parse(symmetricKey), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const hashMessage = (message) => {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
};

// WebCrypto API para generar un par de claves asimétricas
export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey({
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
  }, true, ["sign", "verify"]);
  return keyPair;
}

export async function verifySignature(message, signature, publicKey) {
  const encodedMessage = new TextEncoder().encode(message);
  const signatureBuffer = hexToBuffer(signature);  // Función para convertir hex a ArrayBuffer
  const isValid = await window.crypto.subtle.verify({
      name: "RSA-PSS",
      saltLength: 32,
  }, publicKey, signatureBuffer, encodedMessage);
  return isValid;
}

export function bufferToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

export function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export async function signMessage(message, privateKey) {
  const encodedMessage = new TextEncoder().encode(message);
  const signature = await window.crypto.subtle.sign({
      name: "RSA-PSS",
      saltLength: 32,
  }, privateKey, encodedMessage);
  return bufferToHex(signature);  // Función para convertir ArrayBuffer a hex
}

export const deriveKey = (password) => {
  return CryptoJS.PBKDF2(password, "salt", { keySize: 256 / 32 }).toString();
};
