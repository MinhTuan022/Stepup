package stepup.shoes.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPhamDTO {
    private Integer maSanPham;
    private String tenSanPham;
    private String moTa;
    private String thuongHieu;
    private Integer maDanhMuc;
    private String tenDanhMuc;
    private BigDecimal giaCoBan;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    private List<ChiTietSanPhamDTO> chiTietSanPhams;
}
