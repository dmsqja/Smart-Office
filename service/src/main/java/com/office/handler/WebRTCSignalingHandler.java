package com.office.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class WebRTCSignalingHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final MeetingRoomService meetingRoomService;
    private final MeetingChatService meetingChatService;
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
            String userName = extractUserName(session);

            log.info("Received {} message from user {} ({}) in room {}",
                    signalMessage.getType(), userId, userName, roomId);

            switch (signalMessage.getType()) {
                case "join":
                    handleJoinMessage(session, roomId, userId, userName);
                    break;
                case "chat":
                    handleChatMessage(session, signalMessage, roomId, userId);
                    break;
                case "offer":
                    handleOfferMessage(session, message, roomId, userId, signalMessage);
                    break;
                case "answer":
                    handleAnswerMessage(session, message, roomId, userId, signalMessage);
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
            log.debug("Received chat message: {}", signalMessage);

            if (signalMessage.getData() == null) {
                log.error("Message data is null");
                return;
            }

            Map<String, Object> messageData;
            if (signalMessage.getData() instanceof Map) {
                messageData = (Map<String, Object>) signalMessage.getData();
            } else {
                messageData = objectMapper.convertValue(signalMessage.getData(), Map.class);
            }

            if (messageData == null || !messageData.containsKey("content")) {
                log.error("Invalid message format");
                return;
            }

            MeetingChatMessage chatMessage = MeetingChatMessage.builder()
                    .roomId(roomId)
                    .senderId(userId)
                    .senderName(messageData.get("senderName") != null ?
                            messageData.get("senderName").toString() : "Anonymous")
                    .content((String) messageData.get("content"))
                    .type(MessageType.valueOf(messageData.getOrDefault("type", "TEXT").toString()))
                    .build();

            MeetingChatMessage savedMessage = meetingChatService.saveMessage(chatMessage);

            SignalMessage responseMessage = new SignalMessage();
            responseMessage.setType("chat");
            responseMessage.setRoomId(roomId);
            Map<String, Object> chatData = new HashMap<>();
            chatData.put("messageId", savedMessage.getId());
            chatData.put("senderId", savedMessage.getSenderId());
            chatData.put("senderName", savedMessage.getSenderName());
            chatData.put("content", savedMessage.getContent());
            chatData.put("type", savedMessage.getType().toString());
            chatData.put("createdAt", savedMessage.getCreatedAt().toString());
            responseMessage.setData(chatData);

            String jsonMessage = objectMapper.writeValueAsString(responseMessage);
            broadcastToRoom(session, new TextMessage(jsonMessage), roomId);

        } catch (Exception e) {
            log.error("Error processing chat message", e);
        }
    }

    private void handleJoinMessage(WebSocketSession session, String roomId, String userId, String userName) {
        try {
            log.debug("User {} ({}) joining room {}", userId, userName, roomId);

            meetingRoomService.getRoomDetails(roomId);

            RoomSession roomSession = roomSessions.computeIfAbsent(roomId, k -> new RoomSession());
            roomSession.addParticipant(userId, session, userName);

            SignalMessage participantMessage = new SignalMessage();
            participantMessage.setType("participant");
            participantMessage.setData(Map.of(
                    "userId", userId,
                    "name", userName,
                    "action", "joined"
            ));
            notifyParticipants(roomId, session, participantMessage);

            sendParticipantsList(roomId, session);

            // 입장 메시지 생성 및 저장
            MeetingChatMessage joinMessage = MeetingChatMessage.builder()
                    .roomId(roomId)
                    .senderId("SYSTEM")
                    .senderName("SYSTEM")
                    .content(userName + "님이 입장하셨습니다.")
                    .type(MessageType.JOIN)
                    .build();

            MeetingChatMessage savedMessage = meetingChatService.saveMessage(joinMessage);

            // 입장 메시지를 채팅 메시지 형태로 변환하여 브로드캐스트
            SignalMessage chatMessage = new SignalMessage();
            chatMessage.setType("chat");
            chatMessage.setRoomId(roomId);
            Map<String, Object> chatData = new HashMap<>();
            chatData.put("messageId", savedMessage.getId());
            chatData.put("senderId", savedMessage.getSenderId());
            chatData.put("senderName", savedMessage.getSenderName());
            chatData.put("content", savedMessage.getContent());
            chatData.put("type", savedMessage.getType().toString());
            chatData.put("createdAt", savedMessage.getCreatedAt().toString());
            chatMessage.setData(chatData);

            String jsonMessage = objectMapper.writeValueAsString(chatMessage);
            broadcastToRoom(session, new TextMessage(jsonMessage), roomId);

            // 새로 입장한 사용자에게 이전 메시지 이력 전송
            sendRecentMessages(roomId, session);

        } catch (RoomNotFoundException e) {
            handleError(session, e);
        } catch (JsonProcessingException e) {
            log.error("Error processing join message", e);
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
                                    String roomId, String userId, SignalMessage signalMessage) throws JsonProcessingException {
        validateParticipant(roomId, userId);

        // 원본 메시지를 수정하여 senderId 추가
        SignalMessage modifiedMessage = objectMapper.copy().readValue(message.getPayload(), SignalMessage.class);
        modifiedMessage.setSenderId(userId);

        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession != null) {
            roomSession.getParticipants().forEach((participantId, participantSession) -> {
                if (!participantId.equals(userId)) {
                    try {
                        log.debug("Sending offer from {} to {} in room {}",
                                userId, participantId, roomId);
                        // 수정된 메시지 전송
                        String jsonMessage = objectMapper.writeValueAsString(modifiedMessage);
                        participantSession.sendMessage(new TextMessage(jsonMessage));
                        log.debug("Offer sent successfully");
                    } catch (IOException e) {
                        log.error("Error sending offer to {}: {}", participantId, e.getMessage());
                    }
                }
            });
        }
    }

    private void handleAnswerMessage(WebSocketSession session, TextMessage message,
                                     String roomId, String userId, SignalMessage signalMessage) throws JsonProcessingException {
        validateParticipant(roomId, userId);

        // 원본 메시지를 수정하여 senderId 추가
        SignalMessage modifiedMessage = objectMapper.copy().readValue(message.getPayload(), SignalMessage.class);
        modifiedMessage.setSenderId(userId);

        String targetUserId = signalMessage.getTargetSessionId();
        if (targetUserId != null) {
            RoomSession roomSession = roomSessions.get(roomId);
            WebSocketSession targetSession = roomSession.getParticipants().get(targetUserId);
            if (targetSession != null) {
                try {
                    String jsonMessage = objectMapper.writeValueAsString(modifiedMessage);
                    targetSession.sendMessage(new TextMessage(jsonMessage));
                    log.debug("Answer sent from {} to {}", userId, targetUserId);
                } catch (IOException e) {
                    log.error("Error sending answer to {}: {}", targetUserId, e.getMessage());
                }
            }
        }
    }

    private void handleIceCandidateMessage(WebSocketSession session, TextMessage message,
                                           String roomId, String userId) throws JsonProcessingException {
        validateParticipant(roomId, userId);

        // 원본 메시지를 수정하여 senderId 추가
        SignalMessage modifiedMessage = objectMapper.copy().readValue(message.getPayload(), SignalMessage.class);
        modifiedMessage.setSenderId(userId);

        String jsonMessage = objectMapper.writeValueAsString(modifiedMessage);
        broadcastToRoom(session, new TextMessage(jsonMessage), roomId);
    }

    private void broadcastToRoom(WebSocketSession sender, TextMessage message, String roomId) {
        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession != null) {
            log.debug("Broadcasting to room {}, participants count: {}",
                    roomId, roomSession.getParticipants().size());

            roomSession.getParticipants().forEach((participantId, session) -> {
                try {
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
        Map<String, Object> attributes = session.getAttributes();
        String userId = (String) attributes.get("X-User-Id");
        if (userId == null) {
            throw new UnauthorizedAccessException("User ID not found in session");
        }
        return userId;
    }

    private String extractUserName(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        return (String) attributes.getOrDefault("X-User-Name", "Unknown User");
    }

    private void validateParticipant(String roomId, String userId) {
        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession == null || !roomSession.hasParticipant(userId)) {
            throw new UnauthorizedAccessException("User is not a participant of this room");
        }
    }

    private void notifyParticipants(String roomId, WebSocketSession sender, SignalMessage message) {
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

    private void sendParticipantsList(String roomId, WebSocketSession session) {
        RoomSession roomSession = roomSessions.get(roomId);
        if (roomSession != null) {
            SignalMessage message = new SignalMessage();
            message.setType("participants-list");
            message.setData(Map.of(
                    "participants", roomSession.getParticipantsInfo()
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

        roomSessions.forEach((roomId, roomSession) -> {
            if (roomSession.removeParticipant(userId)) {
                String userName = roomSession.getParticipantName(userId);
                SignalMessage participantMessage = new SignalMessage();
                participantMessage.setType("participant");
                participantMessage.setData(Map.of(
                        "userId", userId,
                        "name", userName,
                        "action", "left"
                ));
                notifyParticipants(roomId, session, participantMessage);

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

    private static class RoomSession {
        private final Map<String, WebSocketSession> participants = new ConcurrentHashMap<>();
        private final Map<String, String> participantNames = new ConcurrentHashMap<>();

        public void addParticipant(String userId, WebSocketSession session, String name) {
            participants.put(userId, session);
            participantNames.put(userId, name);
        }

        public boolean removeParticipant(String userId) {
            participantNames.remove(userId);
            return participants.remove(userId) != null;
        }

        public String getParticipantName(String userId) {
            return participantNames.getOrDefault(userId, "Unknown User");
        }

        public Map<String, WebSocketSession> getParticipants() {
            return participants;
        }

        public List<Map<String, String>> getParticipantsInfo() {
            return participants.keySet().stream()
                    .map(userId -> Map.of(
                            "userId", userId,
                            "name", participantNames.getOrDefault(userId, "Unknown User")
                    ))
                    .collect(Collectors.toList());
        }

        public boolean hasParticipant(String userId) {
            return participants.containsKey(userId);
        }

        public boolean isEmpty() {
            return participants.isEmpty();
        }
    }
}