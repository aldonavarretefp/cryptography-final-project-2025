import React from "react";
import Messages from "./Messages";

const Chat = ({user}) => {
    return (
        <div className="">
            <div className="flex dark:bg-gray-900">        
                <div className="flex-grow  h-screen p-2 rounded-md">
                        <Messages user={user}/>
                </div>
            </div>
        </div>
    )
}

export default Chat;
