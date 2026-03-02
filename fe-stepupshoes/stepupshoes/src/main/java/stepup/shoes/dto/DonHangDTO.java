package stepup.shoes.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonHangDTO {
    private Integer maDonHang;
    private Integer maNguoiDung;
    private BigDecimal tongTien;
    private BigDecimal phiVanChuyen;
    private BigDecimal giamGia;
    private BigDecimal thanhTien;
    private String trangThaiDonHang;
    private String trangThaiThanhToan;
    private String phuongThucThanhToan;
    private String loaiDonHang;
    private String diaChiGiaoHang;
    private String soDienThoaiNhan;
    private String nguoiNhan;
    private String ghiChu;
    private LocalDateTime ngayDatHang;
    private LocalDateTime ngayCapNhat;
    private List<ChiTietDonHangDTO> chiTietDonHangs;
}
