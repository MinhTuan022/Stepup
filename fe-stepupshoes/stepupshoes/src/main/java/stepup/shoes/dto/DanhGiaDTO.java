package stepup.shoes.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaDTO {
    private Integer maDanhGia;
    private Integer maChiTiet;
    private Integer maNguoiDung;
    private String hoTenNguoiDung;
    private Integer diem;
    private String noiDung;
    private Boolean trangThai;
    private LocalDateTime ngayDanhGia;
}
