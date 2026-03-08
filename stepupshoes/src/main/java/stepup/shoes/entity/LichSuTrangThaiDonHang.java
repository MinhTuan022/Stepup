package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuTrangThaiDonHang")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuTrangThaiDonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaLichSu")
    private Integer maLichSu;

    @ManyToOne
    @JoinColumn(name = "MaDonHang")
    private DonHang donHang;

    @Column(name = "TrangThaiCu", length = 50)
    private String trangThaiCu;

    @Column(name = "TrangThaiMoi", nullable = false, length = 50)
    private String trangThaiMoi;

    @Column(name = "GhiChu", length = 500)
    private String ghiChu;

    @ManyToOne
    @JoinColumn(name = "NguoiCapNhat")
    private NguoiDung nguoiCapNhat;

    @Column(name = "NgayCapNhat")
    @Builder.Default
    private LocalDateTime ngayCapNhat = LocalDateTime.now();
}
