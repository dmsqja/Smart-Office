package com.office.app.entity;

import com.office.app.domain.RoomStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_room")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRoom {
    @Id
    private String roomId;
    
    @Column(nullable = false)
    private String roomName;
    
    private String hostId;
    
    @Builder.Default
    private int maxParticipants = 2;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomStatus status = RoomStatus.ACTIVE;
    
    private String password; // Optional room password
}