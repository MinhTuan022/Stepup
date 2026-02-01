package stepup.shoes.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HinhAnhChiTietDTO {
    private Integer maHinhAnh;
    private Integer maChiTiet;
    private String duongDan;
    private Boolean laAnhChinh;
    private Integer thuTu;
    private LocalDateTime ngayTao;
}
