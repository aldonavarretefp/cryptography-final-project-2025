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
let encryptedSecret = null;
let salt = null;

io.on('connection', (socket) => {
    // Aqui va el código de la aplicación en cuanto se conecta un cliente

    console.log('a user connected');
    console.log('keys:', keys);

    socket.on('sendMessage', (data) => {
        try {
            const { 
                encryptedData, 
                signature,
                sender
            } = data;

            console.log('Encrypted Data:', encryptedData);
            console.log('Signature:', signature);
            console.log('Sender:', sender);

            socket.broadcast.emit('receiveMessage', data);
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
        client1PublicKey = data.publicKey
        checkAndExchangeKeys();
    });

    // Escuchar cuando el cliente 2 envía su formulario con la clave pública
    socket.on('client2FormSubmitted', (data) => {
        console.log('Client 2 submitted:', data.publicKey);
        client2PublicKey = data.publicKey;
        checkAndExchangeKeys();
    });

    // Escuchar cuando el cliente 1 envía el secreto encriptado
    socket.on('sendEncryptedSecret', (data) => {        
        console.log('Encrypted Secret: ', data.encryptedSecret);
        salt = data.salt;
        encryptedSecret = data.encryptedSecret;
        checkAndExchangeKeys();
    });

    // Función para intercambiar las claves entre ambos clientes
    const checkAndExchangeKeys = () => {
        if (client1PublicKey && client2PublicKey) {
            // Enviar la clave pública del cliente 1 al cliente 2
            io.emit('sendToClient2', { publicKey: client1PublicKey });

            // Enviar la clave pública del cliente 2 al cliente 1
            io.emit('sendToClient1', { publicKey: client2PublicKey });

            // Enviar el secreto encriptado al cliente 2
            io.emit('receiveEncryptedSecret', { encryptedSecret , salt });

            io.emit('bothUsersConnected', true); 

            // Reiniciar las variables si es necesario para manejar futuras conexiones
            client1PublicKey = null;
            client2PublicKey = null;
            encryptedSecret = null;
        }
    };

});

server.listen(3001, () => {
    console.log('listening on *:3001');
});
