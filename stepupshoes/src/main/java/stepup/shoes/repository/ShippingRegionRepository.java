package stepup.shoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stepup.shoes.entity.TinhThanh;

public interface ShippingRegionRepository extends JpaRepository<TinhThanh, String> {
}
