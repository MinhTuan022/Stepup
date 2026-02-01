package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.DanhGia;
import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    List<DanhGia> findByChiTietSanPham_MaChiTiet(Integer maChiTiet);
    List<DanhGia> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);
    List<DanhGia> findByTrangThaiTrue();
    Double findAverageDiemByChiTietSanPham_MaChiTiet(Integer maChiTiet);
}
