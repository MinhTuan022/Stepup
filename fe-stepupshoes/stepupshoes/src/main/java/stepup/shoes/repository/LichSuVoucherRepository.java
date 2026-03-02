package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.LichSuVoucher;
import java.util.List;

@Repository
public interface LichSuVoucherRepository extends JpaRepository<LichSuVoucher, Integer> {
    List<LichSuVoucher> findByDonHang_MaDonHang(Integer maDonHang);
    List<LichSuVoucher> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
}
