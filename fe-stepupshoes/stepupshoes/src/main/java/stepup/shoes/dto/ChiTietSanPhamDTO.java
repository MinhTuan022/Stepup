package stepup.shoes.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietSanPhamDTO {
    private Integer maChiTiet;
    private Integer maSanPham;
    private String maSKU;
    private String mauSac;
    private String size;
    private BigDecimal giaBan;
    private Integer soLuongTon;
    private Boolean trangThai;
    private String hinhAnhChinh;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    private List<HinhAnhChiTietDTO> hinhAnhs;
    private Double diemTrungBinh;
}
