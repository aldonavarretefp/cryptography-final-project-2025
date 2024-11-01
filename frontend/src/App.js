import React, { useState } from 'react';
import Login from './Components/Login';
import ChooseUser from './Components/ChooseUser';
import Chat from './Components/Chat';
import WaitingRoom from './Components/WaitingRoom';

import './index.css';

/**
 * Main application component that manages different stages of the application.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 * 
 * @example
 * return (
 *   <App />
 * )
 * 
 * @typedef {Object} UserData
 * @property {string} [name] - The name of the user.
 * @property {string} [email] - The email of the user.
 * 
 * @typedef {('chooseUser'|'login'|'waitingRoom'|'chat')} Stage
 * 
 * @property {UserData} userData - The state object containing user data.
 * @property {function} setUserData - Function to update the user data state.
 * @property {Stage} stage - The current stage of the application.
 * @property {function} setStage - Function to update the stage state.
 */
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
        <WaitingRoom setStage={setStage} userData={userData} setUserData={setUserData}/>
      )}

      {stage === 'chat' && (
        <Chat setUserData={setUserData} userData={userData}/>
      )}
    </div>
  );
}

export default App;
