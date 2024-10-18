const { generateSymmetricKey } = require('./utils/encryption.js');  // asegúrate de que el nombre del archivo sea correcto
const { generateKeyPair } = require('./utils/encryption.js');  // asegúrate de que el nombre del archivo sea correcto
const { encryptSymmetric, decryptSymmetric } = require('./utils/encryption.js');  // asegúrate de que el nombre del archivo sea correcto
const { signMessage, verifySignature} = require('./utils/encryption.js');  // asegúrate de que el nombre del archivo sea correcto
const { hashMessage } = require('./utils/encryption.js');  // asegúrate de que el nombre del archivo sea correcto

// Prueba de generación de par de claves RSA:
generateKeyPair().then(keys => {
    console.log('Par de claves generado:', keys);
}).catch(err => {
    console.error('Error generando par de claves:', err);
});

// Prueba de generación de clave simétrica:
generateSymmetricKey('tuContraseña', 'tuSalt').then(key => {
    console.log('Clave simétrica generada:', key);
}).catch(err => {
    console.error('Error generando clave simétrica:', err);
});

// Prueba de cifrado y descifrado simétrico:
const crypto = require('crypto');
const symmetricKey = crypto.randomBytes(32).toString('hex');  // 32 bytes = 256 bits
const message = 'Este es un mensaje de prueba';

const encrypted = encryptSymmetric(message, symmetricKey);
console.log('Mensaje cifrado:', encrypted);

const decrypted = decryptSymmetric(encrypted.encryptedData, symmetricKey, encrypted.iv);
console.log('Mensaje descifrado:', decrypted);

// Prueba de creación y verificación de firma digital:
generateKeyPair().then(keys => {
    const message2 = 'Este es un mensaje de prueba';
    const signature = signMessage(message2, keys.privateKey);
    console.log('Firma digital:', signature);

    const isValid = verifySignature(message2, signature, keys.publicKey);
    console.log('Firma válida:', isValid);
}).catch(err => {
    console.error('Error en el proceso:', err);
});

// Prueba de hash de mensaje:
const message3 = 'Este es un mensaje de prueba';
const hash = hashMessage(message3);
console.log('Hash del mensaje:', hash);
