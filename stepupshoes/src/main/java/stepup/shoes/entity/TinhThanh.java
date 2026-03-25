package stepup.shoes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "TinhThanh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TinhThanh {
    @Id
    @Column(name = "MaTinh", length = 50)
    private String maTinh;

    @Column(name = "TenTinh", columnDefinition = "NVARCHAR(255)")
    private String tenTinh;

    @Column(name = "Loai", columnDefinition = "NVARCHAR(50)")
    private String loai;

    @Column(name = "VungCha", columnDefinition = "NVARCHAR(255)")
    private String vungCha;

    @Column(name = "Phi", precision = 18, scale = 2)
    private BigDecimal phi;
}
