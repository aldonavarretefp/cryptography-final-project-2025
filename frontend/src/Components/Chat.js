import React, { useState } from 'react';
import io from 'socket.io-client';
import { encryptMessage, decryptMessage } from '../utils';

const socket = io('http://localhost:3001');

function Chat({ derivedKey }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    const encryptedMessage = encryptMessage(message, derivedKey);
    socket.emit('sendMessage', encryptedMessage);
  };

  socket.on('receiveMessage', (encryptedData) => {
    const decryptedMessage = decryptMessage(encryptedData, derivedKey);
    setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
  });

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default Chat;
