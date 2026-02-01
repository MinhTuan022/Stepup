package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stepup.shoes.entity.DanhMuc;
import java.util.List;

@Repository
public interface DanhMucRepository extends JpaRepository<DanhMuc, Integer> {
    List<DanhMuc> findByTrangThaiTrue();
    List<DanhMuc> findByMaDanhMucCha(Integer maDanhMucCha);
}
