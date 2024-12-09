package com.office.app.validator;

import com.office.exception.GCSException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Component
public class FileValidator {
    @Value("${file.max-size:10485760}") // 10MB 기본값
    private long maxFileSize;

    @Value("${file.allowed-types:image/jpeg,image/png,application/pdf}")
    private List<String> allowedTypes;

    public void validateFile(MultipartFile file) throws GCSException {
        if (file.getSize() > maxFileSize) {
            throw new GCSException("File size exceeds maximum limit");
        }
        if (!allowedTypes.contains(file.getContentType())) {
            throw new GCSException("File type not allowed");
        }
    }
}