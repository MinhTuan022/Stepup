package stepup.shoes.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherDTO {
    private Integer maVoucher;
    private String code;
    private String moTa;
    private String loaiGiam;
    private BigDecimal giaTriGiam;
    private BigDecimal giamToiDa;
    private BigDecimal giaTriToiThieu;
    private Integer soLuong;
    private Integer soLuongDaDung;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
}
