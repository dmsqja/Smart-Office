package com.office.app.dto;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;
    private String targetSessionId;  // 받는 사람 ID
    private String senderId;         // 보내는 사람 ID (추가)
    private Object data;
    private String roomId;
}