package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HinhAnhChiTiet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HinhAnhChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHinhAnh")
    private Integer maHinhAnh;

    @ManyToOne
    @JoinColumn(name = "MaChiTiet")
    private ChiTietSanPham chiTietSanPham;

    @Column(name = "DuongDan", nullable = false, length = 255)
    private String duongDan;

    @Column(name = "LaAnhChinh")
    private Boolean laAnhChinh = false;

    @Column(name = "ThuTu")
    private Integer thuTu = 0;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
