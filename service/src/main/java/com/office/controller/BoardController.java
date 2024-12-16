package com.office.controller;

import com.office.app.dto.BoardDTO;
import com.office.app.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    // 부서별 게시판 목록 조회
    @GetMapping("/department/{departmentCode}")
    public ResponseEntity<List<BoardDTO>> getBoardsByDepartment(@PathVariable String departmentCode) {
        List<BoardDTO> boards = boardService.getBoardsByDepartment(departmentCode);
        return ResponseEntity.ok(boards);
    }

    // 게시판 생성 (관리자 전용)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // 스프링 시큐리티 권한 체크
    public ResponseEntity<BoardDTO> createBoard(
            @RequestBody BoardDTO boardDTO,
            Authentication authentication
    ) {
        String adminEmployeeId = authentication.getName();
        BoardDTO createdBoard = boardService.createBoard(boardDTO, adminEmployeeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
    }

    // 게시판 수정
    @PutMapping("/{boardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardDTO> updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardDTO boardDTO,
            Authentication authentication
    ) {
        String adminEmployeeId = authentication.getName();
        BoardDTO updatedBoard = boardService.updateBoard(boardId, boardDTO, adminEmployeeId);
        return ResponseEntity.ok(updatedBoard);
    }

    // 게시판 삭제
    @DeleteMapping("/{boardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Long boardId,
            Authentication authentication
    ) {
        String adminEmployeeId = authentication.getName();
        boardService.deleteBoard(boardId, adminEmployeeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/access")
    public ResponseEntity<Map<String, Boolean>> checkBoardAccess(
            @RequestParam String department,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();

        // 부서 접근 권한 체크 로직
        boolean canAccess = boardService.checkDepartmentAccess(employeeId, department);

        Map<String, Boolean> response = new HashMap<>();
        response.put("canAccess", canAccess);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<BoardDTO>> getAllBoards() {
        List<BoardDTO> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }
}