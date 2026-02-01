package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.LichSuTrangThaiDonHang;
import java.util.List;

@Repository
public interface LichSuTrangThaiDonHangRepository extends JpaRepository<LichSuTrangThaiDonHang, Integer> {
    List<LichSuTrangThaiDonHang> findByDonHang_MaDonHang(Integer maDonHang);
}
