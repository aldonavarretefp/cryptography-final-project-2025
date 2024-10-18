import CryptoJS from 'crypto-js';

export const deriveKey = (password) => {
  return CryptoJS.PBKDF2(password, 'salt', { keySize: 256 / 32 }).toString();
};

export const encryptMessage = (message, key) => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

export const decryptMessage = (ciphertext, key) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
