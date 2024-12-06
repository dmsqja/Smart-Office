package com.office.app.entity;

import com.office.app.domain.ParticipantRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_participant")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomParticipant {
    @EmbeddedId
    private RoomParticipantId id;
    
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    private ParticipantRole role;
}