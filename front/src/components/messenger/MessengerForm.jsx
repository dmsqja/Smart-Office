import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/messenger.css';

const MessengerForm = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);

  // 채팅 목록 불러오기
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:3002/chats');
        setChats(response.data);
      } catch (error) {
        console.error('채팅 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchChats();
  }, []);

  // 선택된 채팅방의 메시지 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3002/messages?chatId=${selectedChat.id}`);
        const chatData = response.data[0]; // 첫 번째 결과만 사용
        if (chatData) {
          setMessages(chatData.messages);
        }
      } catch (error) {
        console.error('메시지를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageData = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // 낙관적 업데이트
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    try {
      // 실제 API 호출 (실제 구현 시에는 웹소켓이나 적절한 API 엔드포인트 사용)
      await axios.post(`http://localhost:3002/messages/${selectedChat.id}`, {
        messages: [...messages, messageData]
      });
    } catch (error) {
      console.error('메시지 전송에 실패했습니다:', error);
      // 에러 발생 시 메시지 롤백
      setMessages(prev => prev.filter(msg => msg.id !== messageData.id));
    }
  };

  return (
    <div className="messenger-container">
      <div className="chat-list">
        <div className="chat-list-header">
          <h3>메시지</h3>
        </div>
        <div className="chat-list-content">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-list-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
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

          <div className="messages-container" style={{ display: 'flex', flexDirection: 'column-reverse' }}>
            {loading ? (
              <div className="loading-message">메시지를 불러오는 중...</div>
            ) : (
              messages.map((message) => (
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
              ))
            )}
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