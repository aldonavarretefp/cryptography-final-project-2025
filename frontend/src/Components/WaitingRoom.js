import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { encryptSecretForUser2, decryptSecretWithPrivateKey, generateSymmetricKey, decryptPrivateKeyWithPassword } from './../utils/criptoUtils';

const socket = io('http://localhost:3001');

function WaitingRoom({ setStage, userData, setUserData }) {
    const [bothUsersConnected, setBothUsersConnected] = useState(false);
    const [setReceivedPublicKey] = useState('');

    useEffect(() => {
        // Escuchar el evento que indica que ambos usuarios están conectados
        socket.on('bothUsersConnected', (status) => {
            setBothUsersConnected(status);
            setStage('chat');            
        });

        // Escuchar cuando el cliente 1 reciba la clave pública del cliente 2
        socket.on('sendToClient1', async (data) => {
            if(userData.clientNumber === 1) {
                console.log('Received public key from Client 2:', data.publicKey);
                setReceivedPublicKey(data.publicKey);
                sessionStorage.setItem('othersPublicKey', data.publicKey);

                // Encriptar y enviar el secreto con la salt
                const secret = userData.secret;
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const encryptedSecret = await encryptSecretForUser2(secret,data.publicKey);
                console.log('Encrypted Secret:', encryptedSecret);
                socket.emit('sendEncryptedSecret', { encryptedSecret , salt });

                //Generar y guardar llave simétrica
                const symmetricKey = await generateSymmetricKey(secret,salt);                
                setUserData(prevData => ({
                    ...prevData,
                    symmetricKey
                }));
            }
        });

        // Escuchar cuando el cliente 2 reciba la clave pública del cliente 1
        socket.on('sendToClient2', (data) => {
            if(userData.clientNumber === 2) { 
                console.log('Received public key from Client 1:', data.publicKey);
                setReceivedPublicKey(data.publicKey);
                sessionStorage.setItem('othersPublicKey', data.publicKey);  
            }
        });

        socket.on('receiveEncryptedSecret', async (data) => {
            if(userData.clientNumber === 2) {                
                //Desencriptar el secreto                            
                const encriptedPrivateKey = sessionStorage.getItem('encryptedPrivateKey');
                const privateKey = await decryptPrivateKeyWithPassword(encriptedPrivateKey, userData.privateKeyPassword);

                const encryptedSecret = data.encryptedSecret;
                const secret = await decryptSecretWithPrivateKey(encryptedSecret, privateKey);
                
                //Generar y guardar llave simétrica
                const salt = data.salt;
                const symmetricKey = await generateSymmetricKey(secret,salt);                
                setUserData(prevData => ({
                    ...prevData,
                    symmetricKey
                }));
            }
        });

        // Limpieza de eventos cuando el componente se desmonte
        return () => {
            socket.off('bothUsersConnected');
            socket.off('sendToClient1');
            socket.off('sendToClient2');
        };
    }, [ setStage, setUserData, userData.clientNumber, setReceivedPublicKey, userData.secret, userData.privateKeyPassword ]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className={`relative bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white text-2xl font-bold p-6 rounded-lg shadow-lg ${bothUsersConnected ? 'animate-fade-out' : 'animate-pulse'}`}>
                    <h2 className="relative z-10">{bothUsersConnected ? 'Connected!' : 'Waiting for the other user...'}</h2>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
                </div>
                {bothUsersConnected && (
                    <div className="keys-container animate-fade-in">
                        <h3 className="text-lg font-semibold mt-4">Both Users Connected</h3>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WaitingRoom;
