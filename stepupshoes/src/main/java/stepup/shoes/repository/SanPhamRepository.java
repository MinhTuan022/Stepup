package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.SanPham;
import java.util.List;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {
    List<SanPham> findByDanhMuc_MaDanhMuc(Integer maDanhMuc);
    List<SanPham> findByTrangThaiTrue();
    List<SanPham> findByTenSanPhamContainingIgnoreCase(String tenSanPham);
    List<SanPham> findByThuongHieuContainingIgnoreCase(String thuongHieu);
}
