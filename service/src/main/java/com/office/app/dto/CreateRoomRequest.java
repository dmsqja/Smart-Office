package com.office.app.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Data
public class CreateRoomRequest {
    @NotBlank(message = "Room name is required")
    private String roomName;
    
    @Min(value = 2, message = "Minimum 2 participants required")
    private int maxParticipants;
    
    private String password; // Optional
}
