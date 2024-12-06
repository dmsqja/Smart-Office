package com.office.app.repository;

import com.office.app.domain.RoomStatus;
import com.office.app.entity.MeetingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, String> {
    @Query("SELECT m FROM MeetingRoom m WHERE m.status = 'ACTIVE' ORDER BY m.createdAt DESC")
    List<MeetingRoom> findActiveRooms();

    boolean existsByRoomIdAndStatus(String roomId, RoomStatus status);

    @Query("SELECT m FROM MeetingRoom m WHERE m.roomId = :roomId AND m.status = 'ACTIVE'")
    Optional<MeetingRoom> findActiveRoomById(@Param("roomId") String roomId);

}