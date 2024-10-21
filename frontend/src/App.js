import React, { useState } from 'react';
import Login from './Components/Login';
import KeyGeneration from './Components/KeyGeneration/KeyGeneration';
import Chat from './Components/Chat';

import './index.css';

function App() {
  const [derivedKey, setDerivedKey] = useState(null);    // Store the generated public key
  const [userData, setUserData] = useState({});              // Store the user information

  // Stage control to determine which view to show
  const [stage, setStage] = useState('login');         // 'login' -> 'keyGeneration' -> 'chat'

  // Once the key is derived, move to key generation
  const handleLogin = (key) => {
    setDerivedKey(key);
    setStage('keyGeneration');
  };

  // Once the keys are generated, move to chat
  const handleKeysGenerated = (key) => {
    setDerivedKey(key);
    setStage('chat');
  };

  return (
    <div className="App h-screen w-screen">
      {stage === 'login' && (
        <Login setDerivedKey={handleLogin} setUserData={setUserData}/>
      )}

      {stage === 'keyGeneration' && (
        <KeyGeneration setPublicKey={handleKeysGenerated} userData={userData} />
      )}

      {stage === 'chat' && derivedKey && derivedKey && (
        <Chat user={userData}
        derivedKey={derivedKey} publicKey={derivedKey} user={userData}/>
      )}
    </div>
  );
}

export default App;
