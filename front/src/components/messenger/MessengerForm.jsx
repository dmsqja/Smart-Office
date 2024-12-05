// MessengerForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/messenger.css';

const MessengerForm = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  // 목업 채팅 데이터 추가
  const mockChats = [
    {
      id: 1,
      name: "홍길동",
      lastMessage: "네 알겠습니다!",
      time: "1시간 전",
      avatar: "/assets/profile2.png"
    },
    {
      id: 2,
      name: "김철수",
      lastMessage: "회의 시간이 어떻게 되나요?",
      time: "2시간 전",
      avatar: "/assets/profile3.png"
    }
  ];


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageData = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className="messenger-container">
        <div className="chat-list">
            <div className="chat-list-header">
                <h3>메시지</h3>
            </div>
            <div className="chat-list-content">
                {mockChats.map(chat => (
                    <div
                        key={chat.id}
                        className="chat-list-item"
                        onClick={() => setSelectedChat(chat)}
                    >
                        <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
                        <div className="chat-info">
                            <div className="chat-name">{chat.name}</div>
                            <div className="chat-last-message">{chat.lastMessage}</div>
                        </div>
                        <div className="chat-time">{chat.time}</div>
                    </div>
                ))}
            </div>
        </div>

{selectedChat ? (
            <div className="chat-container">
                <div className="chat-header">
                    <h2>{selectedChat.name}</h2>
                </div>

                <div className="messages-container">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message-wrapper ${message.sender === 'user' ? 'sent' : 'received'}`}
                        >
                            <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'}`}>
                                <p>{message.text}</p>
                                <div className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-container">
                    <form onSubmit={handleSubmit} className="message-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="message-input"
                            placeholder="메시지를 입력하세요..."
                        />
                        <button type="submit" className="send-button">
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        ) : (
            <div className="chat-container empty-state">
                <div className="empty-state-message">
                    채팅을 선택해주세요
                </div>
            </div>
        )}
    </div>
  );
};

export default MessengerForm;