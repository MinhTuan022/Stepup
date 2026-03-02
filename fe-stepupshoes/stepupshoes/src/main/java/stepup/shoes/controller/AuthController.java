package stepup.shoes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.ApiResponseDTO;
import stepup.shoes.dto.JwtResponseDTO;
import stepup.shoes.dto.LoginDTO;
import stepup.shoes.dto.NguoiDungDTO;
import stepup.shoes.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực người dùng và trả về JWT token")
    public ResponseEntity<ApiResponseDTO<JwtResponseDTO>> login(@RequestBody LoginDTO loginDTO) {
        JwtResponseDTO jwtResponse = authService.login(loginDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Đăng nhập thành công", jwtResponse)
        );
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản người dùng mới")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> register(@RequestBody NguoiDungDTO nguoiDungDTO) {
        NguoiDungDTO newUser = authService.register(nguoiDungDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponseDTO<>(true, "Đăng ký thành công", newUser));
    }

    @GetMapping("/me/{id}")
    @Operation(summary = "Lấy thông tin tài khoản", description = "Lấy thông tin người dùng hiện tại")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> getCurrentUser(@PathVariable Integer id) {
        NguoiDungDTO user = authService.getUserById(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thông tin thành công", user)
        );
    }
}
