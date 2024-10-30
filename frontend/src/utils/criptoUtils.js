//------------------------------------------------------------------------------------
// Funciones para generar llaves asimétricas en formato PEM
// Función auxiliar para convertir ArrayBuffer a cadena Base64
export const arrayBufferToBase64 = async (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Función para convertir clave pública a formato PEM
export const publicKeyToPEM = async (publicKeyBuffer) => {
  const base64String = arrayBufferToBase64(publicKeyBuffer);
  const formattedKey = base64String.match(/.{1,64}/g).join('\n');
  return `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
}

// Función para convertir clave privada a formato PEM
export const privateKeyToPEM = async (privateKeyBuffer) => {
  const base64String = arrayBufferToBase64(privateKeyBuffer);
  const formattedKey = base64String.match(/.{1,64}/g).join('\n');
  return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
}

// Función para importar la clave pública en formato PEM para su uso con Web Crypto
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

// Función para importar una clave privada en formato PEM y convertirla a CryptoKey
export const importPrivateKey = async (pem) => { 
  // Convierte de base64 a un ArrayBuffer
  const binaryDerString = window.atob(pem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  // Importa la clave como una CryptoKey
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

// Exportando las claves en formato PEM
//const publicKeyPEM = publicKeyToPEM(publicKey);
//const privateKeyPEM = privateKeyToPEM(privateKey);

//console.log("Clave pública en PEM:", publicKeyPEM);
//console.log("Clave privada en PEM:", privateKeyPEM);

//------------------------------------------------------------------------------------
// Funciones para encriptar la llave privada
// Password-based key derivation function (PBKDF)
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

// Encriptar la clave privada
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
    //return decryptedPrivateKeyBytes;
  } catch (error) {
    console.error('Error al desencriptar la clave privada:', error);
    return null;
  }
};

//------------------------------------------------------------------------------------
// Funciones que para el secreto 
// Función para generar una clave simétrica usando PBKDF2
export const generateSymmetricKey = async (secret, salt) => {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);

  // Importamos el secreto como clave de material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derivamos la clave usando PBKDF2
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

// Función para cifrar el secreto inicial con la clave pública del usuario 2
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

// Función para desencriptar el secreto con la clave privada
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

//------------------------------------------------------------------------------------
// Funciones que para enncriptar y desencriptar mensajes
// Función para encriptar un mensaje con AES-GCM utilizando la clave simétrica derivada
export const encryptMessage = async (message, symmetricKey) => { 
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Genera IV aleatorio

  // Ciframos el mensaje con AES-GCM
  const encryptedMessage = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    symmetricKey,
    messageBytes
  );

  // Retornamos el IV y el mensaje cifrado concatenados en Base64
  return {
    iv: iv,
    encryptedMessage: new Uint8Array(encryptedMessage)
  };
}

// Función para desencriptar el mensaje con AES-GCM utilizando la clave simétrica derivada
export const decryptMessage = async (encryptedData, symmetricKey) => {
  const { iv, encryptedMessage } = encryptedData;

  // Desencripta el mensaje con AES-GCM
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

//------------------------------------------------------------------------------------
// Funciones que para firmar mensajes

// Firma un mensaje
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

// Verifica la firma de un mensaje
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