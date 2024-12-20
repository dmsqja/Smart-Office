// components/chat/UserSearch.jsx
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useChat } from './ChatContext';

const UserSearch = ({ onClose, onSelect, selectedUsers = [], embedded = false, standalone = false }) => {
    const [keyword, setKeyword] = useState('');
    const [users, setUsers] = useState([]);
    const { createIndividualChat } = useChat();

    const handleSearch = async () => {
        if (!keyword.trim()) return;

        try {
            const response = await axios.get('/api/users/search', {
                params: { keyword }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    const handleUserSelect = async (user) => {
        if (embedded) {
            onSelect(user);
        } else if (standalone) {
            try {
                await createIndividualChat(user.employeeId);
                onClose();
            } catch (error) {
                console.error('Failed to create chat:', error);
            }
        }
    };

    const isUserSelected = (user) => {
        return selectedUsers.some(selectedUser => selectedUser.employeeId === user.employeeId);
    };

    useEffect(() => {
        if (keyword.length >= 2) {
            handleSearch();
        }
    }, [keyword]);

    return (
        <div className="p-4">
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="이름 또는 부서로 검색..."
                className="w-full p-2 border rounded mb-4"
            />
            <div className="max-h-96 overflow-y-auto">
                {users.map(user => (
                    <div
                        key={user.employeeId}
                        onClick={() => !isUserSelected(user) && handleUserSelect(user)}
                        className={`p-3 ${isUserSelected(user) ? 'bg-gray-100' : 'hover:bg-gray-50'} 
                           cursor-pointer rounded-lg mb-2 flex justify-between items-center`}
                    >
                        <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-500">
                                {user.department} · {user.position}
                            </div>
                        </div>
                        {isUserSelected(user) && (
                            <div className="text-primary">선택됨</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default UserSearch;