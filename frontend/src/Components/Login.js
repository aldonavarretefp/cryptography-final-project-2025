import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const deriveAESKey = async (password) => {
  // Convierte la contraseña en un array de bytes
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Deriva una clave usando PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Generar una clave AES-GCM a partir de la contraseña con salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Número de iteraciones para hacer más robusta la clave
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 }, // Clave AES de 256 bits
    true,
    ["encrypt", "decrypt"]
  );

  return { aesKey, salt };
};

const encryptPrivateKey = async (privateKey, password) => {
  const { aesKey, salt } = await deriveAESKey(password);

  // Codificar la clave privada a bytes
  const encoder = new TextEncoder();
  const privateKeyBytes = encoder.encode(privateKey);

  // Crear un vector de inicialización (IV) aleatorio
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Encriptar la clave privada usando AES-GCM
  const encryptedPrivateKey = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv, // IV es requerido por AES-GCM
    },
    aesKey,
    privateKeyBytes
  );

  // Convertir el resultado a base64
  const encryptedPrivateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedPrivateKey)));
  //const ivBase64 = btoa(String.fromCharCode(...iv));
  //const saltBase64 = btoa(String.fromCharCode(...salt));

  // Guardar en localStorage el IV, salt, y la clave privada encriptada
  //localStorage.setItem("privateKey", privateKey);
  sessionStorage.setItem("encryptedPrivateKey", encryptedPrivateKeyBase64);

  console.log('Private Key encrypted and stored in localStorage.');
};

function Login({ setStage, setUserData, userData }) {
  const [userName, setUserName] = useState('');
  const [secret, setSecret] = useState('');
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState('');
  const [privateKeyPassword, setPrivateKeyPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Configurar los datos del usuario
    setUserData({
      userName,
      secret,
      encryptedPrivateKey,
      privateKeyPassword,
      publicKey
    });

    if (userData.userClientNumber === 1) {
      // Cliente 1 envía el formulario
      socket.emit('client1FormSubmitted', { publicKey });
    } else {
      // Cliente 2 envía el formulario
      socket.emit('client2FormSubmitted', { publicKey });
    }

    sessionStorage.setItem("publicKey", publicKey);
    sessionStorage.setItem("encryptedPrivateKey", encryptedPrivateKey);
    // Cambiar el estado a 'waitingRoom'
    setStage('waitingRoom');

  };

  const downloadKeys = () => {
    // Validar si existen las claves
    if (!publicKey || !encryptedPrivateKey) {
      alert("No se encontraron las claves para descargar.");
      return;
    }
  
    // Crear el contenido del archivo
    const content = `Public Key:\n${publicKey}\n\nEncrypted Private Key:\n${encryptedPrivateKey}`;
  
    // Crear un blob con el contenido y un enlace para la descarga
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
  
    // Crear un enlace de descarga
    const a = document.createElement("a");
    a.href = url;
    a.download = "keys.txt";  // Nombre del archivo a descargar
    document.body.appendChild(a);
    a.click();
  
    // Eliminar el enlace una vez descargado
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateAsymmetricKeys = async () => {
    // Validar si el campo Private Key Password está vacío
    if (!privateKeyPassword) {
      console.log('Error: El campo Private Key Password está vacío.');
      alert('Por favor, llena el campo de Private Key Password antes de generar las llaves.');
      return;
    }

    try {
      // Generar el par de claves RSA
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: "SHA-256" },
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Exportar las claves públicas y privadas
      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      // Convertir las claves a base64
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

      // Asignar la clave pública al campo correspondiente
      setPublicKey(publicKeyBase64);
      sessionStorage.setItem("publicKey", publicKeyBase64);
      //sessionStorage.setItem("privateKey", privateKeyBase64);

      // Encriptar la clave privada con la contraseña y guardarla en localStorage
      await encryptPrivateKey(privateKeyBase64, privateKeyPassword);
      loadEncryptedPrivateKey();

      console.log('Llaves generadas y clave privada encriptada.');
    } catch (error) {
      console.error('Error al generar las llaves:', error);
    }
  };

  const loadEncryptedPrivateKey = () => {
    // Recuperar la clave privada encriptada desde localStorage
    const encryptedPrivateKeyFromStorage = sessionStorage.getItem('encryptedPrivateKey');

    if (encryptedPrivateKeyFromStorage) {
      // Mostrar la clave privada encriptada en el TextField correspondiente
      setEncryptedPrivateKey(encryptedPrivateKeyFromStorage); // Asignar al estado de 'privateKey'
      console.log('Encrypted private key loaded into TextField.');
    } else {
      console.log('No encrypted private key found in localStorage.');
      alert('No se encontró ninguna clave privada encriptada en localStorage.');
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Criptografía"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h1 className='mt-6 text-3xl font-extrabold text-gray-900 text-center'>
            Let's crypto-start
          </h1>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nombre del usuario */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  required
                  autoComplete="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Secreto */}
            {
              userData.userClientNumber === 1 && (
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Secret
                  </label>
                  <div className="mt-1">
                    <input
                      id="secret"
                      name="secret"
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              )
            }

            {/* Llave Pública */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Public Key
              </label>
              <div className="mt-1">
                <input
                  id="publicKey"
                  name='publicKey'
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Llave Privada */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Encrypted Private Key
              </label>
              <div className="mt-1">
                <input
                  id="encryptedPrivateKey"
                  name="encryptedPrivateKey"
                  type="text"
                  value={encryptedPrivateKey}
                  onChange={(e) => setEncryptedPrivateKey(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Contraseña Llave Privada */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Private Key Password
              </label>
              <div className="mt-1">
                <input
                  id="privateKeyPassword"
                  name="privateKeyPassword"
                  type="text"
                  value={privateKeyPassword}
                  onChange={(e) => setPrivateKeyPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Botón de generar llaves */}
            <div>
              <button
                type="button"
                onClick={generateAsymmetricKeys}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Don't you have keys? Generate Keys
              </button>
            </div>

            {/* Botón para descargar el archivo .txt */}
            <div>
              <button
                type="button"
                onClick={downloadKeys}
                className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Download Keys as TXT
              </button>
            </div>

            {/* Botón de siguiente */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Next
              </button>
            </div>
            <div>
              <button
                onClick={() => setStage('chooseUser')}
                className="flex w-full justify-center rounded-md bg-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Back
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default Login;