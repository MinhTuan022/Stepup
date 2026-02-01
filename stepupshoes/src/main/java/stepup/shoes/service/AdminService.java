package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stepup.shoes.dto.*;
import stepup.shoes.entity.*;
import stepup.shoes.exception.ResourceNotFoundException;
import stepup.shoes.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final NguoiDungRepository nguoiDungRepository;
    private final DonHangRepository donHangRepository;
    private final VoucherRepository voucherRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final SanPhamRepository sanPhamRepository;
    private final LichSuTrangThaiDonHangRepository lichSuTrangThaiDonHangRepository;
    private final LichSuVoucherRepository lichSuVoucherRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    // ==================== USER MANAGEMENT ====================

    public Map<String, Object> getAllUsers(int page, int size) {
        int totalUsers = (int) nguoiDungRepository.count();
        List<NguoiDungDTO> users = nguoiDungRepository.findAll().stream()
                .map(this::convertToNguoiDungDTO)
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("totalUsers", totalUsers);
        result.put("totalPages", (int) Math.ceil((double) totalUsers / size));
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }

    public NguoiDungDTO getUserById(Integer id) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return convertToNguoiDungDTO(user);
    }

    public NguoiDungDTO updateUser(Integer id, NguoiDungDTO nguoiDungDTO) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        if (nguoiDungDTO.getHoTen() != null) user.setHoTen(nguoiDungDTO.getHoTen());
        if (nguoiDungDTO.getEmail() != null) user.setEmail(nguoiDungDTO.getEmail());
        if (nguoiDungDTO.getSoDienThoai() != null) user.setSoDienThoai(nguoiDungDTO.getSoDienThoai());
        if (nguoiDungDTO.getDiaChi() != null) user.setDiaChi(nguoiDungDTO.getDiaChi());
        if (nguoiDungDTO.getVaiTro() != null) user.setVaiTro(nguoiDungDTO.getVaiTro());
        
        user.setNgayCapNhat(LocalDateTime.now());
        NguoiDung updatedUser = nguoiDungRepository.save(user);
        return convertToNguoiDungDTO(updatedUser);
    }

    public void lockUnlockUser(Integer id) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        user.setTrangThai(!user.getTrangThai());
        user.setNgayCapNhat(LocalDateTime.now());
        nguoiDungRepository.save(user);
    }

    public void deleteUser(Integer id) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        nguoiDungRepository.delete(user);
    }

    // ==================== ORDER MANAGEMENT ====================

    public Map<String, Object> getAllOrders(int page, int size, String status) {
        List<DonHang> orders;
        if (status != null && !status.isEmpty()) {
            orders = donHangRepository.findByTrangThaiDonHang(status);
        } else {
            orders = donHangRepository.findAll();
        }
        
        int totalOrders = orders.size();
        List<DonHangDTO> orderList = orders.stream()
                .map(this::convertToDonHangDTO)
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("orders", orderList);
        result.put("totalOrders", totalOrders);
        result.put("totalPages", (int) Math.ceil((double) totalOrders / size));
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }

    public DonHangDTO getOrderById(Integer id) {
        DonHang order = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        return convertToDonHangDTO(order);
    }

    public DonHangDTO updateOrderStatus(Integer id, String status) {
        DonHang order = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        order.setTrangThaiDonHang(status);
        order.setNgayCapNhat(LocalDateTime.now());
        DonHang updatedOrder = donHangRepository.save(order);
        return convertToDonHangDTO(updatedOrder);
    }

    public DonHangDTO updateOrder(Integer id, DonHangDTO donHangDTO) {
        DonHang order = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        if (donHangDTO.getTrangThaiDonHang() != null) order.setTrangThaiDonHang(donHangDTO.getTrangThaiDonHang());
        if (donHangDTO.getDiaChiGiaoHang() != null) order.setDiaChiGiaoHang(donHangDTO.getDiaChiGiaoHang());
        if (donHangDTO.getSoDienThoaiNhan() != null) order.setSoDienThoaiNhan(donHangDTO.getSoDienThoaiNhan());
        if (donHangDTO.getGhiChu() != null) order.setGhiChu(donHangDTO.getGhiChu());
        
        order.setNgayCapNhat(LocalDateTime.now());
        DonHang updatedOrder = donHangRepository.save(order);
        return convertToDonHangDTO(updatedOrder);
    }

    public void deleteOrder(Integer id) {
        DonHang order = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        donHangRepository.delete(order);
    }

    // ==================== COUNTER ORDER MANAGEMENT ====================

    /**
     * Tạo đơn hàng mới tại quầy (POS)
     * Hỗ trợ cả khách hàng đã đăng ký (maNguoiDung > 0) và khách vãng lai (maNguoiDung = 0)
     */
    public DonHangDTO createCounterOrder(DonHangDTO donHangDTO) {
        NguoiDung user = null;
        
        // Kiểm tra nếu là khách hàng đã đăng ký
        if (donHangDTO.getMaNguoiDung() != null && donHangDTO.getMaNguoiDung() > 0) {
            user = nguoiDungRepository.findById(donHangDTO.getMaNguoiDung())
                    .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        }
        // Nếu maNguoiDung = 0 hoặc null, là khách vãng lai, không cần tìm user
        
        // Tạo đơn hàng mới
        DonHang donHang = new DonHang();
        if (user != null) {
            donHang.setNguoiDung(user);
        }
        donHang.setLoaiDonHang("tai_quay");  // Loại đơn hàng tại quầy
        donHang.setTrangThaiDonHang("dat_hang");
        donHang.setTrangThaiThanhToan("chua_thanh_toan");
        donHang.setDiaChiGiaoHang(donHangDTO.getDiaChiGiaoHang() != null ? 
                donHangDTO.getDiaChiGiaoHang() : "Tại quầy");
        donHang.setNguoiNhan(donHangDTO.getNguoiNhan());
        donHang.setSoDienThoaiNhan(donHangDTO.getSoDienThoaiNhan());
        donHang.setTongTien(BigDecimal.ZERO);
        donHang.setPhiVanChuyen(BigDecimal.ZERO);
        donHang.setGiamGia(BigDecimal.ZERO);
        donHang.setThanhTien(BigDecimal.ZERO);
        donHang.setNgayDatHang(LocalDateTime.now());
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        DonHang savedOrder = donHangRepository.save(donHang);
        return convertToDonHangDTO(savedOrder);
    }

    /**
     * Thêm sản phẩm vào đơn hàng tại quầy
     */
    public DonHangDTO addItemToOrder(Integer donHangId, ChiTietDonHangDTO itemDTO) {
        // Kiểm tra đơn hàng
        DonHang donHang = donHangRepository.findById(donHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        // Kiểm tra chi tiết sản phẩm
        ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(itemDTO.getMaChiTiet())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        // Kiểm tra tồn kho
        if (chiTietSanPham.getSoLuongTon() < itemDTO.getSoLuong()) {
            throw new IllegalArgumentException(
                    "Không đủ số lượng tồn kho. Tồn kho: " + chiTietSanPham.getSoLuongTon() + 
                    ", Yêu cầu: " + itemDTO.getSoLuong());
        }
        
        // Tính thành tiền
        BigDecimal donGia = chiTietSanPham.getGiaBan();
        BigDecimal thanhTien = donGia.multiply(new BigDecimal(itemDTO.getSoLuong()));
        
        // Tạo chi tiết đơn hàng
        ChiTietDonHang chiTietDonHang = new ChiTietDonHang();
        chiTietDonHang.setDonHang(donHang);
        chiTietDonHang.setChiTietSanPham(chiTietSanPham);
        chiTietDonHang.setSoLuong(itemDTO.getSoLuong());
        chiTietDonHang.setDonGia(donGia);
        chiTietDonHang.setThanhTien(thanhTien);
        
        chiTietDonHangRepository.save(chiTietDonHang);
        
        // Cập nhật tổng tiền đơn hàng
        updateOrderTotals(donHangId);
        
        DonHang updatedOrder = donHangRepository.findById(donHangId).get();
        return convertToDonHangDTO(updatedOrder);
    }

    /**
     * Xóa sản phẩm khỏi đơn hàng
     */
    public DonHangDTO removeItemFromOrder(Integer donHangId, Integer maChiTiet) {
        DonHang donHang = donHangRepository.findById(donHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        // Tìm và xóa chi tiết
        donHang.getChiTietDonHangs().stream()
                .filter(detail -> detail.getChiTietSanPham().getMaChiTiet().equals(maChiTiet))
                .findFirst()
                .ifPresent(chiTietDonHangRepository::delete);
        
        // Cập nhật tổng tiền
        updateOrderTotals(donHangId);
        
        DonHang updatedOrder = donHangRepository.findById(donHangId).get();
        return convertToDonHangDTO(updatedOrder);
    }

    /**
     * Áp dụng voucher vào đơn hàng
     */
    public DonHangDTO applyVoucherToOrder(Integer donHangId, String voucherCode) {
        DonHang donHang = donHangRepository.findById(donHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        // Tìm voucher theo code
        Voucher voucher = voucherRepository.findAll().stream()
                .filter(v -> v.getCode().equalsIgnoreCase(voucherCode) && v.getTrangThai())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Voucher không hợp lệ"));
        
        // Kiểm tra ngày áp dụng
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getNgayBatDau()) || now.isAfter(voucher.getNgayKetThuc())) {
            throw new IllegalArgumentException("Voucher không còn hiệu lực");
        }
        
        // Kiểm tra số lượng
        if (voucher.getSoLuong() != null && voucher.getSoLuongDaDung() >= voucher.getSoLuong()) {
            throw new IllegalArgumentException("Voucher đã hết");
        }
        
        // Kiểm tra tổng tiền tối thiểu
        if (donHang.getTongTien().compareTo(voucher.getGiaTriToiThieu()) < 0) {
            throw new IllegalArgumentException("Tổng đơn hàng không đủ điều kiện áp dụng voucher");
        }
        
        // Tính giảm giá
        BigDecimal giamGia = BigDecimal.ZERO;
        if ("phan_tram".equals(voucher.getLoaiGiam())) {
            // Giảm theo phần trăm
            giamGia = donHang.getTongTien()
                    .multiply(voucher.getGiaTriGiam())
                    .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
        } else {
            // Giảm theo số tiền cố định
            giamGia = voucher.getGiaTriGiam();
        }
        
        // Không được giảm quá giảm tối đa
        if (voucher.getGiamToiDa() != null && giamGia.compareTo(voucher.getGiamToiDa()) > 0) {
            giamGia = voucher.getGiamToiDa();
        }
        
        // Cập nhật đơn hàng
        donHang.setGiamGia(giamGia);
        donHang.setThanhTien(donHang.getTongTien()
                .subtract(giamGia)
                .add(donHang.getPhiVanChuyen()));
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        DonHang updatedOrder = donHangRepository.save(donHang);
        
        // Lưu lịch sử sử dụng voucher (chỉ lưu nếu có người dùng)
        if (donHang.getNguoiDung() != null) {
            LichSuVoucher lichSu = new LichSuVoucher();
            lichSu.setVoucher(voucher);
            lichSu.setDonHang(updatedOrder);
            lichSu.setNguoiDung(donHang.getNguoiDung());
            lichSu.setGiaTriGiam(giamGia);
            lichSu.setNgaySuDung(LocalDateTime.now());
            lichSuVoucherRepository.save(lichSu);
        }
        
        // Tăng số lượng đã dùng
        voucher.setSoLuongDaDung(voucher.getSoLuongDaDung() + 1);
        voucherRepository.save(voucher);
        
        return convertToDonHangDTO(updatedOrder);
    }

    /**
     * Hoàn thành đơn hàng tại quầy (thanh toán)
     */
    public DonHangDTO finalizeCounterOrder(Integer donHangId, String phuongThucThanhToan) {
        DonHang donHang = donHangRepository.findById(donHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        // Kiểm tra phương thức thanh toán hợp lệ
        String[] validMethods = {"tien_mat", "chuyen_khoan", "the_tin_dung", "vi_dien_tu"};
        boolean isValid = false;
        for (String method : validMethods) {
            if (method.equals(phuongThucThanhToan)) {
                isValid = true;
                break;
            }
        }
        if (!isValid) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
        }
        
        // Cập nhật đơn hàng
        donHang.setPhuongThucThanhToan(phuongThucThanhToan);
        donHang.setTrangThaiThanhToan("da_thanh_toan");
        donHang.setTrangThaiDonHang("hoan_thanh");
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        DonHang updatedOrder = donHangRepository.save(donHang);
        
        // Lưu lịch sử trạng thái
        LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang();
        lichSu.setDonHang(updatedOrder);
        lichSu.setTrangThaiCu("dat_hang");
        lichSu.setTrangThaiMoi("hoan_thanh");
        lichSu.setGhiChu("Hoàn thành đơn hàng tại quầy - " + phuongThucThanhToan);
        lichSu.setNguoiCapNhat(updatedOrder.getNguoiDung()); // Có thể null cho khách vãng lai
        lichSu.setNgayCapNhat(LocalDateTime.now());
        lichSuTrangThaiDonHangRepository.save(lichSu);
        
        // Cập nhật lại tồn kho
        updateInventoryAfterOrder(donHangId);
        
        return convertToDonHangDTO(updatedOrder);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Cập nhật tổng tiền đơn hàng dựa trên chi tiết
     */
    private void updateOrderTotals(Integer donHangId) {
        DonHang donHang = donHangRepository.findById(donHangId).get();
        
        // Tính tổng tiền từ chi tiết
        BigDecimal tongTien = donHang.getChiTietDonHangs().stream()
                .map(ChiTietDonHang::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        donHang.setTongTien(tongTien);
        
        // Tính thành tiền = Tổng tiền - Giảm giá + Phí vận chuyển
        BigDecimal thanhTien = tongTien
                .subtract(donHang.getGiamGia() != null ? donHang.getGiamGia() : BigDecimal.ZERO)
                .add(donHang.getPhiVanChuyen() != null ? donHang.getPhiVanChuyen() : BigDecimal.ZERO);
        
        donHang.setThanhTien(thanhTien);
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        donHangRepository.save(donHang);
    }

    /**
     * Cập nhật lại tồn kho sau khi đơn hàng hoàn thành
     */
    private void updateInventoryAfterOrder(Integer donHangId) {
        DonHang donHang = donHangRepository.findById(donHangId).get();
        
        donHang.getChiTietDonHangs().forEach(chiTietDonHang -> {
            ChiTietSanPham chiTietSanPham = chiTietDonHang.getChiTietSanPham();
            int soLuongTonMoi = chiTietSanPham.getSoLuongTon() - chiTietDonHang.getSoLuong();
            
            chiTietSanPham.setSoLuongTon(Math.max(0, soLuongTonMoi));
            
            // Cập nhật trạng thái nếu hết hàng
            if (soLuongTonMoi <= 0) {
                chiTietSanPham.setTrangThai(false);
            }
            
            chiTietSanPham.setNgayCapNhat(LocalDateTime.now());
            chiTietSanPhamRepository.save(chiTietSanPham);
        });
    }

    public Map<String, Object> getAllVouchers(int page, int size) {
        List<Voucher> vouchers = voucherRepository.findAll();
        int totalVouchers = vouchers.size();
        
        List<VoucherDTO> voucherList = vouchers.stream()
                .map(this::convertToVoucherDTO)
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("vouchers", voucherList);
        result.put("totalVouchers", totalVouchers);
        result.put("totalPages", (int) Math.ceil((double) totalVouchers / size));
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }

    public VoucherDTO getVoucherById(Integer id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        return convertToVoucherDTO(voucher);
    }

    public VoucherDTO createVoucher(VoucherDTO voucherDTO) {
        Voucher voucher = new Voucher();
        voucher.setCode(voucherDTO.getCode());
        voucher.setMoTa(voucherDTO.getMoTa());
        voucher.setGiaTriGiam(voucherDTO.getGiaTriGiam());
        voucher.setLoaiGiam(voucherDTO.getLoaiGiam());
        voucher.setGiaTriToiThieu(voucherDTO.getGiaTriToiThieu());
        voucher.setGiamToiDa(voucherDTO.getGiamToiDa());
        voucher.setNgayBatDau(voucherDTO.getNgayBatDau());
        voucher.setNgayKetThuc(voucherDTO.getNgayKetThuc());
        voucher.setSoLuong(voucherDTO.getSoLuong());
        voucher.setTrangThai(true);
        voucher.setNgayTao(LocalDateTime.now());
        
        Voucher savedVoucher = voucherRepository.save(voucher);
        return convertToVoucherDTO(savedVoucher);
    }

    public VoucherDTO updateVoucher(Integer id, VoucherDTO voucherDTO) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        
        if (voucherDTO.getCode() != null) voucher.setCode(voucherDTO.getCode());
        if (voucherDTO.getMoTa() != null) voucher.setMoTa(voucherDTO.getMoTa());
        if (voucherDTO.getGiaTriGiam() != null) voucher.setGiaTriGiam(voucherDTO.getGiaTriGiam());
        if (voucherDTO.getLoaiGiam() != null) voucher.setLoaiGiam(voucherDTO.getLoaiGiam());
        if (voucherDTO.getGiaTriToiThieu() != null) voucher.setGiaTriToiThieu(voucherDTO.getGiaTriToiThieu());
        if (voucherDTO.getGiamToiDa() != null) voucher.setGiamToiDa(voucherDTO.getGiamToiDa());
        if (voucherDTO.getNgayBatDau() != null) voucher.setNgayBatDau(voucherDTO.getNgayBatDau());
        if (voucherDTO.getNgayKetThuc() != null) voucher.setNgayKetThuc(voucherDTO.getNgayKetThuc());
        if (voucherDTO.getSoLuong() != null) voucher.setSoLuong(voucherDTO.getSoLuong());
        
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return convertToVoucherDTO(updatedVoucher);
    }

    public void deleteVoucher(Integer id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        voucherRepository.delete(voucher);
    }

    // ==================== STATISTICS & REPORTING ====================

    public Map<String, Object> getStatisticsOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Total users
        long totalUsers = nguoiDungRepository.count();
        
        // Total orders
        long totalOrders = donHangRepository.count();
        
        // Total products
        long totalProducts = sanPhamRepository.count();
        
        // Total revenue
        BigDecimal totalRevenue = donHangRepository.findAll().stream()
                .map(DonHang::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Orders this month
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long ordersThisMonth = donHangRepository.findAll().stream()
                .filter(order -> order.getNgayDatHang().isAfter(monthStart))
                .count();
        
        overview.put("totalUsers", totalUsers);
        overview.put("totalOrders", totalOrders);
        overview.put("totalProducts", totalProducts);
        overview.put("totalRevenue", totalRevenue);
        overview.put("ordersThisMonth", ordersThisMonth);
        
        return overview;
    }

    public Map<String, Object> getRevenueStatistics(String fromDate, String toDate) {
        Map<String, Object> revenueStats = new HashMap<>();
        
        List<DonHang> allOrders = donHangRepository.findAll();
        
        BigDecimal totalRevenue = allOrders.stream()
                .map(DonHang::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Group by status
        Map<String, BigDecimal> revenueByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(
                        DonHang::getTrangThaiDonHang,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                DonHang::getTongTien,
                                BigDecimal::add
                        )
                ));
        
        revenueStats.put("totalRevenue", totalRevenue);
        revenueStats.put("revenueByStatus", revenueByStatus);
        revenueStats.put("totalOrders", allOrders.size());
        
        return revenueStats;
    }

    public Map<String, Object> getOrderStatistics() {
        Map<String, Object> orderStats = new HashMap<>();
        
        List<DonHang> allOrders = donHangRepository.findAll();
        
        // Count by status
        Map<String, Long> countByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(DonHang::getTrangThaiDonHang, Collectors.counting()));
        
        orderStats.put("totalOrders", allOrders.size());
        orderStats.put("ordersByStatus", countByStatus);
        orderStats.put("averageOrderValue", allOrders.stream()
                .map(DonHang::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(Math.max(allOrders.size(), 1)), 2, java.math.RoundingMode.HALF_UP));
        
        return orderStats;
    }

    public Map<String, Object> getProductStatistics() {
        Map<String, Object> productStats = new HashMap<>();
        
        List<SanPham> allProducts = sanPhamRepository.findAll();
        
        productStats.put("totalProducts", allProducts.size());
        productStats.put("activeProducts", allProducts.stream().filter(SanPham::getTrangThai).count());
        productStats.put("inactiveProducts", allProducts.stream().filter(p -> !p.getTrangThai()).count());
        
        return productStats;
    }

    public Map<String, Object> getUserStatistics() {
        Map<String, Object> userStats = new HashMap<>();
        
        List<NguoiDung> allUsers = nguoiDungRepository.findAll();
        
        userStats.put("totalUsers", allUsers.size());
        userStats.put("activeUsers", allUsers.stream().filter(NguoiDung::getTrangThai).count());
        userStats.put("adminUsers", allUsers.stream().filter(u -> "admin".equals(u.getVaiTro())).count());
        userStats.put("customerUsers", allUsers.stream().filter(u -> "khach_hang".equals(u.getVaiTro())).count());
        
        return userStats;
    }

    public List<Map<String, Object>> getTopProducts(int limit) {
        // Get all order details and group by product
        Map<Integer, Integer> productSalesMap = new HashMap<>();
        Map<Integer, SanPham> productMap = new HashMap<>();
        
        donHangRepository.findAll().stream()
                .flatMap(order -> order.getChiTietDonHangs().stream())
                .forEach(detail -> {
                    Integer maSanPham = detail.getChiTietSanPham().getSanPham().getMaSanPham();
                    productSalesMap.put(maSanPham, 
                        productSalesMap.getOrDefault(maSanPham, 0) + detail.getSoLuong());
                    productMap.putIfAbsent(maSanPham, detail.getChiTietSanPham().getSanPham());
                });
        
        // Sort by quantity and convert to result list
        return productSalesMap.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> productInfo = new HashMap<>();
                    SanPham product = productMap.get(entry.getKey());
                    productInfo.put("maSanPham", entry.getKey());
                    productInfo.put("tenSanPham", product.getTenSanPham());
                    productInfo.put("soLuongBan", entry.getValue());
                    productInfo.put("giaCoBan", product.getGiaCoBan());
                    return productInfo;
                })
                .collect(Collectors.toList());
    }

    // ==================== PRODUCT REVIEWS ====================

    public Map<String, Object> getAllReviews(int page, int size, Integer status) {
        List<DanhGia> reviews = danhGiaRepository.findAll();
        int totalReviews = reviews.size();
        
        List<DanhGiaDTO> reviewList = reviews.stream()
                .map(this::convertToDanhGiaDTO)
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("reviews", reviewList);
        result.put("totalReviews", totalReviews);
        result.put("totalPages", (int) Math.ceil((double) totalReviews / size));
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }

    public void approveReview(Integer id) {
        DanhGia review = danhGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        review.setTrangThai(true);
        danhGiaRepository.save(review);
    }

    public void rejectReview(Integer id) {
        DanhGia review = danhGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        review.setTrangThai(false);
        danhGiaRepository.save(review);
    }

    public void deleteReview(Integer id) {
        DanhGia review = danhGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        danhGiaRepository.delete(review);
    }

    // ==================== CONFIGURATION ====================

    public Map<String, Object> getSystemConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("appName", "StepUp Shoes");
        config.put("appVersion", "1.0.0");
        config.put("appDescription", "E-commerce application for shoes");
        config.put("maxUploadSize", "10MB");
        config.put("sessionTimeout", "30 minutes");
        return config;
    }

    public Map<String, Object> updateSystemConfig(Map<String, Object> config) {
        // Implementation for updating system configuration
        // This could involve database storage or configuration files
        return getSystemConfig();
    }

    // ==================== ACTIVITY LOG ====================

    public Map<String, Object> getActivityLogs(int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        // TODO: Implement activity logging
        // For now, return empty logs
        result.put("logs", new ArrayList<>());
        result.put("totalLogs", 0);
        result.put("totalPages", 0);
        result.put("currentPage", page);
        result.put("pageSize", size);
        
        return result;
    }

    // ==================== HELPER METHODS ====================

    private NguoiDungDTO convertToNguoiDungDTO(NguoiDung user) {
        return NguoiDungDTO.builder()
                .maNguoiDung(user.getMaNguoiDung())
                .tenDangNhap(user.getTenDangNhap())
                .email(user.getEmail())
                .hoTen(user.getHoTen())
                .soDienThoai(user.getSoDienThoai())
                .diaChi(user.getDiaChi())
                .vaiTro(user.getVaiTro())
                .trangThai(user.getTrangThai())
                .ngayTao(user.getNgayTao())
                .ngayCapNhat(user.getNgayCapNhat())
                .build();
    }

    private DonHangDTO convertToDonHangDTO(DonHang order) {
        return DonHangDTO.builder()
                .maDonHang(order.getMaDonHang())
                .maNguoiDung(order.getNguoiDung() != null ? order.getNguoiDung().getMaNguoiDung() : 0)
                .ngayDatHang(order.getNgayDatHang())
                .ngayCapNhat(order.getNgayCapNhat())
                .tongTien(order.getTongTien())
                .phiVanChuyen(order.getPhiVanChuyen())
                .giamGia(order.getGiamGia())
                .thanhTien(order.getThanhTien())
                .trangThaiDonHang(order.getTrangThaiDonHang())
                .trangThaiThanhToan(order.getTrangThaiThanhToan())
                .phuongThucThanhToan(order.getPhuongThucThanhToan())
                .loaiDonHang(order.getLoaiDonHang())
                .diaChiGiaoHang(order.getDiaChiGiaoHang())
                .soDienThoaiNhan(order.getSoDienThoaiNhan())
                .nguoiNhan(order.getNguoiNhan())
                .ghiChu(order.getGhiChu())
                .build();
    }

    private VoucherDTO convertToVoucherDTO(Voucher voucher) {
        return VoucherDTO.builder()
                .maVoucher(voucher.getMaVoucher())
                .code(voucher.getCode())
                .moTa(voucher.getMoTa())
                .giaTriGiam(voucher.getGiaTriGiam())
                .loaiGiam(voucher.getLoaiGiam())
                .giaTriToiThieu(voucher.getGiaTriToiThieu())
                .giamToiDa(voucher.getGiamToiDa())
                .ngayBatDau(voucher.getNgayBatDau())
                .ngayKetThuc(voucher.getNgayKetThuc())
                .soLuong(voucher.getSoLuong())
                .soLuongDaDung(voucher.getSoLuongDaDung())
                .trangThai(voucher.getTrangThai())
                .ngayTao(voucher.getNgayTao())
                .build();
    }

    private DanhGiaDTO convertToDanhGiaDTO(DanhGia review) {
        return DanhGiaDTO.builder()
                .maDanhGia(review.getMaDanhGia())
                .maChiTiet(review.getChiTietSanPham().getMaChiTiet())
                .maNguoiDung(review.getNguoiDung().getMaNguoiDung())
                .hoTenNguoiDung(review.getNguoiDung().getHoTen())
                .diem(review.getDiem())
                .noiDung(review.getNoiDung())
                .trangThai(review.getTrangThai())
                .ngayDanhGia(review.getNgayDanhGia())
                .build();
    }

    // ==================== PRODUCT DETAILS FOR POS ====================

    /**
     * Lấy danh sách chi tiết sản phẩm (kích cỡ, màu sắc) cho hệ thống POS
     */
    public Map<String, Object> getProductDetails() {
        List<ChiTietSanPham> allDetails = chiTietSanPhamRepository.findAll();
        
        List<Map<String, Object>> detailsList = allDetails.stream()
                .filter(ChiTietSanPham::getTrangThai) // Chỉ lấy sản phẩm có trạng thái hoạt động
                .map(detail -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("maChiTiet", detail.getMaChiTiet());
                    item.put("tenSanPham", detail.getSanPham().getTenSanPham());
                    item.put("kichCo", detail.getSize());
                    item.put("mauSac", detail.getMauSac());
                    item.put("donGia", detail.getGiaBan());
                    item.put("soLuongTon", detail.getSoLuongTon());
                    item.put("trangThai", detail.getTrangThai());
                    return item;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", detailsList);
        result.put("total", detailsList.size());
        return result;
    }
}
