package com.office.app.repository;

import com.office.app.entity.FileInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileInfoRepository extends JpaRepository<FileInfo, Long> {
    List<FileInfo> findByUploader_EmployeeId(String employeeId);
    Optional<FileInfo> findByStoredFileName(String fileName);
}