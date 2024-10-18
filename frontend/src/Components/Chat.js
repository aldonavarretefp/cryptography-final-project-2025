import React from 'react'
import Conversation from './Conversation';
import Messages from './Messages';

const Chat = () => {
    return (
        <div className="">
            <div className="flex bg-white dark:bg-gray-900">        
                <div className="flex-grow  h-screen p-2 rounded-md">
                        <Messages/>
                </div>
            </div>
        </div>
    )
}

export default Chat
