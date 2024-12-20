// ChatRoomList.jsx
import React from 'react';
import { useChat } from './ChatContext';

const ChatRoomList = () => {
    const { rooms, currentRoom, enterRoom } = useChat();

    return (
        <div className="w-80 border-r bg-white">
            <div className="p-4 bg-gradient text-white font-bold">
                채팅방 목록
            </div>
            <div className="overflow-y-auto h-full">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                            currentRoom?.id === room.id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => enterRoom(room.id)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{room.roomName}</h3>
                                <p className="text-sm text-gray-500">
                                    {room.lastMessage?.content || '새로운 채팅방'}
                                </p>
                            </div>
                            {room.unreadCount > 0 && (
                                <span className="px-2 py-1 bg-primary text-white rounded-full text-xs">
                  {room.unreadCount}
                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ChatRoomList;