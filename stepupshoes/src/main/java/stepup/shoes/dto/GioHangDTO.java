package stepup.shoes.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioHangDTO {
    private Integer maGioHang;
    private Integer maNguoiDung;
    private Integer maChiTiet;
    private String tenSanPham;
    private String mauSac;
    private String size;
    private String maSKU;
    private Integer soLuong;
    private ChiTietSanPhamDTO chiTietSanPham;
}
