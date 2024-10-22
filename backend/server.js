const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const app = express();
const cors = require('cors');
const server = http.createServer(app);

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

let client1PublicKey = null;
let client2PublicKey = null;

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
        client1PublicKey = null;
        client2PublicKey = null;
    });

    // Escuchar cuando el cliente 1 envía su formulario con la clave pública
    socket.on('client1FormSubmitted', (data) => {
        console.log('Client 1 submitted:', data.publicKey);
        client1PublicKey = data.publicKey;
        checkAndExchangeKeys(socket);
    });

    // Escuchar cuando el cliente 2 envía su formulario con la clave pública
    socket.on('client2FormSubmitted', (data) => {
        console.log('Client 2 submitted:', data.publicKey);
        client2PublicKey = data.publicKey;
        checkAndExchangeKeys(socket);
    });

    // Función para intercambiar las claves entre ambos clientes
    const checkAndExchangeKeys = (socket) => {
        if (client1PublicKey && client2PublicKey) {
            // Enviar la clave pública del cliente 1 al cliente 2
            socket.emit('receivePublicKey', { client: 2, publicKey: client1PublicKey });
            io.emit('sendToClient2', { publicKey: client1PublicKey });

            // Enviar la clave pública del cliente 2 al cliente 1
            socket.emit('receivePublicKey', { client: 1, publicKey: client2PublicKey });
            io.emit('sendToClient1', { publicKey: client2PublicKey });

            io.emit('bothUsersConnected', true); 

            // Reiniciar las variables si es necesario para manejar futuras conexiones
            client1PublicKey = null;
            client2PublicKey = null;
        }
    };

});


server.listen(3001, () => {
    console.log('listening on *:3001');
});
