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

    @ManyToOne
    @JoinColumn(name = "MaSanPham")
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
    @Builder.Default
    private Integer soLuongTon = 0;

    @Column(name = "TrangThai")
    @Builder.Default
    private Boolean trangThai = true;

    @Column(name = "HinhAnhChinh", columnDefinition = "NVARCHAR(MAX)")
    private String hinhAnhChinh;

    @Column(name = "NgayTao")
    @Builder.Default
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "NgayCapNhat")
    @Builder.Default
    private LocalDateTime ngayCapNhat = LocalDateTime.now();

    @Column(name = "DaXoa")
    @Builder.Default
    private Boolean daXoa = false;

    @Column(name = "NgayXoa")
    private LocalDateTime ngayXoa;

    @ManyToOne
    @JoinColumn(name = "NguoiXoa")
    private NguoiDung nguoiXoa;

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
