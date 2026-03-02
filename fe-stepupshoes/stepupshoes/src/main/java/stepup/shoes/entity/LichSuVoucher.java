package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuVoucher")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuVoucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaLichSu")
    private Integer maLichSu;

    @ManyToOne
    @JoinColumn(name = "MaVoucher")
    private Voucher voucher;

    @ManyToOne
    @JoinColumn(name = "MaDonHang")
    private DonHang donHang;

    @ManyToOne
    @JoinColumn(name = "MaNguoiDung")
    private NguoiDung nguoiDung;

    @Column(name = "GiaTriGiam", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaTriGiam;

    @Column(name = "NgaySuDung")
    private LocalDateTime ngaySuDung = LocalDateTime.now();
}
