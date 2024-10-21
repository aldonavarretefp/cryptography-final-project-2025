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
        deriveSymmetricKeyFromPassword(password, salt)
            .then((derivedKey) => {
                keys[user.name] = { derivedKey };
                console.log('Keys generated:',{ derivedKey: derivedKey.substring(1, 5) + '...' });
                socket.emit('keysGenerated', { derivedKey });
            })
            .catch((err) => {
                console.error('Error deriving symmetric key:', err);
            }
        );
    });

    socket.on('sendMessage', (data) => {
        try {
            const { encryptedData, user, iv, originalMessage, digest, signedMessage } = data;
            console.log(data);
            socket.broadcast.emit('receiveMessage', {
                message: encryptedData,
                user,
                iv,
                signedMessage,
                digest,
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
