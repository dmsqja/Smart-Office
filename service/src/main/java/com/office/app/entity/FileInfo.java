package com.office.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_info")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;  // 원본 파일명

    @Column(nullable = false)
    private String storedFileName;    // GCS에 저장된 UUID 파일명

    private Long fileSize;
    
    private String contentType;

    @Column(length = 2048)
    private String downloadUrl;
    
    @Column(nullable = false)
    private LocalDateTime uploadTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private User uploader;            // 파일 업로드한 사용자

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}