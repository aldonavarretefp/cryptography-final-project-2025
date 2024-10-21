const crypto = require('crypto');
const { promisify } = require('util');

// Generate an asymmetric RSA key pair
const generateKeyPair = () => {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
        'rsa',
        {
            modulusLength: 2048,  // Key length
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        },
        (err, publicKey, privateKey) => {
            if (err) {
            reject(err);
            } else {
            resolve({ publicKey, privateKey });
            }
        }
        );
    });
};

// Generate a symmetric key using password-based key derivation (PBKDF2)
const deriveSymmetricKeyFromPassword = async (password, salt) => {
    const keyLength = 32;  // 256 bits
    const iterations = 100000;
    const derivedKey = await promisify(crypto.pbkdf2)(password, salt, iterations, keyLength, 'sha256');
    return derivedKey.toString('hex');
};

// Symmetric encryption using AES-256
const encryptSymmetric = (message, symmetricKey) => {
    const iv = crypto.randomBytes(16);  // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(symmetricKey, 'hex'), iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Symmetric decryption using AES-256
const decryptSymmetric = (cipherText, symmetricKey, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(symmetricKey, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Create a digital signature using a private key
const signMessage = (message, privateKey) => {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();
    const signature = sign.sign(privateKey, 'hex');
    return signature;
};

// Verify a digital signature using a public key
const verifySignature = (message, signature, publicKey) => {
    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
};

module.exports = {
    generateKeyPair,
    deriveSymmetricKeyFromPassword,
    encryptSymmetric,
    decryptSymmetric,
    signMessage,
    verifySignature,
};