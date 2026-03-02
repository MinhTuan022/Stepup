package stepup.shoes.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import stepup.shoes.dto.ApiResponseDTO;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponseDTO<String>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        ApiResponseDTO<String> response = ApiResponseDTO.<String>builder()
            .success(false)
            .message(ex.getMessage())
            .msgCode("RESOURCE_NOT_FOUND")
            .errorCode(String.valueOf(HttpStatus.NOT_FOUND.value())) // "404"
            .build();
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponseDTO<String>> handleBadRequestException(
            BadRequestException ex, WebRequest request) {
        ApiResponseDTO<String> response = ApiResponseDTO.<String>builder()
            .success(false)
            .message(ex.getMessage())
            .msgCode("BAD_REQUEST")
            .errorCode(String.valueOf(HttpStatus.BAD_REQUEST.value())) // "400"
            .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponseDTO<String>> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {
        ApiResponseDTO<String> response = ApiResponseDTO.<String>builder()
            .success(false)
            .message(ex.getMessage())
            .msgCode("UNAUTHORIZED")
            .errorCode(String.valueOf(HttpStatus.UNAUTHORIZED.value())) // "401"
            .build();
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO<String>> handleGlobalException(
            Exception ex, WebRequest request) {
        ApiResponseDTO<String> response = ApiResponseDTO.<String>builder()
            .success(false)
            .message("Lỗi hệ thống: " + ex.getMessage())
            .msgCode("INTERNAL_SERVER_ERROR")
            .errorCode(String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value())) // "500"
            .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
