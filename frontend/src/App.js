import React, { useState } from 'react';
import Login from './Components/Login';
import KeyGeneration from './Components/KeyGeneration';
import Chat from './Components/Chat';

import './index.css';

function App() {
  const [derivedKey, setDerivedKey] = useState(null);  // Store the derived key from the password
  const [publicKey, setPublicKey] = useState(null);    // Store the generated public key

  // Stage control to determine which view to show
  const [stage, setStage] = useState('login');         // 'login' -> 'keyGeneration' -> 'chat'

  // Once the key is derived, move to key generation
  const handleLogin = (key) => {
    setDerivedKey(key);
    setStage('keyGeneration');
  };

  // Once the keys are generated, move to chat
  const handleKeysGenerated = (key) => {
    setPublicKey(key);
    setStage('chat');
  };

  return (
    <div className="App h-screen w-screen">
      {stage === 'login' && (
        <Login setDerivedKey={handleLogin} />
      )}

      {stage === 'keyGeneration' && (
        <KeyGeneration setPublicKey={handleKeysGenerated} />
      )}

      {stage === 'chat' && derivedKey && publicKey && (
        <Chat derivedKey={derivedKey} publicKey={publicKey} />
      )}
    </div>
  );
}

export default App;
