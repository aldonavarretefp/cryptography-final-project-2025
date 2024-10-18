const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

// Path where keys are securely stored (for demo purposes)
const KEY_STORAGE_PATH = path.join(__dirname, '..', 'keys');

// Save a private key securely by encrypting it with a symmetric key
const storePrivateKey = async (userId, privateKey, password) => {
    const salt = crypto.randomBytes(16).toString('hex');  // Generate a random salt
    const symmetricKey = await promisify(crypto.pbkdf2)(password, salt, 100000, 32, 'sha256');  // Generate a symmetric key

    // Encrypt the private key using AES
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedPrivateKey += cipher.final('hex');

    // Store the encrypted private key along with the salt and IV
    const keyData = {
        salt,
        iv: iv.toString('hex'),
        encryptedPrivateKey,
    };

    // Write the encrypted private key to a file (in a real application, use a secure storage method)
    const filePath = path.join(KEY_STORAGE_PATH, `${userId}_privateKey.json`);
    fs.writeFileSync(filePath, JSON.stringify(keyData));
};

// Retrieve and decrypt the private key using a password
const retrievePrivateKey = async (userId, password) => {
    const filePath = path.join(KEY_STORAGE_PATH, `${userId}_privateKey.json`);

    if (!fs.existsSync(filePath)) {
        throw new Error('Private key not found for this user.');
    }

    const keyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Derive the symmetric key using the stored salt and the user's password
    const symmetricKey = await promisify(crypto.pbkdf2)(password, keyData.salt, 100000, 32, 'sha256');

    // Decrypt the private key using AES
    const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.from(keyData.iv, 'hex'));
    let decryptedPrivateKey = decipher.update(keyData.encryptedPrivateKey, 'hex', 'utf8');
    decryptedPrivateKey += decipher.final('utf8');

    return decryptedPrivateKey;
};

module.exports = {
    storePrivateKey,
    retrievePrivateKey,
};