import React, { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function KeyGeneration({ setPublicKey }) {
  useEffect(() => {
    socket.emit('generateKeys');

    socket.on('keysGenerated', (data) => {
      setPublicKey(data.publicKey);
    });
  }, [setPublicKey]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white text-2xl font-bold p-6 rounded-lg shadow-lg animate-pulse">
          <h2 className="relative z-10">Keys are being generated...</h2>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export default KeyGeneration;
