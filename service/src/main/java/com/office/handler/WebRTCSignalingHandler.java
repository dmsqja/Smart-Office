package com.office.handler;

import com.office.app.dto.SignalMessage;
import com.office.app.service.MeetingRoomService;
import com.office.exception.*;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebRTCSignalingHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final MeetingRoomService meetingRoomService;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, RoomSession> roomSessions = new ConcurrentHashMap<>();

    public WebRTCSignalingHandler(ObjectMapper objectMapper, MeetingRoomService meetingRoomService) {
        this.objectMapper = objectMapper;
        this.meetingRoomService = meetingRoomService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("New WebSocket connection established: {}", session.getId());
        sessions.put(session.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            SignalMessage signalMessage = objectMapper.readValue(message.getPayload(), SignalMessage.class);
            String roomId = signalMessage.getRoomId();
            String userId = extractUserId(session);

            log.info("Received {} message from user {} in room {}", 
                signalMessage.getType(), userId, roomId);

            switch (signalMessage.getType()) {
                case "join":
                    handleJoinMessage(session, roomId, userId);
                    break;
                case "offer":
                    handleOfferMessage(session, message, roomId, userId);
                    break;
                case "answer":
                    handleAnswerMessage(session, message, roomId, userId);
                    break;
                case "ice-candidate":
                    handleIceCandidateMessage(session, message, roomId, userId);
                    break;
                default:
                    log.warn("Unknown message type: {}", signalMessage.getType());
            }
        } catch (Exception e) {
            log.error("Error handling message: ", e);
            handleError(session, e);
        }
    }

    private void handleJoinMessage(WebSocketSession session, String roomId, String userId) {
        try {
            // 방 존재 여부 확인
            meetingRoomService.getRoomDetails(roomId);
            
            // 세션 정보 저장
            RoomSession roomSession = roomSessions.computeIfAbsent(roomId, 
                k -> new RoomSession());
            roomSession.addParticipant(userId, session);

            // 다른 참가자들에게 새 참가자 알림
            notifyParticipants(roomId, session, createParticipantMessage(userId, "joined"));
            
            // 현재 참가자 목록 전송
            sendParticipantsList(roomId, session);

        } catch (RoomNotFoundException e) {
            handleError(session, e);
        }
    }

    private void handleOfferMessage(WebSocketSession session, TextMessage message, 
            String roomId, String userId) {
        validateParticipant(roomId, userId);
        broadcastToRoom(session, message, roomId);
    }

    private void handleAnswerMessage(WebSocketSession session, TextMessage message, 
            String roomId, String userId) {
        validateParticipant(roomId, userId);
        broadcastToRoom(session, message, roomId);
    }

    private void handleIceCandidateMessage(WebSocketSession session, TextMessage message, 
            String roomId, String userId) {
        validateParticipant(roomId, userId);
        broadcastToRoom(session, message, roomId);
    }

    private void broadcastToRoom(WebSocketSession sender, TextMessage message, String roomId) {
        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession != null) {
            roomSession.getParticipants().forEach((participantId, session) -> {
                if (!session.getId().equals(sender.getId())) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        log.error("Error broadcasting message to {}: {}", 
                            participantId, e.getMessage());
                    }
                }
            });
        }
    }

    private String extractUserId(WebSocketSession session) {
        // X-User-Id 헤더에서 사용자 ID 추출
        Map<String, Object> attributes = session.getAttributes();
        String userId = (String) attributes.get("X-User-Id");
        if (userId == null) {
            throw new UnauthorizedAccessException("User ID not found in session");
        }
        return userId;
    }

    private void validateParticipant(String roomId, String userId) {
        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession == null || !roomSession.hasParticipant(userId)) {
            throw new UnauthorizedAccessException("User is not a participant of this room");
        }
    }

    private void notifyParticipants(String roomId, WebSocketSession sender, 
            SignalMessage message) {
        String jsonMessage = null;
        try {
            jsonMessage = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.error("Error serializing message", e);
            return;
        }

        TextMessage textMessage = new TextMessage(jsonMessage);
        broadcastToRoom(sender, textMessage, roomId);
    }

    private SignalMessage createParticipantMessage(String userId, String action) {
        SignalMessage message = new SignalMessage();
        message.setType("participant");
        message.setData(Map.of(
            "userId", userId,
            "action", action
        ));
        return message;
    }

    private void sendParticipantsList(String roomId, WebSocketSession session) {
        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession != null) {
            SignalMessage message = new SignalMessage();
            message.setType("participants-list");
            message.setData(Map.of(
                "participants", roomSession.getParticipantIds()
            ));
            
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(jsonMessage));
            } catch (Exception e) {
                log.error("Error sending participants list", e);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = extractUserId(session);
        sessions.remove(session.getId());

        // 모든 방에서 해당 사용자 제거
        roomSessions.forEach((roomId, roomSession) -> {
            if (roomSession.removeParticipant(userId)) {
                // 다른 참가자들에게 퇴장 알림
                notifyParticipants(roomId, session, createParticipantMessage(userId, "left"));
                
                // 방이 비어있으면 방 세션 제거
                if (roomSession.isEmpty()) {
                    roomSessions.remove(roomId);
                }
            }
        });

        log.info("WebSocket connection closed for user {}: {}", userId, status);
    }

    private void handleError(WebSocketSession session, Exception e) {
        try {
            SignalMessage errorMessage = new SignalMessage();
            errorMessage.setType("error");
            errorMessage.setData(Map.of("message", e.getMessage()));
            
            String jsonMessage = objectMapper.writeValueAsString(errorMessage);
            session.sendMessage(new TextMessage(jsonMessage));
        } catch (Exception sendError) {
            log.error("Error sending error message", sendError);
        }
    }

    // 내부 클래스: 방 세션 관리
    private static class RoomSession {
        private final Map<String, WebSocketSession> participants = new ConcurrentHashMap<>();

        public void addParticipant(String userId, WebSocketSession session) {
            participants.put(userId, session);
        }

        public boolean removeParticipant(String userId) {
            return participants.remove(userId) != null;
        }

        public boolean hasParticipant(String userId) {
            return participants.containsKey(userId);
        }

        public Map<String, WebSocketSession> getParticipants() {
            return participants;
        }

        public Set<String> getParticipantIds() {
            return new HashSet<>(participants.keySet());
        }

        public boolean isEmpty() {
            return participants.isEmpty();
        }
    }
}