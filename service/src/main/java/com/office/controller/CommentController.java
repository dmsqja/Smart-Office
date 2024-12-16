package com.office.controller;

import com.office.app.dto.CommentDTO;
import com.office.app.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    // 특정 게시글의 댓글 조회
    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    // 댓글 생성
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @RequestBody CommentDTO commentDTO,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        CommentDTO createdComment = commentService.createComment(commentDTO, employeeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentDTO commentDTO,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        CommentDTO updatedComment = commentService.updateComment(commentId, commentDTO, employeeId);
        return ResponseEntity.ok(updatedComment);
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        commentService.deleteComment(commentId, employeeId);
        return ResponseEntity.ok().build();
    }
}