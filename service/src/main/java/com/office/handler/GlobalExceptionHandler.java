package com.office.handler;

import com.office.app.dto.ErrorResponse;
import com.office.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRoomNotFoundException(
            RoomNotFoundException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.NOT_FOUND, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(RoomFullException.class)
    public ResponseEntity<ErrorResponse> handleRoomFullException(
            RoomFullException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.CONFLICT, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPasswordException(
            InvalidPasswordException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.UNAUTHORIZED, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(DuplicateParticipantException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateParticipantException(
            DuplicateParticipantException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.CONFLICT, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccessException(
            UnauthorizedAccessException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.UNAUTHORIZED, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(RoomClosedException.class)
    public ResponseEntity<ErrorResponse> handleRoomClosedException(
            RoomClosedException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.BAD_REQUEST, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");

        return createErrorResponse(
            HttpStatus.BAD_REQUEST, 
            errorMessage, 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR, 
            "An unexpected error occurred", 
            request.getDescription(false)
        );
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(
            HttpStatus status, String message, String path) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();

        return new ResponseEntity<>(errorResponse, status);
    }
}