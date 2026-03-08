package stepup.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "DanhMuc")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhMuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDanhMuc")
    private Integer maDanhMuc;

    @Column(name = "TenDanhMuc", nullable = false, length = 100)
    private String tenDanhMuc;

    @Column(name = "MoTa", length = 500)
    private String moTa;

    @Column(name = "MaDanhMucCha")
    private Integer maDanhMucCha;

    @Column(name = "TrangThai")
    @Builder.Default
    private Boolean trangThai = true;

    @Column(name = "NgayTao")
    @Builder.Default
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "DaXoa")
    @Builder.Default
    private Boolean daXoa = false;

    @Column(name = "NgayXoa")
    private LocalDateTime ngayXoa;

    @ManyToOne
    @JoinColumn(name = "NguoiXoa")
    private NguoiDung nguoiXoa;

    @OneToMany(mappedBy = "danhMuc", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<SanPham> sanPhams;
}
