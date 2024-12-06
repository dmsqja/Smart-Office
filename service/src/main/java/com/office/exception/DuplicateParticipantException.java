package com.office.exception;

public class DuplicateParticipantException extends RuntimeException {
    public DuplicateParticipantException(String message) {
        super(message);
    }
}