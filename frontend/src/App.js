import React, { useState } from 'react';
import Login from './Components/Login';
import ChooseUser from './Components/ChooseUser';
import Chat from './Components/Chat';
import WaitingRoom from './Components/WaitingRoom';

import './index.css';

function App() {
  const [userData, setUserData] = useState({});             
  const [stage, setStage] = useState('chooseUser');         

  return (
    <div className="App h-screen w-screen">
      {stage === 'chooseUser' && (
        <ChooseUser setStage={setStage} setUserData={setUserData}/>
      )}

      {stage === 'login' && (
        <Login setStage={setStage} setUserData={setUserData} userData={userData}/>
      )}

      {stage === 'waitingRoom' && (      
        <WaitingRoom setStage={setStage} userData={userData}/>
      )}

      {stage === 'chat' && (
        <Chat user={userData}/>
      )}
    </div>
  );
}

export default App;
