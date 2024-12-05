package com.office.controller;

import com.office.app.dto.ErrorResponse;
import com.office.app.dto.MeetingChatMessageResponse;
import com.office.app.service.MeetingChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings/chat")
@RequiredArgsConstructor
@Tag(name = "Meeting Chat", description = "화상 회의 채팅 API")
public class MeetingChatController {

    private final MeetingChatService meetingChatService;

    @Operation(
        summary = "채팅 메시지 조회",
        description = "특정 회의방의 채팅 메시지 내역을 페이지네이션하여 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "채팅 메시지 조회 성공"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "존재하지 않는 회의방",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<MeetingChatMessageResponse>> getMessages(
            @Parameter(description = "회의방 ID", required = true)
            @PathVariable String roomId,
            @Parameter(description = "페이지 번호 (0부터 시작)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") 
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(meetingChatService.getMessages(roomId, pageable));
    }

    @Operation(
        summary = "채팅 메시지 삭제",
        description = "특정 채팅 메시지를 삭제합니다. 메시지 작성자만 삭제할 수 있습니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "메시지 삭제 성공"),
        @ApiResponse(
            responseCode = "403", 
            description = "메시지 삭제 권한 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "존재하지 않는 메시지",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @Parameter(description = "메시지 ID", required = true) 
            @PathVariable Long messageId,
            @Parameter(description = "사용자 ID", required = true) 
            @RequestHeader("X-User-Id") String userId
    ) {
        meetingChatService.deleteMessage(messageId, userId);
        return ResponseEntity.noContent().build();
    }
}