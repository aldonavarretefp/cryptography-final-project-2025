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

      // Verificar el mensaje
      //const isVerified = await verifySignature(decryptedData, signature, keyPair.publicKey);

      console.log("send", {
        encryptedData,
        signature
      });

      socket.emit("sendMessage", {
        encryptedData,
        signature,
        sender: userData.name
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

      // Descencriptar mensaje
      const decryptedMessage = await decryptMessage(encryptedData, userData.symmetricKey);
      console.log(data);

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

      <div className="w-full h-15 p-1 bg-purple-600 dark:bg-gray-400 shadow-md rounded-xl rounded-bl-none rounded-br-none">
        {alertMessage.alertTitle && <Alert alert={alertMessage} />}
        <div className="flex p-2 align-middle items-center">
          <div className="border rounded-full border-white p-1/2">
            <img
              className="w-14 h-14 rounded-full"
              src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png"
              alt="avatar"
            />
          </div>

          <div className="flex-grow p-2">
              {
                userData.clientNumber === 1 && (
                  <div className="text-md text-gray-50 font-semibold">
                    User 2
                  </div>  
                )
              }

              {
                userData.clientNumber === 2 && (
                  <div className="text-md text-gray-50 font-semibold">
                    User 1
                  </div>  
                )
              }
              
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
            className={`flex ${msg.user === userData.name ? "justify-end" : "justify-start"
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
              className={`p-3 ${msg.position === "right"
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
                className={`text-gray-700 dark:text-gray-200 ${msg.position === "right" ? "" : "hidden sm:block"
                  }`}
              >
                {msg.message}
              </div>
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
            <button
              className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 flex justify-center items-center pr-3 text-gray-400 rounded-r-md ml-5"
              onClick={sendMessage}
            >
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
