package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "DonHang")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDonHang")
    private Integer maDonHang;

    @ManyToOne
    @JoinColumn(name = "MaNguoiDung")
    private NguoiDung nguoiDung;

    @Column(name = "TongTien", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "PhiVanChuyen", precision = 18, scale = 2)
    private BigDecimal phiVanChuyen = BigDecimal.ZERO;

    @Column(name = "GiamGia", precision = 18, scale = 2)
    private BigDecimal giamGia = BigDecimal.ZERO;

    @Column(name = "ThanhTien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "TrangThaiDonHang", length = 50)
    private String trangThaiDonHang = "dat_hang";

    @Column(name = "TrangThaiThanhToan", length = 50)
    private String trangThaiThanhToan = "chua_thanh_toan";

    @Column(name = "PhuongThucThanhToan", length = 50)
    private String phuongThucThanhToan;

    @Column(name = "LoaiDonHang", length = 20)
    private String loaiDonHang = "online";

    @Column(name = "DiaChiGiaoHang", nullable = false, length = 500)
    private String diaChiGiaoHang;

    @Column(name = "SoDienThoaiNhan", nullable = false, length = 15)
    private String soDienThoaiNhan;

    @Column(name = "NguoiNhan", nullable = false, length = 100)
    private String nguoiNhan;

    @Column(name = "GhiChu", length = 500)
    private String ghiChu;

    @Column(name = "NgayDatHang")
    private LocalDateTime ngayDatHang = LocalDateTime.now();

    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<ChiTietDonHang> chiTietDonHangs;

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<LichSuTrangThaiDonHang> lichSuTrangThaiDonHangs;

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<LichSuVoucher> lichSuVouchers;
}
