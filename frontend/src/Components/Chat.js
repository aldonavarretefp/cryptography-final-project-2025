import React from "react";
import Messages from "./Messages";

/**
 * Chat component that renders a chat interface with messages.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.setUserData - Function to update user data.
 * @param {Object} props.userData - The current user data.
 * @returns {JSX.Element} The rendered Chat component.
 */
const Chat = ({ setUserData, userData }) => {
    return (
        <div className="">
            <div className="flex dark:bg-gray-900">        
                <div className="flex-grow  h-screen p-2 rounded-md">
                        <Messages setUserData={setUserData} userData={userData} /> 
                        {
                            console.log(userData)
                        }
                </div>
            </div>
        </div>
    )
}

export default Chat;
