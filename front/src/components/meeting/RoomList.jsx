// components/meeting/RoomList.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Box,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    Lock as LockIcon,
    Add as AddIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { api } from '../../utils/api';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [newRoom, setNewRoom] = useState({
        roomName: '',
        maxParticipants: 2,
        password: ''
    });
    const [joinPassword, setJoinPassword] = useState('');

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await api.getRooms();
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        try {
            await api.createRoom(newRoom);
            setCreateDialogOpen(false);
            setNewRoom({ roomName: '', maxParticipants: 2, password: '' });
            fetchRooms();
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const handleJoinRoom = async (room) => {
        try {
            const response = await api.joinRoom(room.roomId, {
                roomId: room.roomId,
                password: room.hasPassword ? joinPassword : undefined
            });

            if (response.success) {
                window.location.href = `/meeting/${room.roomId}`;
            }
        } catch (error) {
            console.error('Error joining room:', error);
        } finally {
            setPasswordDialogOpen(false);
            setJoinPassword('');
            setSelectedRoom(null);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="content-wrapper">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="content-wrapper">
                <Box className="content-header" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" className="text-gradient">
                        Meeting Rooms
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Room
                    </Button>
                </Box>

                <Box className="content-body">
                    <Grid container spacing={3}>
                        {rooms.map((room) => (
                            <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                                <Card>
                                    <CardHeader
                                        title={room.roomName}
                                        action={
                                            room.hasPassword && (
                                                <IconButton size="small">
                                                    <LockIcon />
                                                </IconButton>
                                            )
                                        }
                                    />
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <PeopleIcon sx={{ mr: 1 }} />
                                            <Typography color="text.secondary">
                                                {room.currentParticipants}/{room.maxParticipants} participants
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => {
                                                if (room.hasPassword) {
                                                    setSelectedRoom(room);
                                                    setPasswordDialogOpen(true);
                                                } else {
                                                    handleJoinRoom(room);
                                                }
                                            }}
                                            disabled={room.currentParticipants >= room.maxParticipants}
                                        >
                                            Join Room
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Create Room Dialog */}
                    <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
                        <DialogTitle>Create New Room</DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Room Name"
                                fullWidth
                                value={newRoom.roomName}
                                onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
                            />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Max Participants</InputLabel>
                                <Select
                                    value={newRoom.maxParticipants}
                                    label="Max Participants"
                                    onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: Number(e.target.value) })}
                                >
                                    {[2, 3, 4, 5, 6].map((num) => (
                                        <MenuItem key={num} value={num}>{num}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                margin="dense"
                                label="Password (Optional)"
                                type="password"
                                fullWidth
                                value={newRoom.password}
                                onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateRoom} variant="contained">Create</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Password Dialog */}
                    <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
                        <DialogTitle>Enter Room Password</DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Password"
                                type="password"
                                fullWidth
                                value={joinPassword}
                                onChange={(e) => setJoinPassword(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => selectedRoom && handleJoinRoom(selectedRoom)}
                                variant="contained"
                            >
                                Join
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </div>
        </div>
    );
};

export default RoomList;