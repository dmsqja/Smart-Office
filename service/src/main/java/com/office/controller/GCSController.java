package com.office.controller;

import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.exception.GCSException;
import com.office.app.service.GCSService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gcs")
@Tag(name = "Google Cloud Storage", description = "GCS 파일 관리 API")
public class GCSController {

    private final GCSService gcsService;

    @Operation(summary = "파일 업로드", description = "GCS에 파일을 업로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "업로드 성공",
                    content = @Content(schema = @Schema(implementation = GCSResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })

    @PostMapping("/upload")
    public ResponseEntity<GCSResponse> uploadObject(
            @Parameter(description = "업로드할 파일 정보", required = true)
            @ModelAttribute GCSRequest gcsRequest) throws GCSException {
        return ResponseEntity.ok(gcsService.uploadObject(gcsRequest));
    }

    @Operation(summary = "파일 다운로드", description = "GCS에서 파일을 다운로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "다운로드 성공",
                    content = @Content(schema = @Schema(implementation = GCSResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음")
    })

    @GetMapping("/download/{fileName}")
    public ResponseEntity<GCSResponse> downloadObject(
            @Parameter(description = "다운로드할 파일명", required = true)
            @PathVariable String fileName) throws GCSException {
        return ResponseEntity.ok(gcsService.downloadObject(fileName));
    }

    @Operation(summary = "파일 삭제", description = "GCS에서 파일을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음")
    })
    @DeleteMapping("/{fileName}")
    public ResponseEntity<Void> deleteObject(
            @Parameter(description = "삭제할 파일명", required = true)
            @PathVariable String fileName) throws GCSException {
        gcsService.deleteObject(fileName);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "파일 목록 조회", description = "GCS에 저장된 모든 파일 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = GCSResponse.class))),
            @ApiResponse(responseCode = "400", description = "조회 실패",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    @GetMapping("/list")
    public ResponseEntity<List<GCSResponse>> listObjects() throws GCSException {
        return ResponseEntity.ok(gcsService.listObjects());
    }

    @ExceptionHandler(GCSException.class)
    public ResponseEntity<String> handleGCSException(GCSException e) {
        log.error("GCS operation failed", e);
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}