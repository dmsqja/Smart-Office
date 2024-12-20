// ChatMessages.jsx
import {useEffect, useRef} from "react";
import {useChat} from "./ChatContext";

const ChatMessages = () => {
    const { messages, currentUser } = useChat();
    const messagesEndRef = useRef(null);
    console.log('Current messages:', messages);

    useEffect(() => {
        console.log('Messages updated:', messages); // 디 버깅 로그 추가
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4">
            {messages
                .filter(message => message.type === 'CHAT') // ENTER 타입 메시지 제외
                .map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 flex ${
                            message.senderId === currentUser?.employeeId ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {message.senderId !== currentUser?.employeeId && (
                            <div className="flex-shrink-0 mr-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    {message.senderName?.charAt(0)}
                                </div>
                            </div>
                        )}
                        <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.senderId === currentUser?.employeeId
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-gray-200 rounded-bl-none'
                            }`}
                        >
                            {message.senderId !== currentUser?.employeeId && (
                                <div className="text-xs text-gray-600 mb-1">{message.senderName}</div>
                            )}
                            <p>{message.content}</p>
                            <div className="text-xs mt-1 text-right">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
export default ChatMessages;