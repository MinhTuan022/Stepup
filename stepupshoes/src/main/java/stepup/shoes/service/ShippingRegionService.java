package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import stepup.shoes.entity.TinhThanh;
import stepup.shoes.repository.ShippingRegionRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingRegionService {
    private final ShippingRegionRepository repository;

    public List<TinhThanh> findAll() { return repository.findAll(); }

    public TinhThanh findByCode(String code) {
        return repository.findById(code).orElse(null);
    }

    public TinhThanh save(TinhThanh r) { return repository.save(r); }

    public void deleteByCode(String code) { repository.deleteById(code); }

    public BigDecimal getFeeOrNull(String code) {
        TinhThanh r = findByCode(code);
        return r != null ? r.getPhi() : null;
    }
}
