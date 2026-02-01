package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.GioHang;
import java.util.List;
import java.util.Optional;

@Repository
public interface GioHangRepository extends JpaRepository<GioHang, Integer> {
    List<GioHang> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
    Optional<GioHang> findByNguoiDung_MaNguoiDungAndChiTietSanPham_MaChiTiet(Integer maNguoiDung, Integer maChiTiet);
    void deleteByNguoiDung_MaNguoiDung(Integer maNguoiDung);
}
