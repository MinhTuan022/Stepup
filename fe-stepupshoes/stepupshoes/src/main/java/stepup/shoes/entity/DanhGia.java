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
    private Boolean trangThai = true;

    @Column(name = "NgayDanhGia")
    private LocalDateTime ngayDanhGia = LocalDateTime.now();
}
