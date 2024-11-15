import ChatForm from '../components/chat/ChatForm';
import '../styles/pages.css';

const Chat = () => {
  return (
    <div className="page chat-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="text-gradient">Chat</span>
        </h1>
      </div>
      <div className="chat-container">
        <ChatForm />
      </div>
    </div>
  );
};

export default Chat;