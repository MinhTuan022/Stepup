package stepup.shoes.entity;

import java.util.Arrays;
import java.util.List;

public enum TrangThaiDonHang {
    CHO_XAC_NHAN("cho_xac_nhan"),
    CHUAN_BI_HANG("chuan_bi_hang"),
    YEU_CAU_HUY("yeu_cau_huy"),
    DANG_GIAO_HANG("dang_giao_hang"),
    DA_GIAO_HANG("da_giao_hang"),
    NHAN_THANH_CONG("nhan_thanh_cong"),
    HOAN_THANH("hoan_thanh"),
    HUY("huy");

    private final String code;

    TrangThaiDonHang(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static TrangThaiDonHang fromCode(String code) {
        if (code == null) return null;
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElse(null);
    }

    public static boolean isForwardTransition(String currentCode, String nextCode) {
        if (currentCode == null || nextCode == null) return false;
        List<String> order = Arrays.asList(
            CHO_XAC_NHAN.code,
            CHUAN_BI_HANG.code,
            YEU_CAU_HUY.code,
            DANG_GIAO_HANG.code,
            DA_GIAO_HANG.code,
            NHAN_THANH_CONG.code,
            HOAN_THANH.code,
            HUY.code
        );
        int cur = order.indexOf(currentCode);
        int nxt = order.indexOf(nextCode);
        if (cur == -1 || nxt == -1) return false;
        return nxt > cur; 
    }

    public static boolean canCancel(String currentCode) {
        if (currentCode == null) return false;
        return currentCode.equals(CHO_XAC_NHAN.code)
                || currentCode.equals(CHUAN_BI_HANG.code)
                || currentCode.equals(YEU_CAU_HUY.code);
    }
}
