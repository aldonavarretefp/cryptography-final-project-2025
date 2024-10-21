import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { decryptMessageAES, encryptMessageAES } from "../utils";

const socket = io("http://localhost:3001");

const DEFAULT_AVATAR_URL = 'https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png'

const messagesData = [
  {
    id: 1,
    user: "Rey Jhon A. Baquirin",
    avatar: DEFAULT_AVATAR_URL,
    message: "(Mensaje de prueba) Hola, ¿cómo estás?",
    time: "1 day ago",
    position: "left",
  },
];

const Messages = ({user}) => {

    const [message, setMessage] = useState('');

    const [messages, setMessages] = useState(messagesData);

    const sendMessage = () => {
        const derivedKey = localStorage.getItem('privateKey');
        console.log('Derived key:', derivedKey);
        const { encryptedData: encryptedMessageWithAES, iv } = encryptMessageAES(message, derivedKey);
        socket.emit('sendMessage', {
            encryptedMessageWithAES,
            user,
            iv,
            originalMessage: message
        });
    };

    socket.on('receiveMessage', (data) => {
        const { message, user, iv, originalMessage } = data;
        console.log(data)
        // const decipherText = decryptMessageAES(message, user, iv);
        const newMessage = {
            id: messages.length + 1,
            user: user.name || 'Anonymous',
            message: originalMessage || 'No message',
            position: 'left',
            time: Date.now().toString(),
            avatar: DEFAULT_AVATAR_URL
        }
        setMessages([...messages, newMessage]);
    });

  return (
    <div className="flex-grow h-full flex flex-col">
      <div className="w-full h-15 p-1 bg-purple-600 dark:bg-gray-400 shadow-md rounded-xl rounded-bl-none rounded-br-none">
        <div className="flex p-2 align-middle items-center">
          <div className="border rounded-full border-white p-1/2">
            <img
              className="w-14 h-14 rounded-full"
              src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png"
              alt="avatar"
            />
          </div>
          <div className="flex-grow p-2">
            <div className="text-md text-gray-50 font-semibold">
              Chat Grupal por el socket (Canal de conexión bidireccional)
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <div className="text-xs text-gray-50 ml-1">Online</div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-grow bg-gray-100 dark:bg-gray-100 p-2 overflow-y-auto my-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.user === user.name ? "justify-end" : "justify-start"
            }`}
          >
            {msg.avatar && (
              <img
                className="w-8 h-8 m-3 rounded-full"
                src={msg.avatar}
                alt="avatar"
              />
            )}
            <div
              className={`p-3 ${
                msg.position === "right"
                  ? "bg-purple-500 dark:bg-gray-800 rounded-xl rounded-br-none my-1 mx-3"
                  : "bg-purple-300 dark:bg-gray-800 mx-3 my-1 rounded-2xl rounded-bl-none sm:w-3/4 md:w-3/6"
              }`}
            >
              {msg.user && (
                <div className="text-xs text-gray-600 dark:text-gray-200">
                  {msg.user}
                </div>
              )}
              <div
                className={`text-gray-700 dark:text-gray-200 ${
                  msg.position === "right" ? "" : "hidden sm:block"
                }`}
              >
                {msg.message}
              </div>
              <div className="text-xs text-gray-400">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-15 p-3 rounded-xl rounded-tr-none rounded-tl-none bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="search-chat flex flex-grow p-2">
            <input
              className="input text-gray-700 dark:text-gray-200 text-sm p-5 focus:outline-none bg-gray-100 dark:bg-gray-800 flex-grow rounded-l-md"
              type="text"
              placeholder="Type your message ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            />
            <button className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 flex justify-center items-center pr-3 text-gray-400 rounded-r-md ml-5" onClick={sendMessage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
