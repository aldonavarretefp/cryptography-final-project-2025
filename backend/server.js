const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Stores keys for demonstration purposes (use secure storage in production)
let keys = {};

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('generateKeys', (data) => {
        // Generate asymmetric keys using RSA
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
            
        // Store the keys securely for this socket/user
        keys[socket.id] = { publicKey, privateKey };
        socket.emit('keysGenerated', { publicKey });
    });

    socket.on('sendMessage', (encryptedData) => {
        // Decrypt and verify incoming message logic here...
        // Use socket.broadcast.emit to send to all except the sender
        socket.broadcast.emit('receiveMessage', encryptedData);
    });

    socket.on('disconnect', () => {
        delete keys[socket.id];
        console.log('user disconnected');
    });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});