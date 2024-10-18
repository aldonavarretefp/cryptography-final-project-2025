import React from 'react';

const messages = [
    {
        id: 1,
        user: 'Rey Jhon A. Baquirin',
        avatar: 'https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png',
        message: 'gsegjsghjbdg bfb sbjbfsj fsksnf jsnfj snf nnfnsnfsnj',
        time: '1 day ago',
        position: 'left',
    },
    {
        id: 2,
        user: 'Rey Jhon A. Baquirin',
        avatar: 'https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png',
        message: 'gsegjsghjbdg bfb sbjbfsj fsksnf jsnfj snf nnfnsnfsnj',
        time: '1 day ago',
        position: 'left',
    },
    {
        id: 3,
        message: 'Hello ? How Can I help you ?',
        position: 'right',
    },
    {
        id: 4,
        message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        position: 'right',
    },
    {
        id: 5,
        message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam',
        position: 'right',
    }
];

const Messages = () => {
    return (
        <div className="flex-grow h-full flex flex-col">
        <div className="w-full h-15 p-1 bg-purple-600 dark:bg-gray-800 shadow-md rounded-xl rounded-bl-none rounded-br-none">
            <div className="flex p-2 align-middle items-center">
            <div className="border rounded-full border-white p-1/2">
                <img className="w-14 h-14 rounded-full" src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png" alt="avatar" />
            </div>
            <div className="flex-grow p-2">
                <div className="text-md text-gray-50 font-semibold">Rey Jhon A. Baquirin</div>
                <div className="flex items-center">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <div className="text-xs text-gray-50 ml-1">Online</div>
                </div>
            </div>
            </div>
        </div>
        <div className="w-full flex-grow bg-gray-100 dark:bg-gray-900 my-2 p-2 overflow-y-auto">
            {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.position === 'right' ? 'justify-end' : 'items-end w-3/4'}`}>
                {msg.avatar && (
                <img className="w-8 h-8 m-3 rounded-full" src={msg.avatar} alt="avatar" />
                )}
                <div className={`p-3 ${msg.position === 'right' ? 'bg-purple-500 dark:bg-gray-800 rounded-xl rounded-br-none' : 'bg-purple-300 dark:bg-gray-800 mx-3 my-1 rounded-2xl rounded-bl-none sm:w-3/4 md:w-3/6'}`}>
                {msg.user && (
                    <div className="text-xs text-gray-600 dark:text-gray-200">{msg.user}</div>
                )}
                <div className={`text-gray-700 dark:text-gray-200 ${msg.position === 'right' ? '' : 'hidden sm:block'}`}>
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
                <input className="input text-gray-700 dark:text-gray-200 text-sm p-5 focus:outline-none bg-gray-100 dark:bg-gray-800 flex-grow rounded-l-md" type="text" placeholder="Type your message ..." />
                <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 flex justify-center items-center pr-3 text-gray-400 rounded-r-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Messages;
