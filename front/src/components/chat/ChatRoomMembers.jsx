// components/chat/ChatRoomMembers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatRoomMembers = ({ roomId }) => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`/api/chat/rooms/${roomId}/members`);
                setMembers(response.data);
                console.log('Members: '.members);
            } catch (error) {
                console.error('멤버 조회 실패:', error);
            }
        };

        if (roomId) {
            fetchMembers();
        }
    }, [roomId]);

    return (
        <div className="border-l w-64 p-4">
            <h3 className="font-bold mb-4">채팅방 멤버</h3>
            <ul>
                {members.map(member => (
                    <li
                        key={member.id}
                        className="py-2 flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500"/>
                        {member.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatRoomMembers;