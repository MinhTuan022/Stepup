package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.DonHang;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {
    List<DonHang> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
    List<DonHang> findByTrangThaiDonHang(String trangThaiDonHang);
    List<DonHang> findByTrangThaiThanhToan(String trangThaiThanhToan);
    List<DonHang> findByNgayDatHangBetween(LocalDateTime startDate, LocalDateTime endDate);
}
