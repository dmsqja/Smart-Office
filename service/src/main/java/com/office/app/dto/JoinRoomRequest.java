package com.office.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinRoomRequest {
    @NotBlank(message = "Room ID is required")
    private String roomId;
    
    private String password; // Optional, required if room has password
}
