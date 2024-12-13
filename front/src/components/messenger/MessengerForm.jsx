import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import '../../styles/messenger.css';

const MessengerForm = ({ isWidget }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 모바일 환경 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        const chatData = response.data[0];
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

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    try {
      await axios.post(`http://localhost:3002/messages/${selectedChat.id}`, {
        messages: [...messages, messageData]
      });
    } catch (error) {
      console.error('메시지 전송에 실패했습니다:', error);
      setMessages(prev => prev.filter(msg => msg.id !== messageData.id));
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  // 모바일에서 채팅방이 선택되었을 때의 UI
  const renderMobileChat = () => (
    <div className="mobile-chat-container">
      <div className="mobile-chat-header">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <div className="chat-header-info">
          <img src={selectedChat.avatar} alt={selectedChat.name} className="chat-avatar-small" />
          <h2>{selectedChat.name}</h2>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="loading-message">메시지를 불러오는 중...</div>
        ) : (
          <>
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
          </>
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
  );

  // 기본 데스크톱 UI
  const renderDesktopUI = () => (
    <div className={`messenger-container ${selectedChat && isWidget ? 'has-selected-chat' : ''}`}>
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>채팅 목록</h2>
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
            {isWidget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <button onClick={handleBack} className="back-button">
                  <ArrowLeft size={24} />
                </button>
                <h2>{selectedChat.name}</h2>
              </div>
            ) : (
              <h2>{selectedChat.name}</h2>
            )}
          </div>

          <div className="messages-container" ref={messagesContainerRef}>
            {loading ? (
              <div className="loading-message">메시지를 불러오는 중...</div>
            ) : (
              <>
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
              </>
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

  // 모바일 UI
  const renderMobileUI = () => (
    <div className="messenger-container mobile">
      {selectedChat ? (
        renderMobileChat()
      ) : (
        <div className="chat-list full-width">
          <div className="chat-list-header">
            <h2>채팅 목록</h2>
          </div>
          <div className="chat-list-content">
            {chats.map(chat => (
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
      )}
    </div>
  );

  return isMobile ? renderMobileUI() : renderDesktopUI();
};

export default MessengerForm;