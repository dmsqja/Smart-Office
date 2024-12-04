package com.office.app.repository;

import com.office.app.entity.MeetingChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingChatRepository extends JpaRepository<MeetingChatMessage, Long> {
    Page<MeetingChatMessage> findByRoomIdAndDeletedFalseOrderByCreatedAtDesc(
        String roomId, Pageable pageable);
        
    List<MeetingChatMessage> findTop100ByRoomIdAndDeletedFalseOrderByCreatedAtDesc(
        String roomId);
    List<MeetingChatMessage> findByRoomId(String roomId);

}