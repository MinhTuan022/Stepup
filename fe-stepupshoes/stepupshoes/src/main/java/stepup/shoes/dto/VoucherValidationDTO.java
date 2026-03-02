package stepup.shoes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho kết quả validate voucher
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherValidationDTO {
    
    private Boolean valid; // Voucher có hợp lệ không
    
    private String message; // Thông báo lỗi hoặc thành công
    
    private String code; // Mã voucher
    
    private String moTa; // Mô tả voucher
    
    private String loaiGiam; // Loại giảm giá: phan_tram, tien_mat
    
    private BigDecimal giaTriGiam; // Giá trị giảm
    
    private BigDecimal giamToiDa; // Giảm tối đa (cho % discount)
    
    private BigDecimal giaTriToiThieu; // Giá trị đơn hàng tối thiểu
    
    private BigDecimal soTienGiam; // Số tiền được giảm (calculated)
    
    private BigDecimal tongTien; // Tổng tiền đơn hàng
    
    private BigDecimal thanhTien; // Thành tiền sau giảm
}
