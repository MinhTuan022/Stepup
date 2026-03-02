package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.DonHang;
import stepup.shoes.entity.NguoiDung;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {
    List<DonHang> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
    List<DonHang> findByNguoiDung(NguoiDung nguoiDung);
    List<DonHang> findByNguoiDungAndTrangThaiDonHang(NguoiDung nguoiDung, String trangThaiDonHang);
    List<DonHang> findByTrangThaiDonHang(String trangThaiDonHang);
    List<DonHang> findByTrangThaiThanhToan(String trangThaiThanhToan);
    List<DonHang> findByNgayDatHangBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT dh FROM DonHang dh LEFT JOIN FETCH dh.chiTietDonHangs WHERE dh.maDonHang = :maDonHang")
    Optional<DonHang> findByIdWithChiTiet(@Param("maDonHang") Integer maDonHang);
}
