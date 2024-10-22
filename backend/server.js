const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const app = express();
const cors = require('cors');
const server = http.createServer(app);
const { deriveSymmetricKeyFromPassword } = require('./utils/encryption');


// Stores keys for demonstration purposes (use secure storage in production)
let keys = {};

app.use(cors({
    origin: 'http://localhost:3000',
}));

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    
    // Aqui va el código de la aplicación en cuanto se conecta un cliente

    console.log('a user connected');
    console.log('keys:', keys);
    
    socket.on('generateKeys', (user) => {
        const { name, password } = user;
        const salt = crypto.randomBytes(16).toString('hex');

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });
    });

    socket.on('sendMessage', (data) => {
        try {
            const { 
                encryptedData, 
                user, 
                iv,
                signedMessage, 
                simmetricKey,
                publicSenderKey,
                keyPair
            } = data;
            console.log('receive', {
                encryptedData,
                user,
                iv,
                signedMessage,
                simmetricKey: simmetricKey.substring(1, 20) + '...',
            });
            socket.broadcast.emit('receiveMessage', {
                encryptedData,
                user,
                iv,
                signedMessage,
                simmetricKey,
                publicSenderKey,
                keyPair,
            });
        } catch (err) {
            console.error('Error decrypting message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        // Clear keys for disconnected
    });
});


server.listen(3001, () => {
    console.log('listening on *:3001');
});
