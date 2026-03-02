package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.ChiTietSanPham;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietSanPhamRepository extends JpaRepository<ChiTietSanPham, Integer> {
    List<ChiTietSanPham> findBySanPham_MaSanPham(Integer maSanPham);
    Optional<ChiTietSanPham> findByMaSKU(String maSKU);
    List<ChiTietSanPham> findBySanPhamAndMauSacAndSize(Integer sanPhampId, String mauSac, String size);
    List<ChiTietSanPham> findByTrangThaiTrue();
    List<ChiTietSanPham> findBySoLuongTonGreaterThan(Integer soLuong);
}
