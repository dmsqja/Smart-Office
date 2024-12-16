package com.office.app.service;

import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.app.entity.PostAttachment;
import com.office.app.repository.PostAttachmentRepository;
import com.office.app.repository.PostRepository;
import com.office.exception.GCSException;
import com.office.exception.PostNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostAttachmentService {
    private final GCSService gcsService;
    private final PostAttachmentRepository postAttachmentRepository;
    private final PostRepository postRepository;

    public List<PostAttachment> uploadPostAttachments(List<MultipartFile> files, Long postId, String employeeId) throws GCSException {
        // 게시글 존재 여부 확인
        postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        List<PostAttachment> attachments = new ArrayList<>();

        for (MultipartFile file : files) {
            GCSRequest gcsRequest = new GCSRequest();
            gcsRequest.setFile(file);
            
            // GCS에 파일 업로드
            GCSResponse gcsResponse = gcsService.uploadObject(gcsRequest, employeeId, false);

            // PostAttachment 엔티티 생성
            PostAttachment attachment = PostAttachment.builder()
                .postId(postId)
                .storedFileName(gcsResponse.getFileName())
                .originalFileName(gcsResponse.getOriginalFileName())
                .downloadUrl(gcsResponse.getDownloadUrl())
                .fileSize(gcsResponse.getFileSize())
                .contentType(gcsResponse.getContentType())
                .build();

            attachments.add(postAttachmentRepository.save(attachment));
        }

        return attachments;
    }

    public List<PostAttachment> getPostAttachments(Long postId) {
        return postAttachmentRepository.findByPostId(postId);
    }

    public void deletePostAttachments(Long postId, String employeeId) throws GCSException {
        List<PostAttachment> attachments = postAttachmentRepository.findByPostId(postId);
        
        for (PostAttachment attachment : attachments) {
            // GCS에서 파일 삭제
            gcsService.deleteObject(attachment.getStoredFileName(), employeeId);
            
            // DB에서 첨부파일 정보 삭제
            postAttachmentRepository.delete(attachment);
        }
    }
}