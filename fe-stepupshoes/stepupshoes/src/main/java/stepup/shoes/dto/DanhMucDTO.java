package stepup.shoes.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhMucDTO {
    private Integer maDanhMuc;
    private String tenDanhMuc;
    private String moTa;
    private Integer maDanhMucCha;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
    private List<SanPhamDTO> sanPhams;
}
