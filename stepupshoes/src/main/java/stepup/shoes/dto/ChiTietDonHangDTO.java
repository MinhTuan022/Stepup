package stepup.shoes.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietDonHangDTO {
    private Integer maChiTietDon;
    private Integer maDonHang;
    private Integer maChiTiet;
    private String tenSanPham;
    private String maSKU;
    private String mauSac;
    private String size;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
}
