package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietDonHang", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"MaDonHang", "MaChiTiet"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietDonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChiTietDon")
    private Integer maChiTietDon;

    @ManyToOne
    @JoinColumn(name = "MaDonHang")
    private DonHang donHang;

    @ManyToOne
    @JoinColumn(name = "MaChiTiet")
    private ChiTietSanPham chiTietSanPham;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "DonGia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "ThanhTien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;
}
