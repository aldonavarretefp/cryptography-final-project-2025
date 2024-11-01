import React from 'react'

/**
 * ConversationItem component renders a single conversation item with avatar, name, time, and message.
 *
 * @param {Object} props - The properties object.
 * @param {boolean} props.active - Indicates if the conversation item is active.
 * @param {string} props.time - The time of the last message.
 * @param {string} props.name - The name of the conversation participant.
 * @param {string} props.message - The last message in the conversation.
 * @returns {JSX.Element} The rendered conversation item component.
 */
const ConversationItem = ({active, time, name, message}) => {
    const _class = active ? 'bg-gray-200' : 'bg-white';
    return (
        <div>
            <div className={'conversation-item p-1 dark:bg-gray-700 hover:bg-gray-200 m-1 rounded-md ' + _class} >
                <div className={'flex items-center p-2  cursor-pointer  '}>
                    <div className="w-7 h-7 m-1">
                        <img className="rounded-full" src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png" alt="avatar"/>
                    </div>
                    <div className="flex-grow p-2">
                        <div className="flex justify-between text-md ">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{name}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-300">{time}</div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400  w-40 truncate">
                        {message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConversationItem
