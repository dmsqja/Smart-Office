package com.office.app.repository;

import com.office.app.domain.RoomStatus;
import com.office.app.entity.MeetingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, String> {
    List<MeetingRoom> findByStatus(RoomStatus status);
    
    @Query("SELECT m FROM MeetingRoom m WHERE m.status = 'ACTIVE' ORDER BY m.createdAt DESC")
    List<MeetingRoom> findActiveRooms();
}