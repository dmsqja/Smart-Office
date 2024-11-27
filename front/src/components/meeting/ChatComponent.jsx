import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Paper,
    Box,
    TextField,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Drawer,
} from '@mui/material';
import {
    Send as SendIcon,
    Close as CloseIcon
} from '@mui/icons-material';

const ChatComponent = ({ roomId, websocket, isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (websocket.current) {
            const handleMessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'chat') {
                    setMessages(prev => [...prev, data.message]);
                }
            };

            websocket.current.addEventListener('message', handleMessage);

            return () => {
                websocket.current?.removeEventListener('message', handleMessage);
            };
        }
    }, [websocket]);

    const handleSendMessage = () => {
        if (newMessage.trim() && websocket.current) {
            const messageData = {
                type: 'chat',
                roomId,
                message: {
                    text: newMessage,
                    sender: localStorage.getItem('userId') || 'Anonymous',
                    timestamp: new Date().toISOString()
                }
            };

            websocket.current.send(JSON.stringify(messageData));
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={onClose}
            variant="persistent"
            sx={{
                width: 320,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 320,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Chat</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {messages.map((message, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                mb: 1
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1,
                                    bgcolor: 'background.paper',
                                    maxWidth: '80%',
                                    wordBreak: 'break-word'
                                }}
                            >
                                <Typography variant="body2">{message.text}</Typography>
                            </Paper>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>

                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                    <SendIcon />
                                </IconButton>
                            )
                        }}
                    />
                </Box>
            </Box>
        </Drawer>
    );
};

ChatComponent.propTypes = {
    roomId: PropTypes.string.isRequired,
    websocket: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ChatComponent;