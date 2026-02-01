package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ChiTietSanPham", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"MaSanPham", "MauSac", "Size"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietSanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChiTiet")
    private Integer maChiTiet;

    @OneToOne
    @JoinColumn(name = "MaSanPham", unique = true)
    private SanPham sanPham;

    @Column(name = "MaSKU", unique = true, nullable = false, length = 50)
    private String maSKU;

    @Column(name = "MauSac", nullable = false, length = 50)
    private String mauSac;

    @Column(name = "Size", nullable = false, length = 10)
    private String size;

    @Column(name = "GiaBan", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "SoLuongTon")
    private Integer soLuongTon = 0;

    @Column(name = "TrangThai")
    private Boolean trangThai = true;

    @Column(name = "HinhAnhChinh", length = 255)
    private String hinhAnhChinh;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();

    @OneToMany(mappedBy = "chiTietSanPham", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<HinhAnhChiTiet> hinhAnhs;

    @OneToMany(mappedBy = "chiTietSanPham", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<DanhGia> danhGias;

    @OneToMany(mappedBy = "chiTietSanPham", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<GioHang> gioHangs;
}
