package com.office.app.dto;

import com.office.app.domain.MessageType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingChatMessageRequest {
    private String roomId;
    private String content;
    private MessageType type;

    @Builder
    public MeetingChatMessageRequest(String roomId, String content, MessageType type) {
        this.roomId = roomId;
        this.content = content;
        this.type = type;
    }
}