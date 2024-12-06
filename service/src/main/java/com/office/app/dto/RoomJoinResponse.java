package com.office.app.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class RoomJoinResponse {
    private String roomId;
    private String participantId;
    private String token;
    private boolean success;
    private String message;
}