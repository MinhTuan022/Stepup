package stepup.shoes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.ApiResponseDTO;
import stepup.shoes.dto.CreateOrderRequestDTO;
import stepup.shoes.dto.DonHangDTO;
import stepup.shoes.dto.NguoiDungDTO;
import stepup.shoes.dto.VoucherValidationDTO;
import stepup.shoes.service.UserService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "API quản lý thông tin người dùng")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}/profile")
    @Operation(summary = "Lấy thông tin người dùng", description = "Lấy thông tin chi tiết của người dùng")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> getUserProfile(@PathVariable Integer id) {
        NguoiDungDTO user = userService.getUserProfile(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thông tin người dùng thành công", user)
        );
    }

    @PutMapping("/{id}/profile")
    @Operation(summary = "Cập nhật thông tin người dùng", description = "Cập nhật thông tin cá nhân của người dùng")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> updateUserProfile(
            @PathVariable Integer id,
            @RequestBody NguoiDungDTO nguoiDungDTO) {
        NguoiDungDTO updatedUser = userService.updateUserProfile(id, nguoiDungDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật thông tin thành công", updatedUser)
        );
    }

    @PostMapping("/{id}/change-password")
    @Operation(summary = "Đổi mật khẩu", description = "Thay đổi mật khẩu người dùng")
    public ResponseEntity<ApiResponseDTO<String>> changePassword(
            @PathVariable Integer id,
            @RequestBody Map<String, String> passwords) {
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");
        userService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Đổi mật khẩu thành công", null)
        );
    }

    @GetMapping("/{id}/orders")
    @Operation(summary = "Lấy danh sách đơn hàng", description = "Lấy danh sách đơn hàng của người dùng")
    public ResponseEntity<ApiResponseDTO<List<DonHangDTO>>> getUserOrders(
            @PathVariable Integer id,
            @RequestParam(required = false) String status) {
        List<DonHangDTO> orders = userService.getUserOrders(id, status);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách đơn hàng thành công", orders)
        );
    }

    @GetMapping("/{id}/orders/{orderId}")
    @Operation(summary = "Lấy chi tiết đơn hàng", description = "Lấy thông tin chi tiết của một đơn hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> getOrderDetail(
            @PathVariable Integer id,
            @PathVariable Integer orderId) {
        DonHangDTO order = userService.getOrderDetail(orderId);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy chi tiết đơn hàng thành công", order)
        );
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Lấy thống kê đơn hàng", description = "Lấy thống kê về đơn hàng của người dùng")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getUserOrderStats(@PathVariable Integer id) {
        Map<String, Object> stats = userService.getUserOrderStats(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thống kê thành công", stats)
        );
    }

    @PostMapping("/validate-voucher")
    @Operation(summary = "Validate voucher", description = "Kiểm tra và tính toán giảm giá từ mã voucher")
    public ResponseEntity<ApiResponseDTO<VoucherValidationDTO>> validateVoucher(
            @RequestBody Map<String, Object> request) {
        String voucherCode = (String) request.get("code");
        BigDecimal tongTien = new BigDecimal(request.get("tongTien").toString());
        
        VoucherValidationDTO result = userService.validateVoucher(voucherCode, tongTien);
        
        return ResponseEntity.ok(
            new ApiResponseDTO<>(result.getValid(), result.getMessage(), result)
        );
    }

    @PostMapping("/{id}/applicable-vouchers")
    @Operation(summary = "Get applicable vouchers", description = "Lấy danh sách voucher khả dụng và kết quả validate cho tổng tiền")
    public ResponseEntity<ApiResponseDTO<java.util.List<VoucherValidationDTO>>> getApplicableVouchers(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        BigDecimal tongTien = new BigDecimal(request.get("tongTien").toString());
        java.util.List<VoucherValidationDTO> list = userService.getApplicableVouchers(tongTien);
        return ResponseEntity.ok(
                new ApiResponseDTO<>(true, "Danh sách voucher áp dụng", list)
        );
    }

    @PostMapping("/{id}/orders")
    @Operation(summary = "Tạo đơn hàng mới", description = "Tạo đơn hàng online từ giỏ hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> createOrder(
            @PathVariable Integer id,
            @RequestBody CreateOrderRequestDTO requestDTO) {
        requestDTO.setMaNguoiDung(id);
        DonHangDTO order = userService.createOrder(requestDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Tạo đơn hàng thành công", order)
        );
    }

    @PutMapping("/{id}/orders/{orderId}/cancel")
    @Operation(summary = "Hủy đơn hàng bởi khách hàng", description = "Khách hàng hủy đơn của chính họ khi đơn đang chờ xác nhận")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> cancelOrder(
            @PathVariable Integer id,
            @PathVariable Integer orderId,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String lyDo = null;
        if (body != null) lyDo = body.get("lyDo");
        DonHangDTO updated = userService.cancelOrder(id, orderId, lyDo);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Hủy đơn hàng thành công", updated)
        );
    }
}
