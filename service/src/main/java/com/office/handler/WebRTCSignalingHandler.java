package com.office.handler;

import com.office.app.domain.MessageType;
import com.office.app.dto.MeetingChatMessageResponse;
import com.office.app.dto.SignalMessage;
import com.office.app.entity.MeetingChatMessage;
import com.office.app.service.MeetingChatService;
import com.office.app.service.MeetingRoomService;
import com.office.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class WebRTCSignalingHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final MeetingRoomService meetingRoomService;
    private final MeetingChatService meetingChatService;  // 추가
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, RoomSession> roomSessions = new ConcurrentHashMap<>();


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
                case "chat":
                    handleChatMessage(session, signalMessage, roomId, userId);
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

    private void handleChatMessage(WebSocketSession session, SignalMessage signalMessage,
                                   String roomId, String userId) {
        try {
            log.debug("Received chat message: {}", signalMessage);  // 디버깅용 로그 추가

            if (signalMessage.getData() == null) {
                log.error("Message data is null");
                return;
            }

            // Object를 Map으로 변환
            Map<String, Object> messageData;
            if (signalMessage.getData() instanceof Map) {
                messageData = (Map<String, Object>) signalMessage.getData();
            } else {
                messageData = objectMapper.convertValue(signalMessage.getData(), Map.class);
            }

            // null 체크 추가
            if (messageData == null || !messageData.containsKey("content")) {
                log.error("Invalid message format");
                return;
            }

            // 메시지 생성 및 저장
            MeetingChatMessage chatMessage = MeetingChatMessage.builder()
                    .roomId(roomId)
                    .senderId(userId)
                    .senderName(messageData.get("senderName") != null ?
                            messageData.get("senderName").toString() : "Anonymous")
                    .content((String) messageData.get("content"))
                    .type(MessageType.valueOf(messageData.getOrDefault("type", "TEXT").toString()))
                    .build();

            MeetingChatMessage savedMessage = meetingChatService.saveMessage(chatMessage);

            // 응답 메시지 생성
            SignalMessage responseMessage = new SignalMessage();
            responseMessage.setType("chat");
            responseMessage.setRoomId(roomId);
            // data 객체 구조 수정
            Map<String, Object> chatData = new HashMap<>();
            chatData.put("messageId", savedMessage.getId());
            chatData.put("senderId", savedMessage.getSenderId());
            chatData.put("senderName", savedMessage.getSenderName());
            chatData.put("content", savedMessage.getContent());
            chatData.put("type", savedMessage.getType().toString());
            chatData.put("createdAt", savedMessage.getCreatedAt().toString());
            responseMessage.setData(chatData);

            log.debug("Broadcasting response message: {}", responseMessage);  // 로그 추가
            String jsonMessage = objectMapper.writeValueAsString(responseMessage);
            broadcastToRoom(session, new TextMessage(jsonMessage), roomId);

        } catch (Exception e) {
            log.error("Error processing chat message", e);
        }
    }

    private void handleJoinMessage(WebSocketSession session, String roomId, String userId) {
        try {
            log.debug("User {} joining room {}", userId, roomId);

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
            MeetingChatMessage joinMessage = MeetingChatMessage.builder()
                    .roomId(roomId)
                    .senderId(userId)
                    .senderName("SYSTEM")
                    .content(userId + "님이 입장하셨습니다.")
                    .type(MessageType.JOIN)
                    .build();

            meetingChatService.saveMessage(joinMessage);

            // 최근 메시지 전송
            sendRecentMessages(roomId, session);

        } catch (RoomNotFoundException e) {
            handleError(session, e);
        }
    }
    private void sendRecentMessages(String roomId, WebSocketSession session) {
        try {
            List<MeetingChatMessageResponse> recentMessages =
                    meetingChatService.getRecentMessages(roomId);

            SignalMessage message = new SignalMessage();
            message.setType("chat-history");
            message.setRoomId(roomId);
            message.setData(Map.of("messages", recentMessages));

            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
        } catch (Exception e) {
            log.error("Error sending recent messages", e);
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
            log.debug("Broadcasting to room {}, participants count: {}",
                    roomId, roomSession.getParticipants().size());

            roomSession.getParticipants().forEach((participantId, session) -> {
                try {
                    // 메시지 전송 전 로그
                    log.debug("Sending message to participant {}", participantId);
                    session.sendMessage(message);
                    log.debug("Message sent successfully to participant {}", participantId);
                } catch (IOException e) {
                    log.error("Error broadcasting message to {}: {}",
                            participantId, e.getMessage());
                }
            });
        } else {
            log.warn("No room session found for roomId: {}", roomId);
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