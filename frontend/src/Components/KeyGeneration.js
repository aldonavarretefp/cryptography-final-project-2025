import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './KeyGeneration.css';
import { generateKeyPair } from '../../utils';

const socket = io('http://localhost:3001');

function KeyGeneration({ setPublicKey: setDerivedKey, userData }) {
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [derivedKey, setLocalDerivedKey] = useState('');

  useEffect(() => {
    try {
        const generateKeys = async () => {
            const keys = await generateKeyPair();
            setDerivedKey(keys.publicKey);
            setLocalDerivedKey(keys.privateKey);
            setKeysGenerated(true);
        }
        generateKeys();
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  }, [setDerivedKey, userData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`relative bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white text-2xl font-bold p-6 rounded-lg shadow-lg ${keysGenerated ? 'animate-fade-out' : 'animate-pulse'}`}>
          <h2 className="relative z-10">{keysGenerated ? 'Connected!' : 'Waiting for the other user...'}</h2>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
        </div>
        {keysGenerated && (
          <div className="keys-container animate-fade-in">
            <h3 className="text-lg font-semibold mt-4">Derived Key</h3>
            <p className="break-words">{derivedKey}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KeyGeneration;
