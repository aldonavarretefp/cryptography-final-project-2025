import React, { useState } from "react";
import io from "socket.io-client";
import Alert from "./Alert";
import { decryptPrivateKeyWithPassword, encryptMessage, signMessage, verifySignature, decryptMessage, importPrivateKey, importPublicKey } from "./../utils/criptoUtils";

const socket = io("http://localhost:3001");

const DEFAULT_AVATAR_URL = "https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png";

const messagesData = [
  {
    id: 1,
    user: "Rey Jhon A. Baquirin",
    avatar: DEFAULT_AVATAR_URL,
    message: "(Mensaje de prueba) Hola, ¿cómo estás?",
    time: "1 day ago",
    position: "left",
  },
  {
    id: 2,
    user: "Rey Jhon A. Baquirin",
    avatar: DEFAULT_AVATAR_URL,
    message: "(Mensaje de prueba) Hola, ¿cómo estás?",
    time: "1 day ago",
    position: "right",
  }
];

const Messages = ({ setUserData, userData }) => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState(messagesData);

  const [alertMessage, setAlertMessage] = useState({
    alertTitle: "",
    alertMessage: "",
    alertType: "danger",
  });

  /*
  const setAlertMessageFunc = (isVerified) => {
    if (isVerified) {
      setAlertMessage({
        alertTitle: "Mensaje verificado",
        alertMessage: "El mensaje ha sido verificado correctamente",
        alertType: "success",
      });
    } else {
      setAlertMessage({
        alertTitle: "Mensaje no verificado",
        alertMessage: "El mensaje no ha sido verificado correctamente",
        alertType: "danger",
      });
    }
  };*/


  const sendMessage = async () => {
    try {
      // Obtener mis llaves
      const encriptedPrivateKey = sessionStorage.getItem("encryptedPrivateKey");
      const privateKeyPem = await decryptPrivateKeyWithPassword(encriptedPrivateKey, userData.privateKeyPassword);
      const privateKey = await importPrivateKey(privateKeyPem);

      // Encriptar el mensaje
      const encryptedData = await encryptMessage(message, userData.symmetricKey);

      // Firmar el mensaje
      //const signature = await signMessage(message, privateKey);
      const signature = "";

  
      socket.emit("sendMessage", {
        encryptedData,
        signature,
        sender: userData.userName
      });


      const newMessage = {
        id: messages.length + 1,
        user: userData.userName,
        message: message,
        position:"right",
        time: Date.now().toString(),
        avatar: DEFAULT_AVATAR_URL,
      };

      setMessages([...messages, newMessage]);
      setMessage("");
    } catch (err) {
      console.error("Error encrypting message:", err);
    }
  };

  socket.on("receiveMessage", async (data) => {
    try {
      const {
        encryptedData,
        signature,
        sender
      } = data;

      console.log("receiveMessage", { encryptedData, signature, sender });

      // Descencriptar mensaje
      const decryptedMessage = await decryptMessage(encryptedData, userData.symmetricKey);

      // Verificar la firma del mensaje
      const othersPublicKeyPem = sessionStorage.getItem('othersPublicKey');
      const othersPublicKey = await importPublicKey(othersPublicKeyPem);
      //const isVerified = await verifySignature(decryptedMessage, signature, othersPublicKey);
      const isVerified = true;

      console.log("receive", {
        decryptedMessage,
        isVerified
      });

      //setAlertMessageFunc(isVerified);

      const newMessage = {
        id: messages.length + 1,
        user: sender,
        message: decryptedMessage,
        position: "left", 
        time: Date.now().toString(),
        avatar: DEFAULT_AVATAR_URL,
      };
      setMessages([...messages, newMessage]);
      console.log("newMessage", newMessage);
    } catch (error) {
      console.error("Error decrypting message:", error);
    }
  });

  return (
    <div className="flex-grow h-full flex flex-col">
      {/* Header */}
      <div className="w-full h-15 p-1 bg-purple-600 dark:bg-gray-700 shadow-md rounded-t-xl">
        {alertMessage.alertTitle && <Alert alert={alertMessage} />}
        <div className="flex items-center p-2">
          <div className="border border-white rounded-full p-1/2">
            <img
              className="w-14 h-14 rounded-full"
              src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png"
              alt="avatar"
            />
          </div>
          <div className="flex-grow pl-3">
            <div className="text-md text-gray-50 font-semibold">
              {userData.clientNumber === 1 ? 'User 2' : 'User 1'}
            </div>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span className="ml-1 text-xs text-gray-50">Online</span>
            </div>
          </div>
        </div>
      </div>
  
      {/* Chat Messages */}
      <div className="flex-grow w-full bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.position === "left" ? "justify-start" : "justify-end"}`}>            
            <div
              
              className={`p-3 ${msg.position === "left"
                ? "bg-purple-300 text-gray-800 rounded-xl rounded-bl-none mr-2"
                : "bg-purple-500 text-gray-50 rounded-xl rounded-br-none ml-2"
              } max-w-xs sm:max-w-md lg:max-w-lg`}>
              
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {msg.user}
              </div>
              <div className="mt-1 text-sm">
                {msg.message}
              </div>
            </div>            
          </div>
        ))}
      </div>
  
      {/* Message Input */}
      <div className="h-16 p-3 bg-gray-100 dark:bg-gray-700 rounded-b-xl">
        <div className="flex items-center">
          <input
            className="flex-grow px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-l-md focus:outline-none"
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-r-md focus:outline-none hover:bg-purple-500"
            onClick={sendMessage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
