import React from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function ChooseUser({ setStage, setUserData }) {

    socket.emit('connection');

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
                <h1 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
                    Choose a user
                </h1>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="space-y-6">
                    {/* Botón para cambiar el estado a 'pantalla-1' */}
                    <button
                        onClick={() => {setStage('login'); setUserData({userClientNumber: 1})}}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Client 1
                    </button>

                    {/* Botón para cambiar el estado a 'pantalla-2' */}
                    <button
                        onClick={() => {setStage('login'); setUserData({userClientNumber: 2})}}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Client 2
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChooseUser;