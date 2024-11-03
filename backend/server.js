const express = require('express'); // Import the Express library
const http = require('http'); // Import the HTTP library
const { Server } = require('socket.io'); // Import the Socket.IO library
const app = express(); // Create an Express application
const cors = require('cors'); // Import the CORS library
const server = http.createServer(app); // Create an HTTP server using the Express app

// Stores keys for demonstration purposes (use secure storage in production)
let keys = {};

app.use(cors({
    origin: 'http://localhost:3000', // Allow CORS from this origin
}));

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow CORS from this origin
        methods: ['GET', 'POST'], // Allow these HTTP methods
    },
});

let client1PublicKey = null; // Variable to store Client 1's public key
let client2PublicKey = null; // Variable to store Client 2's public key

io.on('connection', (socket) => {
    // Code to execute when a client connects

    console.log('a user connected'); // Log when a user connects
    console.log('keys:', keys); // Log the current keys

    socket.on('sendMessage', (data) => {
        // Handle the 'sendMessage' event
        try {
            const { 
                encryptedData, 
                signature,
                sender,
                publicKey
            } = data;

            console.log('Encrypted Data:', encryptedData); // Log the encrypted data
            console.log('Signature:', signature); // Log the signature
            console.log('Sender:', sender); // Log the sender
            console.log('------Public Key:------', publicKey); // Log the public key

            socket.broadcast.emit('receiveMessage', data); // Broadcast the message to other clients
        } catch (err) {
            console.error('Error decrypting message:', err); // Log any errors
        }
    });

    socket.on('disconnect', () => {
        // Handle the 'disconnect' event
        console.log('user disconnected'); // Log when a user disconnects
        client1PublicKey = null; // Reset Client 1's public key
        client2PublicKey = null; // Reset Client 2's public key
    });

    // Listen for when Client 1 submits their public key
    socket.on('client1FormSubmitted', (data) => {
        console.log('Client 1 submitted:', data.publicKey); // Log Client 1's public key
        client1PublicKey = data.publicKey; // Store Client 1's public key
        checkAndExchangeKeys(); // Check and exchange keys if both clients have submitted
    });

    // Listen for when Client 2 submits their public key
    socket.on('client2FormSubmitted', (data) => {
        console.log('Client 2 submitted:', data.publicKey); // Log Client 2's public key
        client2PublicKey = data.publicKey; // Store Client 2's public key
        checkAndExchangeKeys(); // Check and exchange keys if both clients have submitted
    });

    // Listen for when Client 1 sends the encrypted secret
    socket.on('sendEncryptedSecret', (data) => {        
        console.log('Encrypted Secret: ', data.encryptedSecret); // Log the encrypted secret
        const encryptedSecret = data.encryptedSecret; // Get the encrypted secret from the data
        const salt = data.salt; // Get the salt from the data        
        socket.broadcast.emit('receiveEncryptedSecret', { encryptedSecret , salt }); // Broadcast the encrypted secret and salt to other clients
    });

    // Function to exchange keys between both clients
    const checkAndExchangeKeys = () => {
        if (client1PublicKey && client2PublicKey) {
            // If both clients have submitted their public keys

            // Send Client 1's public key to Client 2
            io.emit('sendToClient2', { publicKey: client1PublicKey });

            // Send Client 2's public key to Client 1
            io.emit('sendToClient1', { publicKey: client2PublicKey });

            // Notify both clients that they are connected
            io.emit('bothUsersConnected', true); 

            // Reset the public key variables for future connections
            client1PublicKey = null;
            client2PublicKey = null;
        }
    };

});

server.listen(3001, () => {
    // Start the server and listen on port 3001
    console.log('listening on *:3001'); // Log that the server is listening
});
