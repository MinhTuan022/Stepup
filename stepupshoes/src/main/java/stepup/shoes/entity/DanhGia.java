package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DanhGia", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"MaChiTiet", "MaNguoiDung"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDanhGia")
    private Integer maDanhGia;

    @ManyToOne
    @JoinColumn(name = "MaChiTiet")
    private ChiTietSanPham chiTietSanPham;

    @ManyToOne
    @JoinColumn(name = "MaNguoiDung")
    private NguoiDung nguoiDung;

    @Column(name = "Diem", nullable = false)
    private Integer diem;

    @Column(name = "NoiDung", length = 1000)
    private String noiDung;

    @Column(name = "TrangThai")
    @Builder.Default
    private Boolean trangThai = true;

    @Column(name = "NgayDanhGia")
    @Builder.Default
    private LocalDateTime ngayDanhGia = LocalDateTime.now();

    @Column(name = "DaXoa")
    @Builder.Default
    private Boolean daXoa = false;

    @Column(name = "NgayXoa")
    private LocalDateTime ngayXoa;

    @ManyToOne
    @JoinColumn(name = "NguoiXoa")
    private NguoiDung nguoiXoa;
}
