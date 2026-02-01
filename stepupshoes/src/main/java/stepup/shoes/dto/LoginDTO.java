package stepup.shoes.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginDTO {
    private String tenDangNhap;
    private String matKhau;
}
