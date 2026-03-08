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

    @Column(name = "DuongDan", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String duongDan;

    @Column(name = "LaAnhChinh")
    @Builder.Default
    private Boolean laAnhChinh = false;

    @Column(name = "ThuTu")
    @Builder.Default
    private Integer thuTu = 0;

    @Column(name = "NgayTao")
    @Builder.Default
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "DaXoa")
    @Builder.Default
    private Boolean daXoa = false;

    @Column(name = "NgayXoa")
    private LocalDateTime ngayXoa;

    @ManyToOne
    @JoinColumn(name = "NguoiXoa")
    private NguoiDung nguoiXoa;
}
