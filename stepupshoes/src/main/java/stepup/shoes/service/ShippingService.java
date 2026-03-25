package stepup.shoes.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import stepup.shoes.repository.ShippingRegionRepository;


@Service
public class ShippingService {

    private static final BigDecimal FREE_THRESHOLD = new BigDecimal("10000000");
    private static final BigDecimal FLAT_FEE = new BigDecimal("30000");
    private static final Map<String, BigDecimal> REGION_FEES = new HashMap<>();

    static {
        REGION_FEES.put("HN", new BigDecimal("0"));
        REGION_FEES.put("HCM", new BigDecimal("90000"));
        REGION_FEES.put("DN", new BigDecimal("65000"));
        REGION_FEES.put("HP", new BigDecimal("35000"));
        REGION_FEES.put("CT", new BigDecimal("100000"));
        REGION_FEES.put("HUE", new BigDecimal("65000"));

        REGION_FEES.put("LC", new BigDecimal("60000"));
        REGION_FEES.put("DB", new BigDecimal("60000"));
        REGION_FEES.put("SL", new BigDecimal("50000"));
        REGION_FEES.put("LS", new BigDecimal("45000"));
        REGION_FEES.put("QN", new BigDecimal("40000"));
        REGION_FEES.put("TH", new BigDecimal("45000"));
        REGION_FEES.put("NA", new BigDecimal("50000"));
        REGION_FEES.put("HT", new BigDecimal("55000"));
        REGION_FEES.put("CB", new BigDecimal("55000"));

        REGION_FEES.put("TQ", new BigDecimal("40000"));
        REGION_FEES.put("LCYB", new BigDecimal("50000"));
        REGION_FEES.put("BK", new BigDecimal("40000"));
        REGION_FEES.put("PT", new BigDecimal("30000"));
        REGION_FEES.put("BN", new BigDecimal("25000"));
        REGION_FEES.put("HY", new BigDecimal("25000"));
        REGION_FEES.put("NB", new BigDecimal("35000"));

        REGION_FEES.put("BD", new BigDecimal("90000"));
        REGION_FEES.put("BRVT", new BigDecimal("95000"));
        REGION_FEES.put("KH", new BigDecimal("80000"));
        REGION_FEES.put("DL", new BigDecimal("85000"));
        REGION_FEES.put("GL", new BigDecimal("80000"));
        REGION_FEES.put("LD", new BigDecimal("90000"));

        REGION_FEES.put("QT", new BigDecimal("60000"));
        REGION_FEES.put("QB", new BigDecimal("60000"));
        REGION_FEES.put("QNAM", new BigDecimal("70000"));
        REGION_FEES.put("QNG", new BigDecimal("70000"));
        REGION_FEES.put("BDINH", new BigDecimal("75000"));
        REGION_FEES.put("PY", new BigDecimal("75000"));

        REGION_FEES.put("LA", new BigDecimal("95000"));
        REGION_FEES.put("AG", new BigDecimal("105000"));
        REGION_FEES.put("KG", new BigDecimal("105000"));
        REGION_FEES.put("CM", new BigDecimal("120000"));
    }

    @Autowired(required = false)
    private ShippingRegionRepository shippingRegionRepository;

    public BigDecimal calculateFee(BigDecimal orderTotal, String regionCode) {
        if (orderTotal != null && orderTotal.compareTo(FREE_THRESHOLD) > 0) {
            return BigDecimal.ZERO;
        }

        if (regionCode != null && shippingRegionRepository != null) {
            return shippingRegionRepository.findById(regionCode.trim().toUpperCase())
                    .map(r -> r.getPhi())
                    .orElseGet(() -> REGION_FEES.getOrDefault(regionCode.trim().toUpperCase(), FLAT_FEE));
        }

        if (regionCode != null) {
            String rc = regionCode.trim().toUpperCase();
            if (REGION_FEES.containsKey(rc)) {
                return REGION_FEES.get(rc);
            }
        }

        return FLAT_FEE;
    }
}
