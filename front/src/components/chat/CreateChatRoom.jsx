// components/chat/CreateChatRoom.jsx
import React, { useState } from 'react';
import axios from 'axios';
import UserSearch from "./UserSearch";
import { useChat } from './ChatContext';

const CreateChatRoom = () => {
    const { fetchRooms, enterRoom } = useChat();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showGroupCreate, setShowGroupCreate] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/chat/rooms/group', {
                roomName: groupName,
                members: selectedUsers.map(user => user.employeeId)
            });

            await fetchRooms(); // 채팅방 목록 갱신
            await enterRoom(response.data.id); // 생성된 채팅방으로 바로 입장
            setIsOpen(false);
        } catch (error) {
            console.error('그룹 채팅방 생성 실패:', error);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUsers(prev => {
            // 이미 선택된 사용자인지 확인
            if (prev.some(u => u.employeeId === user.employeeId)) {
                return prev;
            }
            return [...prev, user];
        });
    };

    const handleRemoveUser = (employeeId) => {
        setSelectedUsers(prev => prev.filter(user => user.employeeId !== employeeId));
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-primary text-white py-2 rounded-lg"
            >
                새 채팅
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-96">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">
                                {showGroupCreate ? "그룹 채팅방 만들기" :
                                    showUserSearch ? "대화상대 선택" : "새 채팅"}
                            </h2>
                            <button
                                onClick={() => {
                                    if (showGroupCreate) {
                                        setShowGroupCreate(false);
                                    } else if (showUserSearch) {
                                        setShowUserSearch(false);
                                    } else {
                                        setIsOpen(false);
                                    }
                                }}
                                className="text-gray-500"
                            >
                                뒤로
                            </button>
                        </div>

                        {showGroupCreate ? (
                            <div className="p-4">
                                <form onSubmit={handleGroupSubmit}>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="채팅방 이름"
                                        className="w-full p-2 border rounded mb-4"
                                        required
                                    />

                                    <div className="mb-4">
                                        <h3 className="font-semibold mb-2">선택된 멤버</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUsers.map(user => (
                                                <div
                                                    key={user.employeeId}
                                                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                                                >
                                                    <span>{user.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveUser(user.employeeId)}
                                                        className="text-gray-500 hover:text-red-500"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <UserSearch
                                        onSelect={handleUserSelect}
                                        selectedUsers={selectedUsers}
                                        embedded={true}
                                    />

                                    <button
                                        type="submit"
                                        disabled={selectedUsers.length < 2 || !groupName}
                                        className="w-full bg-primary text-white py-2 rounded-lg mt-4 disabled:bg-gray-300"
                                    >
                                        그룹 채팅방 만들기
                                    </button>
                                </form>
                            </div>
                        ) : showUserSearch ? (
                            <UserSearch onClose={() => setIsOpen(false)} standalone={true} />
                        ) : (
                            <div className="p-4">
                                <button
                                    onClick={() => setShowUserSearch(true)}
                                    className="w-full bg-primary text-white py-2 rounded-lg mb-2"
                                >
                                    1:1 채팅
                                </button>
                                <button
                                    onClick={() => setShowGroupCreate(true)}
                                    className="w-full bg-secondary text-white py-2 rounded-lg"
                                >
                                    그룹 채팅
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
export default CreateChatRoom;