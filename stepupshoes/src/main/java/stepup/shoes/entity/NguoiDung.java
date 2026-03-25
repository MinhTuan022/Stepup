package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "NguoiDung")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaNguoiDung")
    private Integer maNguoiDung;

    @Column(name = "TenDangNhap", unique = true, nullable = false, length = 50)
    private String tenDangNhap;

    @Column(name = "MatKhau", nullable = false, length = 255)
    private String matKhau;

    @Column(name = "Email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "HoTen", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "SoDienThoai", length = 15)
    private String soDienThoai;

    @Column(name = "DiaChi", length = 255)
    private String diaChi;
    
    @Column(name = "MaTinh", length = 50)
    private String maTinh;

    @Column(name = "VaiTro", length = 20)
    @Builder.Default
    private String vaiTro = "khach_hang";

    @Column(name = "TrangThai")
    @Builder.Default
    private Boolean trangThai = true;

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

    @OneToMany(mappedBy = "nguoiDung", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<GioHang> gioHangs;

    @OneToMany(mappedBy = "nguoiDung", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<DonHang> donHangs;

    @OneToMany(mappedBy = "nguoiDung", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<DanhGia> danhGias;
}
