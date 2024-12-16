package com.office.controller;

import com.office.app.dto.PageResponse;
import com.office.app.dto.PostDTO;
import com.office.app.entity.Post;
import com.office.app.entity.PostAttachment;
import com.office.app.service.PostAttachmentService;
import com.office.app.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {
    private final PostService postService;
    private final PostAttachmentService postAttachmentService;

    // 특정 게시판의 게시글 목록 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<PageResponse<PostDTO>> getBoardPosts(
            @PathVariable Long boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        try {
            PageResponse<PostDTO> response;
            if (keyword != null && !keyword.isEmpty()) {
                response = postService.searchPosts(boardId, keyword, page, size);
            } else {
                response = postService.getPostsByBoard(boardId, page, size);
            }

            // 명시적으로 MediaType 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            return new ResponseEntity<>(response, headers, HttpStatus.OK);
        } catch (Exception e) {
            // 에러 로깅
            log.error("Error fetching posts for board {}: {}", boardId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 새 게시글 작성
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO> createPost(
            @RequestPart(value = "postData") PostDTO postDTO,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();

        // 게시글 생성
        PostDTO createdPost = postService.createPost(postDTO, employeeId);

        // 첨부파일 업로드 (선택적)
        if (attachments != null && !attachments.isEmpty()) {
            postAttachmentService.uploadPostAttachments(attachments, createdPost.getId(), employeeId);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping("/{postId}/attachments")
    public ResponseEntity<List<PostAttachment>> getPostAttachments(@PathVariable Long postId) {
        List<PostAttachment> attachments = postAttachmentService.getPostAttachments(postId);
        return ResponseEntity.ok(attachments);
    }


    // 게시글 상세 조회
    @GetMapping("/detail/{postId}")
    public ResponseEntity<PostDTO> getPostDetail(@PathVariable Long postId) {
        PostDTO postDTO = postService.getPostById(postId);
        return ResponseEntity.ok(postDTO);
    }

    // 게시글 수정
    @PutMapping("/{postId}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @RequestBody PostDTO postDTO,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        PostDTO updatedPost = postService.updatePost(postId, postDTO, employeeId);
        return ResponseEntity.ok(updatedPost);
    }

    // 게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        postService.deletePost(postId, employeeId);
        return ResponseEntity.ok().build();
    }
}