package com.office.app.service;

import com.office.app.domain.RoomStatus;
import com.office.app.dto.MeetingChatMessageResponse;
import com.office.app.entity.MeetingChatMessage;
import com.office.app.repository.MeetingChatRepository;
import com.office.app.repository.MeetingRoomRepository;
import com.office.exception.RoomNotFoundException;
import com.office.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.webjars.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class MeetingChatService {

    private final MeetingChatRepository meetingChatRepository;
    private final MeetingRoomRepository meetingRoomRepository;  // MeetingRoomService 대신 직접 Repository 사용

    @Transactional
    public MeetingChatMessage saveMessage(MeetingChatMessage message) {
        if (!isRoomExistsAndActive(message.getRoomId())) {
            throw new RoomNotFoundException("존재하지 않거나 비활성화된 회의방입니다.");
        }
        return meetingChatRepository.save(message);
    }

    public Page<MeetingChatMessageResponse> getMessages(String roomId, Pageable pageable) {
        if (!isRoomExistsAndActive(roomId)) {
            throw new RoomNotFoundException("존재하지 않거나 비활성화된 회의방입니다.");
        }

        return meetingChatRepository
                .findByRoomIdAndDeletedFalseOrderByCreatedAtDesc(roomId, pageable)
                .map(MeetingChatMessageResponse::from);
    }

    public List<MeetingChatMessageResponse> getRecentMessages(String roomId) {
        if (!isRoomExistsAndActive(roomId)) {
            throw new RoomNotFoundException("존재하지 않거나 비활성화된 회의방입니다.");
        }

        return meetingChatRepository
                .findTop100ByRoomIdAndDeletedFalseOrderByCreatedAtDesc(roomId)
                .stream()
                .map(MeetingChatMessageResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMessage(Long messageId, String userId) {
        MeetingChatMessage message = meetingChatRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 메시지입니다."));

        // 메시지의 방이 아직 존재하고 활성화 상태인지 확인
        if (!isRoomExistsAndActive(message.getRoomId())) {
            throw new RoomNotFoundException("존재하지 않거나 비활성화된 회의방입니다.");
        }

        if (!message.getSenderId().equals(userId)) {
            throw new UnauthorizedException("메시지 삭제 권한이 없습니다.");
        }

        message.delete();
    }

    private boolean isRoomExistsAndActive(String roomId) {
        return meetingRoomRepository.findById(roomId)
                .map(room -> room.getStatus() == RoomStatus.ACTIVE)
                .orElse(false);
    }

    @Transactional
    public void deleteAllRoomMessages(String roomId) {
        List<MeetingChatMessage> messages = meetingChatRepository.findByRoomId(roomId);
        messages.forEach(MeetingChatMessage::delete);
    }
}