// ChatInput.jsx
import React, { useState } from 'react';
import { useChat } from './ChatContext';

const ChatInput = () => {
    const [message, setMessage] = useState('');
    const { sendMessage, currentRoom } = useChat();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || !currentRoom) return;

        sendMessage(message.trim());
        setMessage('');
    };

    if (!currentRoom) return null;

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="flex">
                <input
                    type="text"
                    className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-r-lg hover:bg-secondary transition-colors"
                >
                    전송
                </button>
            </div>
        </form>
    );
};

export default ChatInput;