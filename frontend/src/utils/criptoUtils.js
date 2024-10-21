import CryptoJS from 'crypto-js';

export const deriveKey = (password) => {
  return CryptoJS.PBKDF2(password, 'salt', { keySize: 256 / 32 }).toString();
};

export const encryptMessageAES = (message, key) => {
  // Generate a random IV
  
  const iv = CryptoJS.lib.WordArray.random(16);

  // Encrypt the message using AES with the key and IV
  const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(key), {
    iv: iv
  });
  // Return the encrypted message and IV as hex strings
  console.log("encrypting message", message, key, iv.toString(CryptoJS.enc.Hex), encrypted);
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    encryptedData: encrypted.toString()
  };
};

export const decryptMessageAES = (ciphertext, key, iv) => {
  // Decrypt the message using AES with the key and IV
  const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Hex.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv)
  }).toString(CryptoJS.enc.Utf8);
  console.log({ciphertext, key, iv, decrypted});
  // Return the decrypted message as a string
  return decrypted.toString(CryptoJS.enc.Utf8);
};
