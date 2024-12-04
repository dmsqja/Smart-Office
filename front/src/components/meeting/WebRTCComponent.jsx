import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Paper,
  Grid,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CallEnd as CallEndIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { checkWebRTCSupport } from '../../utils/webrtc';
import ChatComponent from './ChatComponent.jsx';
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const WebRTCComponent = ({ roomId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [pendingCandidates, setPendingCandidates] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const websocket = useRef(null);
  const navigate = useNavigate();

  const configuration = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
  };
  const initializeStream = async () => {
    try {
      console.log('Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      console.log('Media stream obtained:', stream.getTracks());
      setLocalStream(stream);

      if (localVideoRef.current) {
        console.log('Setting local video stream');
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(error => {
          console.error('Error playing local video:', error);
        });
      }

      return stream;
    } catch (error) {
      console.error('Failed to get media stream:', error);
      throw error;
    }
  };

  const setupPeerConnectionListeners = () => {
    if (!peerConnection.current) return;

    peerConnection.current.oniceconnectionstatechange = () => {
      const state = peerConnection.current.iceConnectionState;
      console.log('ICE connection state:', state);

      if (state === 'failed' || state === 'disconnected') {
        console.log(`ICE connection ${state} - attempting recovery...`);
        retryConnection();
      } else if (state === 'connected') {
        console.log('ICE connection established');
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current.connectionState;
      console.log('Connection state:', state);
      setIsConnected(state === 'connected');
    };

    peerConnection.current.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      const [remoteStream] = event.streams;

      if (remoteStream) {
        console.log('Setting remote stream');
        setRemoteStream(remoteStream);

        if (remoteVideoRef.current) {
          console.log('Updating remote video element');
          remoteVideoRef.current.srcObject = remoteStream;

          remoteVideoRef.current.onloadedmetadata = () => {
            console.log('Remote video metadata loaded');
            remoteVideoRef.current.play()
                .then(() => console.log('Remote video playing'))
                .catch(err => console.error('Error playing remote video:', err));
          };
        }
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate.type);
        sendSignalingMessage({
          type: 'ice-candidate',
          data: event.candidate,
          roomId
        });
      }
    };

    peerConnection.current.onnegotiationneeded = async () => {
      try {
        if (isCallStarted && peerConnection.current.signalingState === 'stable') {
          await startCall();
        }
      } catch (error) {
        console.error('Error during negotiation:', error);
      }
    };
  };

  const sendSignalingMessage = async (message) => {
    const maxRetries = 3;
    let retryCount = 0;

    const tryToSend = async () => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        console.log('Sending message:', message.type);
        websocket.current.send(JSON.stringify(message));
        return true;
      }

      if (retryCount < maxRetries) {
        console.log(`WebSocket not open, attempt ${retryCount + 1} of ${maxRetries}`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        connectWebSocket();
        return tryToSend();
      }

      console.error('Failed to send message after retries');
      return false;
    };

    return tryToSend();
  };
  const handleOffer = async (offer, senderId) => {
    try {
      if (peerConnection.current) {
        console.log('Setting remote description (offer)');
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

        if (!localStream) {
          const stream = await initializeStream();
          stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
          });
        }

        console.log('Creating answer');
        const answer = await peerConnection.current.createAnswer();

        console.log('Setting local description (answer)');
        await peerConnection.current.setLocalDescription(answer);

        await sendSignalingMessage({
          type: 'answer',
          data: answer,
          roomId,
          targetSessionId: senderId
        });

        // 저장된 ICE candidate 처리
        if (pendingCandidates.length > 0) {
          console.log('Processing pending ICE candidates');
          for (const candidate of pendingCandidates) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
          setPendingCandidates([]);
        }
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      console.log('Processing answer, current state:', peerConnection.current?.signalingState);
      if (peerConnection.current && peerConnection.current.signalingState === "have-local-offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Remote description set, processing pending candidates');

        // 대기 중인 ICE candidate 처리
        if (pendingCandidates.length > 0) {
          for (const candidate of pendingCandidates) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Processed pending ICE candidate');
          }
          setPendingCandidates([]);
        }
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        console.log('Adding ICE candidate');
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.log('Saving ICE candidate for later');
        setPendingCandidates(prev => [...prev, candidate]);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const connectWebSocket = () => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting WebSocket...');
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    websocket.current = new WebSocket(`/ws/signaling?userId=${userInfo?.employeeId}`);

    websocket.current.onopen = () => {
      console.log('WebSocket connected');
      sendSignalingMessage({
        type: 'join',
        roomId,
        data: {
          userId: userInfo?.employeeId,
          name: userInfo?.name
        }
      });
    };

    websocket.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Raw WebSocket message:', message);  // 전체 메시지 로깅

        switch (message.type) {
          case 'offer':
            console.log('[Peer B] Received offer');
            await handleOffer(message.data, message.senderId || message.targetSessionId);
            break;
          case 'answer':
            console.log('[Peer A] Received answer');
            if (peerConnection.current.signalingState === 'have-local-offer') {
              await handleAnswer(message.data);
            }
            break;
          case 'ice-candidate':
            console.log('Received ICE candidate');
            if (peerConnection.current.remoteDescription) {
              await handleIceCandidate(message.data);
            } else {
              console.log('Queuing ICE candidate (no remote description yet)');
              setPendingCandidates(prev => [...prev, message.data]);
            }
            break;
          case 'chat':
            handleChatMessage(message);
            break;
          case 'participant':
            console.log('Participant update:', message.data);
            handleParticipantUpdate(message.data);
            break;
          case 'participants-list':
            console.log('Participants list:', message.data);
            handleParticipantsList(message.data);
            break;
          case 'chat-history':
            console.log('Chat history:', message.data);
            if (message.data.messages) {
              setChatMessages(message.data.messages);
            }
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    websocket.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      if (event.code !== 1000 && event.code !== 1001) {
        console.log('Attempting reconnect in 3 seconds...');
        setTimeout(connectWebSocket, 3000);
      }
    };

    websocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };
  const handleParticipantUpdate = (data) => {
    const { userId, action, name } = data;

    if (action === 'joined') {
      setParticipants(prev => {
        if (prev.some(p => p.userId === userId)) {
          return prev;
        }
        return [...prev, { userId, name: name || '사용자' }];
      });
    } else if (action === 'left') {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    }
  };

  const handleParticipantsList = (data) => {
    if (data.participants) {
      setParticipants(data.participants);
    }
  };

  const handleChatMessage = (message) => {
    if (!isChatOpen && message.data) {
      // 메시지가 시스템 메시지가 아니고, 내가 보낸 메시지가 아닐 때만 카운트
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const isSystemMessage = message.data.type === 'JOIN' || message.data.type === 'LEAVE';
      const isMyMessage = message.data.senderId === userInfo?.employeeId;

      if (!isSystemMessage && !isMyMessage) {
        setUnreadMessages(prev => prev + 1);
      }
    }

    if (message.data) {
      setChatMessages(prev => [...prev, message.data]);
    }
  };

  const startCall = async () => {
    try {
      if (peerConnection.current && !isCallStarted) {
        if (peerConnection.current.signalingState !== 'stable') {
          console.log('Existing connection in progress, cancelling');
          return;
        }

        console.log('Creating offer');
        const offer = await peerConnection.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          iceRestart: true
        });

        console.log('Setting local description');
        await peerConnection.current.setLocalDescription(offer);

        await sendSignalingMessage({
          type: 'offer',
          data: offer,
          roomId
        });

        setIsCallStarted(true);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setIsCallStarted(false);
    }
  };

  const endCall = () => {
    try {
      cleanup(true);
      setIsCallStarted(false);
      setIsConnected(false);
      setRemoteStream(null);
      setLocalStream(null);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const retryConnection = async () => {
    try {
      if (!isCallStarted) return;

      console.log('Retrying connection...');
      const pc = peerConnection.current;

      if (pc && pc.iceConnectionState !== 'closed') {
        try {
          await pc.restartIce();
          console.log('ICE restart initiated');
        } catch (error) {
          console.error('Error restarting ICE:', error);
          await setupNewPeerConnection();
          await startCall();
        }
      } else {
        await setupNewPeerConnection();
        await startCall();
      }
    } catch (error) {
      console.error('Error retrying connection:', error);
    }
  };

  const setupNewPeerConnection = async () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    console.log('Setting up new peer connection');
    peerConnection.current = new RTCPeerConnection(configuration);
    setupPeerConnectionListeners();

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });
    }

    return peerConnection.current;
  };

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Checking WebRTC support...');
        const support = checkWebRTCSupport();

        if (!support.webRTC || !support.getUserMedia) {
          throw new Error('Your browser does not support required WebRTC features');
        }

        connectWebSocket();

        // DOM이 준비되도록 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 100));

        const stream = await initializeStream();
        const pc = await setupNewPeerConnection();

        if (stream && pc) {
          stream.getTracks().forEach(track => {
            console.log('Adding track to peer connection:', track.kind);
            pc.addTrack(track, stream);
          });
        }

      } catch (error) {
        console.error('Error initializing WebRTC:', error);
        setInitError(error.message);
      }
    };

    init();
    return () => cleanup(true);
  }, [roomId]);

  const cleanup = (leaveRoom = true) => {
    try {
      console.log('Cleaning up...');
      if (localStream) {
        localStream.getTracks().forEach(track => {
          try {
            console.log('Stopping track:', track.kind);
            track.stop();
          } catch (error) {
            console.error('Error stopping track:', error);
          }
        });
      }
      if (peerConnection.current) {
        try {
          console.log('Closing peer connection');
          peerConnection.current.close();
        } catch (error) {
          console.error('Error closing peer connection:', error);
        }
      }
      if (websocket.current) {
        try {
          console.log('Closing WebSocket');
          websocket.current.close(1000, 'Intentional closure');
        } catch (error) {
          console.error('Error closing WebSocket:', error);
        }
      }
      setUnreadMessages(0);
      setPendingCandidates([]);
      if (leaveRoom) {
        api.leaveRoom(roomId).catch(error => {
          console.error('Error leaving room:', error);
        });
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  };
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        console.log(`Audio track ${track.id} enabled: ${track.enabled}`);
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        console.log(`Video track ${track.id} enabled: ${track.enabled}`);
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessages(0);
    }
  };

  if (initError) {
    return (
        <Paper sx={{ p: 3, m: 2 }} elevation={3}>
          <Typography variant="h5" color="error" gutterBottom>
            WebRTC Error
          </Typography>
          <Typography paragraph>{initError}</Typography>
          <Typography variant="subtitle1">
            Please use a modern browser with camera and microphone support.
          </Typography>
        </Paper>
    );
  }

  return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5">Video Conference</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Room: {roomId}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Participants">
              <IconButton onClick={() => setShowParticipants(true)}>
                <Badge badgeContent={participants.length} color="primary">
                  <PeopleIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
              <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
              />
              <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '2px 8px',
                    borderRadius: 1,
                  }}
              >
                You
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
              <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
              />
              <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '2px 8px',
                    borderRadius: 1,
                  }}
              >
                Remote User
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: 3,
              pb: 2,
            }}
        >
          <IconButton
              onClick={toggleMute}
              color={isMuted ? 'error' : 'primary'}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          <IconButton
              onClick={toggleVideo}
              color={isVideoOff ? 'error' : 'primary'}
          >
            {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
          <IconButton
              onClick={isCallStarted ? endCall : startCall}
              color="error"
          >
            <CallEndIcon />
          </IconButton>
          <IconButton
              color="primary"
              onClick={handleChatToggle}
              sx={{ position: 'relative' }}
          >
            <MessageIcon />
            {unreadMessages > 0 && (
                <Badge
                    badgeContent={unreadMessages}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                    }}
                />
            )}
          </IconButton>
        </Box>

        <Dialog
            open={showParticipants}
            onClose={() => setShowParticipants(false)}
            maxWidth="xs"
            fullWidth
        >
          <DialogTitle>
            참가자 목록
            <IconButton
                onClick={() => setShowParticipants(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <List>
              {participants.map(participant => (
                  <ListItem key={participant.userId}>
                    <ListItemAvatar>
                      <Avatar>{participant.name ? participant.name[0] : 'U'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={participant.name || '사용자'}
                        secondary={participant.userId === JSON.parse(sessionStorage.getItem('userInfo'))?.employeeId ? '(나)' : ''}
                    />
                  </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        <ChatComponent
            roomId={roomId}
            websocket={websocket}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages}
        />

        <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 2,
            }}
        >
          <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: isConnected ? 'success.main' : 'warning.main',
              }}
          />
          <Typography variant="body2" color="text.secondary">
            {isConnected ? 'Connected' : 'Connecting...'}
          </Typography>
        </Box>
      </Container>
  );
};

WebRTCComponent.propTypes = {
  roomId: PropTypes.string.isRequired
};

export default WebRTCComponent;