package stepup.shoes.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDungDTO {
    private Integer maNguoiDung;
    private String tenDangNhap;
    private String matKhau;
    private String email;
    private String hoTen;
    private String soDienThoai;
    private String diaChi;
    private String vaiTro;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
