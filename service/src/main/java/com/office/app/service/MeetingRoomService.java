// MeetingRoomService.java
package com.office.app.service;

import com.office.app.domain.*;
import com.office.app.entity.*;
import com.office.app.repository.*;
import com.office.app.dto.*;
import com.office.exception.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.webjars.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeetingRoomService {
    private final MeetingRoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;
    private final MeetingChatService meetingChatService;
    @Transactional
    public MeetingRoomDto createRoom(CreateRoomRequest request, String hostId) {
        MeetingRoom room = MeetingRoom.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(request.getRoomName())
                .description(request.getDescription())
                .hostId(hostId)
                .maxParticipants(request.getMaxParticipants())
                .password(request.getPassword())
                .createdAt(LocalDateTime.now())
                .status(RoomStatus.ACTIVE)
                .build();

        room = roomRepository.save(room);

        // Add host as first participant
        RoomParticipant host = RoomParticipant.builder()
                .id(new RoomParticipantId(hostId, room.getRoomId()))
                .role(ParticipantRole.HOST)
                .build();

        participantRepository.save(host);

        return convertToDto(room);
    }
    
    @Transactional(readOnly = true)
    public List<MeetingRoomDto> getActiveRooms() {
        return roomRepository.findActiveRooms().stream()
            .map(this::convertToDto)
            .toList();
    }
    
    @Transactional
    public RoomJoinResponse joinRoom(JoinRoomRequest request, String participantId) {
        MeetingRoom room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new RoomNotFoundException("Room not found"));
            
        // Check room status
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new IllegalStateException("Room is not active");
        }
        
        // Check password if required
        if (room.getPassword() != null && !room.getPassword().equals(request.getPassword())) {
            throw new InvalidPasswordException("Invalid room password");
        }
        
        // Check participant count
        long currentParticipants = participantRepository.countParticipantsByRoomId(room.getRoomId());
        if (currentParticipants >= room.getMaxParticipants()) {
            throw new RoomFullException("Room is full");
        }
        
        // Add participant
        RoomParticipant participant = RoomParticipant.builder()
            .id(new RoomParticipantId(participantId, room.getRoomId()))
            .role(ParticipantRole.PARTICIPANT)
            .build();
            
        participantRepository.save(participant);
        
        return RoomJoinResponse.builder()
            .roomId(room.getRoomId())
            .participantId(participantId)
            .token(generateToken(room.getRoomId(), participantId))
            .success(true)
            .build();
    }
    
    @Transactional
    public void leaveRoom(String roomId, String participantId) {
        RoomParticipantId id = new RoomParticipantId(participantId, roomId);
        participantRepository.deleteById(id);
        
        // If no participants left, close the room
        long remainingParticipants = participantRepository.countParticipantsByRoomId(roomId);
        if (remainingParticipants == 0) {
            MeetingRoom room = roomRepository.findById(roomId).orElseThrow();
            room.setStatus(RoomStatus.CLOSED);
            roomRepository.save(room);
        }
    }

    private MeetingRoomDto convertToDto(MeetingRoom room) {
        long currentParticipants = participantRepository.countParticipantsByRoomId(room.getRoomId());

        return MeetingRoomDto.builder()
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .description(room.getDescription())
                .hostId(room.getHostId())
                .maxParticipants(room.getMaxParticipants())
                .currentParticipants((int) currentParticipants)
                .createdAt(room.getCreatedAt())
                .status(room.getStatus())
                .hasPassword(room.getPassword() != null)
                .build();
    }
    private String generateToken(String roomId, String participantId) {
        // TODO: Implement proper token generation
        return UUID.randomUUID().toString();
    }

    @Transactional(readOnly = true)
    public MeetingRoomDto getRoomDetails(String roomId) {
        MeetingRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with id: " + roomId));
        return convertToDto(room);
    }

    @Transactional
    public void closeRoom(String roomId, String userId) {
        MeetingRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        if (!room.getHostId().equals(userId)) {
            throw new UnauthorizedAccessException("Only host can close the room");
        }

        if (room.getStatus() == RoomStatus.CLOSED) {
            throw new RoomClosedException("Room is already closed");
        }

        room.setStatus(RoomStatus.CLOSED);
        roomRepository.save(room);

        // 모든 참가자 강제 퇴장 처리 및 시스템 메시지 생성
        List<RoomParticipant> participants = participantRepository.findByIdRoomId(roomId);
        participants.forEach(participant -> {
            // 채팅 시스템 메시지 생성
            MeetingChatMessage systemMessage = MeetingChatMessage.builder()
                    .roomId(roomId)
                    .senderId("SYSTEM")
                    .senderName("SYSTEM")
                    .content("회의가 종료되었습니다.")
                    .type(MessageType.SYSTEM)
                    .build();
            meetingChatService.saveMessage(systemMessage);
        });
        participantRepository.deleteAll(participants);
    }
    /**
     * 회의방 존재 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean existsRoom(String roomId) {
        return roomRepository.existsById(roomId);
    }

    /**
     * 회의방 채팅 접근 권한 확인
     */
    @Transactional(readOnly = true)
    public void validateChatAccess(String roomId, String participantId) {
        MeetingRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        // 방이 활성 상태인지 확인
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new IllegalStateException("Room is not active");
        }

        // 참가자가 해당 방에 속해있는지 확인
        RoomParticipantId participantKey = new RoomParticipantId(participantId, roomId);
        if (!participantRepository.existsById(participantKey)) {
            throw new UnauthorizedAccessException("User is not a participant of this room");
        }
    }

    /**
     * 회의방 참가자 정보 조회
     */
    @Transactional(readOnly = true)
    public RoomParticipant getParticipant(String roomId, String participantId) {
        return participantRepository.findById(new RoomParticipantId(participantId, roomId))
                .orElseThrow(() -> new NotFoundException("Participant not found"));
    }
}