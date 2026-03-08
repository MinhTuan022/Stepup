package stepup.shoes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.*;
import stepup.shoes.service.AdminService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "API quản lý cho admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final AdminService adminService;

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng", description = "Lấy tất cả người dùng trong hệ thống (phân trang)")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = adminService.getAllUsers(page, size);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách người dùng thành công", result)
        );
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Lấy chi tiết người dùng", description = "Lấy thông tin chi tiết của một người dùng")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> getUserById(@PathVariable Integer id) {
        NguoiDungDTO user = adminService.getUserById(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thông tin người dùng thành công", user)
        );
    }

    @GetMapping("/users/search-by-phone")
    @Operation(summary = "Tìm người dùng theo số điện thoại", description = "Tìm kiếm thông tin người dùng bằng số điện thoại")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> searchUserByPhone(@RequestParam String phone) {
        NguoiDungDTO user = adminService.searchUserByPhone(phone);
        if (user != null) {
            return ResponseEntity.ok(
                new ApiResponseDTO<>(true, "Tìm thấy người dùng", user)
            );
        } else {
            return ResponseEntity.ok(
                new ApiResponseDTO<>(false, "Không tìm thấy người dùng", null)
            );
        }
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Cập nhật người dùng", description = "Cập nhật thông tin người dùng")
    public ResponseEntity<ApiResponseDTO<NguoiDungDTO>> updateUser(
            @PathVariable Integer id,
            @RequestBody NguoiDungDTO nguoiDungDTO) {
        NguoiDungDTO updatedUser = adminService.updateUser(id, nguoiDungDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật người dùng thành công", updatedUser)
        );
    }

    @PutMapping("/users/{id}/lock")
    @Operation(summary = "Khóa/Mở khóa tài khoản", description = "Khóa hoặc mở khóa tài khoản người dùng")
    public ResponseEntity<ApiResponseDTO<String>> lockUnlockUser(@PathVariable Integer id) {
        adminService.lockUnlockUser(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật trạng thái tài khoản thành công", null)
        );
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Xóa người dùng", description = "Xóa một người dùng khỏi hệ thống")
    public ResponseEntity<ApiResponseDTO<String>> deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Xóa người dùng thành công", null)
        );
    }

    // ==================== ORDER MANAGEMENT ====================

    @GetMapping("/orders")
    @Operation(summary = "Lấy danh sách đơn hàng", description = "Lấy tất cả đơn hàng trong hệ thống (phân trang)")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        Map<String, Object> result = adminService.getAllOrders(page, size, status);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách đơn hàng thành công", result)
        );
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Lấy chi tiết đơn hàng", description = "Lấy thông tin chi tiết của một đơn hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> getOrderById(@PathVariable Integer id) {
        DonHangDTO order = adminService.getOrderById(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thông tin đơn hàng thành công", order)
        );
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng", description = "Cập nhật trạng thái của đơn hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        DonHangDTO updatedOrder = adminService.updateOrderStatus(id, status);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật trạng thái đơn hàng thành công", updatedOrder)
        );
    }

    @PutMapping("/orders/{id}")
    @Operation(summary = "Cập nhật đơn hàng", description = "Cập nhật thông tin đơn hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> updateOrder(
            @PathVariable Integer id,
            @RequestBody DonHangDTO donHangDTO) {
        DonHangDTO updatedOrder = adminService.updateOrder(id, donHangDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật đơn hàng thành công", updatedOrder)
        );
    }

    @DeleteMapping("/orders/{id}")
    @Operation(summary = "Xóa đơn hàng", description = "Xóa một đơn hàng khỏi hệ thống")
    public ResponseEntity<ApiResponseDTO<String>> deleteOrder(@PathVariable Integer id) {
        adminService.deleteOrder(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Xóa đơn hàng thành công", null)
        );
    }

    // ==================== COUNTER ORDER (POS) MANAGEMENT ====================

    @PostMapping("/orders/tai-quay")
    @Operation(summary = "Tạo đơn hàng tại quầy", description = "Tạo đơn hàng mới cho bán hàng tại quầy POS")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> createCounterOrder(
            @RequestBody DonHangDTO donHangDTO) {
        DonHangDTO newOrder = adminService.createCounterOrder(donHangDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDTO<>(true, "Tạo đơn hàng tại quầy thành công", newOrder));
    }

    @PostMapping("/orders/{id}/items")
    @Operation(summary = "Thêm sản phẩm vào đơn", description = "Thêm chi tiết sản phẩm vào đơn hàng tại quầy")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> addItemToOrder(
            @PathVariable Integer id,
            @RequestBody ChiTietDonHangDTO itemDTO) {
        DonHangDTO updatedOrder = adminService.addItemToOrder(id, itemDTO);
        return ResponseEntity.ok(
                new ApiResponseDTO<>(true, "Thêm sản phẩm thành công", updatedOrder));
    }

    @DeleteMapping("/orders/{id}/items/{maChiTiet}")
    @Operation(summary = "Xóa sản phẩm khỏi đơn", description = "Xóa chi tiết sản phẩm khỏi đơn hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> removeItemFromOrder(
            @PathVariable Integer id,
            @PathVariable Integer maChiTiet) {
        DonHangDTO updatedOrder = adminService.removeItemFromOrder(id, maChiTiet);
        return ResponseEntity.ok(
                new ApiResponseDTO<>(true, "Xóa sản phẩm thành công", updatedOrder));
    }

    @PostMapping("/orders/{id}/voucher")
    @Operation(summary = "Áp dụng voucher vào đơn", description = "Áp dụng mã voucher vào đơn hàng tại quầy")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> applyVoucherToOrder(
            @PathVariable Integer id,
            @RequestParam String code) {
        DonHangDTO updatedOrder = adminService.applyVoucherToOrder(id, code);
        return ResponseEntity.ok(
                new ApiResponseDTO<>(true, "Áp dụng voucher thành công", updatedOrder));
    }

    @PutMapping("/orders/{id}/finalize")
    @Operation(summary = "Hoàn thành đơn hàng tại quầy", description = "Hoàn thành và thanh toán đơn hàng")
    public ResponseEntity<ApiResponseDTO<DonHangDTO>> finalizeCounterOrder(
            @PathVariable Integer id,
            @RequestParam String phuongThucThanhToan) {
        DonHangDTO updatedOrder = adminService.finalizeCounterOrder(id, phuongThucThanhToan);
        return ResponseEntity.ok(
                new ApiResponseDTO<>(true, "Hoàn thành đơn hàng tại quầy thành công", updatedOrder));
    }

    // ==================== VOUCHER MANAGEMENT ====================

    @GetMapping("/vouchers")
    @Operation(summary = "Lấy danh sách voucher", description = "Lấy tất cả voucher trong hệ thống (phân trang)")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getAllVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = adminService.getAllVouchers(page, size);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách voucher thành công", result)
        );
    }

    @GetMapping("/vouchers/{id}")
    @Operation(summary = "Lấy chi tiết voucher", description = "Lấy thông tin chi tiết của một voucher")
    public ResponseEntity<ApiResponseDTO<VoucherDTO>> getVoucherById(@PathVariable Integer id) {
        VoucherDTO voucher = adminService.getVoucherById(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thông tin voucher thành công", voucher)
        );
    }

    @PostMapping("/vouchers")
    @Operation(summary = "Tạo voucher mới", description = "Tạo một voucher mới")
    public ResponseEntity<ApiResponseDTO<VoucherDTO>> createVoucher(@RequestBody VoucherDTO voucherDTO) {
        VoucherDTO createdVoucher = adminService.createVoucher(voucherDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponseDTO<>(true, "Tạo voucher thành công", createdVoucher));
    }

    @PutMapping("/vouchers/{id}")
    @Operation(summary = "Cập nhật voucher", description = "Cập nhật thông tin voucher")
    public ResponseEntity<ApiResponseDTO<VoucherDTO>> updateVoucher(
            @PathVariable Integer id,
            @RequestBody VoucherDTO voucherDTO) {
        VoucherDTO updatedVoucher = adminService.updateVoucher(id, voucherDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật voucher thành công", updatedVoucher)
        );
    }

    @DeleteMapping("/vouchers/{id}")
    @Operation(summary = "Xóa voucher", description = "Xóa một voucher khỏi hệ thống")
    public ResponseEntity<ApiResponseDTO<String>> deleteVoucher(@PathVariable Integer id) {
        adminService.deleteVoucher(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Xóa voucher thành công", null)
        );
    }

    // ==================== STATISTICS & REPORTING ====================

    @GetMapping("/statistics/overview")
    @Operation(summary = "Tổng quan thống kê", description = "Lấy thông tin tổng quan về bán hàng, người dùng, đơn hàng")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getStatisticsOverview() {
        Map<String, Object> stats = adminService.getStatisticsOverview();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thông tin thống kê thành công", stats)
        );
    }

    @GetMapping("/statistics/revenue")
    @Operation(summary = "Thống kê doanh thu", description = "Lấy doanh thu theo ngày/tháng/năm")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getRevenueStatistics(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        Map<String, Object> revenue = adminService.getRevenueStatistics(fromDate, toDate);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thống kê doanh thu thành công", revenue)
        );
    }

    @GetMapping("/statistics/orders")
    @Operation(summary = "Thống kê đơn hàng", description = "Lấy thống kê số đơn hàng, trạng thái đơn hàng")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getOrderStatistics() {
        Map<String, Object> orderStats = adminService.getOrderStatistics();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thống kê đơn hàng thành công", orderStats)
        );
    }

    @GetMapping("/statistics/products")
    @Operation(summary = "Thống kê sản phẩm", description = "Lấy thống kê sản phẩm bán chạy, tồn kho")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getProductStatistics() {
        Map<String, Object> productStats = adminService.getProductStatistics();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thống kê sản phẩm thành công", productStats)
        );
    }

    @GetMapping("/statistics/users")
    @Operation(summary = "Thống kê người dùng", description = "Lấy thống kê số người dùng, người dùng mới")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getUserStatistics() {
        Map<String, Object> userStats = adminService.getUserStatistics();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy thống kê người dùng thành công", userStats)
        );
    }

    @GetMapping("/statistics/top-products")
    @Operation(summary = "Sản phẩm bán chạy", description = "Lấy danh sách sản phẩm bán chạy nhất")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> topProducts = adminService.getTopProducts(limit);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách sản phẩm bán chạy thành công", topProducts)
        );
    }

    // ==================== PRODUCT REVIEWS ====================

    @GetMapping("/reviews")
    @Operation(summary = "Lấy danh sách đánh giá", description = "Lấy tất cả đánh giá sản phẩm (phân trang)")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status) {
        Map<String, Object> result = adminService.getAllReviews(page, size, status);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách đánh giá thành công", result)
        );
    }

    @PutMapping("/reviews/{id}/approve")
    @Operation(summary = "Duyệt đánh giá", description = "Duyệt một đánh giá sản phẩm")
    public ResponseEntity<ApiResponseDTO<String>> approveReview(@PathVariable Integer id) {
        adminService.approveReview(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Duyệt đánh giá thành công", null)
        );
    }

    @PutMapping("/reviews/{id}/reject")
    @Operation(summary = "Từ chối đánh giá", description = "Từ chối một đánh giá sản phẩm")
    public ResponseEntity<ApiResponseDTO<String>> rejectReview(@PathVariable Integer id) {
        adminService.rejectReview(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Từ chối đánh giá thành công", null)
        );
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Xóa đánh giá", description = "Xóa một đánh giá sản phẩm")
    public ResponseEntity<ApiResponseDTO<String>> deleteReview(@PathVariable Integer id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Xóa đánh giá thành công", null)
        );
    }

    // ==================== CONFIGURATION ====================

    @GetMapping("/system-config")
    @Operation(summary = "Lấy cấu hình hệ thống", description = "Lấy các thông tin cấu hình hệ thống")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getSystemConfig() {
        Map<String, Object> config = adminService.getSystemConfig();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy cấu hình hệ thống thành công", config)
        );
    }

    @PutMapping("/system-config")
    @Operation(summary = "Cập nhật cấu hình hệ thống", description = "Cập nhật các thông tin cấu hình hệ thống")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> updateSystemConfig(
            @RequestBody Map<String, Object> config) {
        Map<String, Object> updatedConfig = adminService.updateSystemConfig(config);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật cấu hình hệ thống thành công", updatedConfig)
        );
    }

    // ==================== PRODUCT DETAILS FOR POS ====================

    @GetMapping("/products/details")
    @Operation(summary = "Lấy danh sách chi tiết sản phẩm", description = "Lấy danh sách chi tiết sản phẩm cho hệ thống POS (kích cỡ, màu sắc, giá bán)")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getProductDetails() {
        Map<String, Object> result = adminService.getProductDetails();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách chi tiết sản phẩm thành công", result)
        );
    }

    // ==================== ACTIVITY LOG ====================

    @GetMapping("/activity-logs")
    @Operation(summary = "Lấy nhật ký hoạt động", description = "Lấy nhật ký hoạt động của admin (phân trang)")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = adminService.getActivityLogs(page, size);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy nhật ký hoạt động thành công", result)
        );
    }
}
