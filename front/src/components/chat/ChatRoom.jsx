// pages/chat/ChatRoom.jsx
import React, { useEffect } from 'react';
import ChatRoomList from './ChatRoomList';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChat } from './ChatContext';
import CreateChatRoom from './CreateChatRoom';
import ChatRoomMembers from './ChatRoomMembers';

const ChatRoom = () => {
    const { fetchRooms, currentRoom } = useChat();

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="flex h-screen">
            <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                    <CreateChatRoom />
                </div>
                <ChatRoomList />
            </div>
            {currentRoom ? (
                <>
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b bg-white">
                            <h2 className="font-bold">
                                {currentRoom.type === 'GROUP'
                                    ? currentRoom.roomName
                                    : currentRoom.otherUserName}
                            </h2>
                        </div>
                        <ChatMessages />
                        <ChatInput />
                    </div>
                    <ChatRoomMembers roomId={currentRoom.id} />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    채팅방을 선택해주세요
                </div>
            )}
        </div>
    );
};

export default ChatRoom;