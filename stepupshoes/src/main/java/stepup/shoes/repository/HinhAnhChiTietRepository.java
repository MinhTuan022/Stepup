package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.HinhAnhChiTiet;
import java.util.List;

@Repository
public interface HinhAnhChiTietRepository extends JpaRepository<HinhAnhChiTiet, Integer> {
    List<HinhAnhChiTiet> findByChiTietSanPham_MaChiTiet(Integer maChiTiet);
    List<HinhAnhChiTiet> findByChiTietSanPham_MaChiTietOrderByThuTuAsc(Integer maChiTiet);
}
