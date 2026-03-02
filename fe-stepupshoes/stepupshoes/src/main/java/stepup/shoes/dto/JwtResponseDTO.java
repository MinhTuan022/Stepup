package stepup.shoes.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponseDTO {
    private String accessToken;
    private String tokenType = "Bearer";
    private Integer maNguoiDung;
    private String tenDangNhap;
    private String email;
    private String vaiTro;

    public JwtResponseDTO(String accessToken, Integer maNguoiDung, String tenDangNhap, String email, String vaiTro) {
        this.accessToken = accessToken;
        this.maNguoiDung = maNguoiDung;
        this.tenDangNhap = tenDangNhap;
        this.email = email;
        this.vaiTro = vaiTro;
    }
}
