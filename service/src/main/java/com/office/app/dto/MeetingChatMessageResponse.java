package com.office.app.dto;

import com.office.app.domain.MessageType;
import com.office.app.entity.MeetingChatMessage;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingChatMessageResponse {
    private Long id;
    private String roomId;
    private String senderId;
    private String senderName;
    private String content;
    private MessageType type;
    private LocalDateTime createdAt;

    @Builder
    public MeetingChatMessageResponse(Long id, String roomId, String senderId, 
            String senderName, String content, MessageType type, LocalDateTime createdAt) {
        this.id = id;
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.type = type;
        this.createdAt = createdAt;
    }

    public static MeetingChatMessageResponse from(MeetingChatMessage entity) {
        return MeetingChatMessageResponse.builder()
                .id(entity.getId())
                .roomId(entity.getRoomId())
                .senderId(entity.getSenderId())
                .senderName(entity.getSenderName())
                .content(entity.getContent())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}