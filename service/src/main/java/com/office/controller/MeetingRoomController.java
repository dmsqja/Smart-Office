package com.office.controller;

import com.office.app.dto.*;
import com.office.app.service.MeetingRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Meeting Room", description = "화상 회의실 관리 API")
public class MeetingRoomController {
    private final MeetingRoomService meetingRoomService;

    @Operation(
        summary = "회의실 생성",
        description = "새로운 화상 회의실을 생성합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "회의실 생성 성공",
            content = @Content(schema = @Schema(implementation = MeetingRoomDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        )
    })
    @PostMapping
    public ResponseEntity<MeetingRoomDto> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") String userId) {
        MeetingRoomDto room = meetingRoomService.createRoom(request, userId);
        return ResponseEntity.ok(room);
    }

    @Operation(
        summary = "활성 회의실 목록 조회",
        description = "현재 활성화된 모든 회의실 목록을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(schema = @Schema(implementation = MeetingRoomDto.class))
        )
    })
    @GetMapping
    public ResponseEntity<List<MeetingRoomDto>> getActiveRooms() {
        List<MeetingRoomDto> rooms = meetingRoomService.getActiveRooms();
        return ResponseEntity.ok(rooms);
    }

    @Operation(
        summary = "회의실 상세 정보 조회",
        description = "특정 회의실의 상세 정보를 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(schema = @Schema(implementation = MeetingRoomDto.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회의실을 찾을 수 없음"
        )
    })
    @GetMapping("/{roomId}")
    public ResponseEntity<MeetingRoomDto> getRoomDetails(
            @Parameter(description = "회의실 ID", required = true)
            @PathVariable String roomId) {
        MeetingRoomDto room = meetingRoomService.getRoomDetails(roomId);
        return ResponseEntity.ok(room);
    }

    @Operation(
        summary = "회의실 참여",
        description = "특정 회의실에 참여합니다. 비밀번호가 설정된 경우 비밀번호 검증을 수행합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "참여 성공",
            content = @Content(schema = @Schema(implementation = RoomJoinResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "잘못된 비밀번호"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회의실을 찾을 수 없음"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "회의실 정원 초과"
        )
    })
    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomJoinResponse> joinRoom(
            @Parameter(description = "회의실 ID", required = true)
            @PathVariable String roomId,
            @Valid @RequestBody JoinRoomRequest request,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") String userId) {
        request.setRoomId(roomId);
        RoomJoinResponse response = meetingRoomService.joinRoom(request, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "회의실 나가기",
        description = "현재 참여 중인 회의실에서 나갑니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "성공적으로 회의실을 나감"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회의실을 찾을 수 없음"
        )
    })
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @Parameter(description = "회의실 ID", required = true)
            @PathVariable String roomId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") String userId) {
        meetingRoomService.leaveRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }
    
    @Operation(
        summary = "회의실 종료",
        description = "회의실을 종료합니다. 회의실 생성자만 종료할 수 있습니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "회의실 종료 성공"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "권한 없음"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회의실을 찾을 수 없음"
        )
    })
    @PostMapping("/{roomId}/close")
    public ResponseEntity<Void> closeRoom(
            @Parameter(description = "회의실 ID", required = true)
            @PathVariable String roomId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") String userId) {
        meetingRoomService.closeRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }
}