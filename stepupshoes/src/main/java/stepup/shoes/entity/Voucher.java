package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Voucher")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaVoucher")
    private Integer maVoucher;

    @Column(name = "Code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "MoTa", length = 255)
    private String moTa;

    @Column(name = "LoaiGiam", nullable = false, length = 20)
    private String loaiGiam;

    @Column(name = "GiaTriGiam", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaTriGiam;

    @Column(name = "GiamToiDa", precision = 18, scale = 2)
    private BigDecimal giamToiDa;

    @Column(name = "GiaTriToiThieu", precision = 18, scale = 2)
    private BigDecimal giaTriToiThieu = BigDecimal.ZERO;

    @Column(name = "SoLuong")
    private Integer soLuong;

    @Column(name = "SoLuongDaDung")
    private Integer soLuongDaDung = 0;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai")
    private Boolean trangThai = true;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<LichSuVoucher> lichSuVouchers;
}
