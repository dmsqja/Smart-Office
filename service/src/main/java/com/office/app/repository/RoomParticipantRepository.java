package com.office.app.repository;

import com.office.app.entity.RoomParticipant;
import com.office.app.entity.RoomParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, RoomParticipantId> {
    List<RoomParticipant> findByIdRoomId(String roomId);
    
    @Query("SELECT COUNT(rp) FROM RoomParticipant rp WHERE rp.id.roomId = ?1")
    long countParticipantsByRoomId(String roomId);
}