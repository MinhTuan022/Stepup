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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
        List<NguoiDung> all = nguoiDungRepository.findAll().stream()
            .filter(u -> !Boolean.TRUE.equals(u.getDaXoa()))
            .collect(Collectors.toList());
        int totalUsers = all.size();
        List<NguoiDungDTO> users = all.stream()
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
        if (Boolean.TRUE.equals(user.getDaXoa())) {
            throw new ResourceNotFoundException("Người dùng không tồn tại");
        }
        return convertToNguoiDungDTO(user);
    }

    public NguoiDungDTO searchUserByPhone(String phone) {
        return nguoiDungRepository.findBySoDienThoai(phone)
                .map(this::convertToNguoiDungDTO)
                .orElse(null);
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
        user.setDaXoa(true);
        user.setNgayXoa(LocalDateTime.now());
        nguoiDungRepository.save(user);
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
                .sorted((o1, o2) -> {
                    if (o1.getNgayDatHang() == null && o2.getNgayDatHang() == null) return 0;
                    if (o1.getNgayDatHang() == null) return 1;
                    if (o2.getNgayDatHang() == null) return -1;
                    return o2.getNgayDatHang().compareTo(o1.getNgayDatHang());
                })
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

    public void lockOrder(Integer orderId, Integer cashierId) {
        DonHang order = donHangRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        Integer currentLocker = order.getLockedBy();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (currentLocker != null && !currentLocker.equals(cashierId)) {
            throw new IllegalStateException("Đơn đang được giữ bởi cashier khác");
        }
        order.setLockedBy(cashierId);
        order.setLockedAt(now);
        order.setNgayCapNhat(now);
        donHangRepository.save(order);
    }

    public void touchOrderLock(Integer orderId) {
        DonHang order = donHangRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        if (order.getLockedBy() == null) {
            return;
        }
        order.setLockedAt(java.time.LocalDateTime.now());
        order.setNgayCapNhat(java.time.LocalDateTime.now());
        donHangRepository.save(order);
    }

    public void releaseOrderLock(Integer orderId, Integer cashierId) {
        DonHang order = donHangRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        Integer currentLocker = order.getLockedBy();
        if (currentLocker == null) return; // already released
        if (cashierId != null && !cashierId.equals(currentLocker)) {
            throw new IllegalStateException("Chỉ cashier đang giữ mới có thể giải phóng lock");
        }
        order.setLockedBy(null);
        order.setLockedAt(null);
        order.setNgayCapNhat(java.time.LocalDateTime.now());
        donHangRepository.save(order);
    }

    public DonHangDTO updateOrderStatus(Integer id, String status) {
        DonHang order = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        String currentStatus = order.getTrangThaiDonHang();

        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("Trạng thái mới không hợp lệ");
        }

        if (status.equals(currentStatus)) {
            return convertToDonHangDTO(order);
        }

        if (TrangThaiDonHang.HUY.getCode().equals(status)) {
            if (!TrangThaiDonHang.canCancel(currentStatus)) {
                throw new IllegalArgumentException("Không thể hủy đơn hàng ở trạng thái hiện tại");
            }
            order.setTrangThaiDonHang(status);
            try {
                // Always attempt to restore inventory for remaining items in the order.
                // For counter orders we decrement stock on add, so we must restore on cancel as well.
                restoreInventoryAfterCancel(order.getMaDonHang());
            } catch (Exception ex) {
                System.err.println("Failed to restore inventory after cancel: " + ex.getMessage());
            }
        } else {
            if (!TrangThaiDonHang.isForwardTransition(currentStatus, status)) {
                if (!(TrangThaiDonHang.YEU_CAU_HUY.getCode().equals(currentStatus)
                        && TrangThaiDonHang.CHUAN_BI_HANG.getCode().equals(status))) {
                    throw new IllegalArgumentException("Không được lùi hoặc nhảy tới trạng thái không hợp lệ");
                }
            }
            order.setTrangThaiDonHang(status);
            if (TrangThaiDonHang.YEU_CAU_HUY.getCode().equals(currentStatus)
                    && TrangThaiDonHang.CHUAN_BI_HANG.getCode().equals(status)) {
                order.setLyDoYeuCauHuy(null);
                order.setNgayYeuCauHuy(null);
            }
        }

        LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang();
        lichSu.setDonHang(order);
        lichSu.setTrangThaiCu(currentStatus);
        lichSu.setTrangThaiMoi(status);
        lichSu.setGhiChu("Cập nhật trạng thái");
        lichSu.setNguoiCapNhat(order.getNguoiDung());
        lichSuTrangThaiDonHangRepository.save(lichSu);

        order.setNgayCapNhat(LocalDateTime.now());
        DonHang updatedOrder = donHangRepository.save(order);

        try {
            if (TrangThaiDonHang.CHUAN_BI_HANG.getCode().equals(status) && !"tai_quay".equals(order.getLoaiDonHang())) {
                updateInventoryAfterOrder(updatedOrder.getMaDonHang());
            }
        } catch (Exception ex) {
            System.err.println("Failed to deduct inventory after confirming order: " + ex.getMessage());
        }

        return convertToDonHangDTO(updatedOrder);
    }

    /**
     * Khi đơn hàng bị hủy, khôi phục lại tồn kho (chỉ cho đơn online vì đơn quầy trừ khi finalize)
     */
    private void restoreInventoryAfterCancel(Integer donHangId) {
        DonHang donHang = donHangRepository.findById(donHangId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (donHang.getChiTietDonHangs() != null && !donHang.getChiTietDonHangs().isEmpty()) {
            donHang.getChiTietDonHangs().forEach(chiTietDonHang -> {
                ChiTietSanPham chiTietSanPham = chiTietDonHang.getChiTietSanPham();
                int restored = chiTietDonHang.getSoLuong();
                int newQty = (chiTietSanPham.getSoLuongTon() == null ? 0 : chiTietSanPham.getSoLuongTon()) + restored;
                chiTietSanPham.setSoLuongTon(newQty);
                if (newQty > 0) chiTietSanPham.setTrangThai(true);
                chiTietSanPham.setNgayCapNhat(LocalDateTime.now());
                chiTietSanPhamRepository.save(chiTietSanPham);
            });
        }
    }

    public DonHangDTO updateOrder(Integer id, DonHangDTO donHangDTO) {
        DonHang order = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        if (donHangDTO.getTrangThaiDonHang() != null) {
            return updateOrderStatus(id, donHangDTO.getTrangThaiDonHang());
        }
        if (donHangDTO.getTrangThaiThanhToan() != null) order.setTrangThaiThanhToan(donHangDTO.getTrangThaiThanhToan());
        if (donHangDTO.getDiaChiGiaoHang() != null) order.setDiaChiGiaoHang(donHangDTO.getDiaChiGiaoHang());
        if (donHangDTO.getSoDienThoaiNhan() != null) order.setSoDienThoaiNhan(donHangDTO.getSoDienThoaiNhan());
        if (donHangDTO.getNguoiNhan() != null) order.setNguoiNhan(donHangDTO.getNguoiNhan());
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
        // Khi tạo đơn (online hoặc tại quầy) khởi tạo ở trạng thái chờ xác nhận
        donHang.setTrangThaiDonHang("cho_xac_nhan");
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
        
        // Nếu là đơn tại quầy, giảm tồn kho ngay khi thêm sản phẩm
        try {
            Integer available = chiTietSanPham.getSoLuongTon() == null ? 0 : chiTietSanPham.getSoLuongTon();
            chiTietSanPham.setSoLuongTon(available - chiTietDonHang.getSoLuong());
            if (chiTietSanPham.getSoLuongTon() <= 0) chiTietSanPham.setTrangThai(false);
            chiTietSanPham.setNgayCapNhat(LocalDateTime.now());
            chiTietSanPhamRepository.save(chiTietSanPham);
        } catch (Exception ex) {
            System.err.println("Failed to decrement stock for counter order: " + ex.getMessage());
        }
        
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
        
        ChiTietDonHang itemToRemove = donHang.getChiTietDonHangs().stream()
                .filter(detail -> detail.getChiTietSanPham().getMaChiTiet().equals(maChiTiet))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong đơn hàng"));
        
        donHang.getChiTietDonHangs().remove(itemToRemove);

        // Khi xóa sản phẩm khỏi đơn (bao gồm đơn tại quầy), hoàn lại tồn kho tương ứng
        try {
            ChiTietSanPham chiTietSanPham = itemToRemove.getChiTietSanPham();
            int restored = itemToRemove.getSoLuong();
            int newQty = (chiTietSanPham.getSoLuongTon() == null ? 0 : chiTietSanPham.getSoLuongTon()) + restored;
            chiTietSanPham.setSoLuongTon(newQty);
            if (newQty > 0) chiTietSanPham.setTrangThai(true);
            chiTietSanPham.setNgayCapNhat(LocalDateTime.now());
            chiTietSanPhamRepository.save(chiTietSanPham);
        } catch (Exception ex) {
            System.err.println("Failed to restore stock when removing item: " + ex.getMessage());
        }

        chiTietDonHangRepository.delete(itemToRemove);
        chiTietDonHangRepository.flush(); 
        
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
        
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher không hợp lệ"));
        
        if (!voucher.getTrangThai()) {
            throw new IllegalArgumentException("Voucher không còn hiệu lực");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getNgayBatDau()) || now.isAfter(voucher.getNgayKetThuc())) {
            throw new IllegalArgumentException("Voucher không còn hiệu lực");
        }
        
        if (voucher.getSoLuong() != null && voucher.getSoLuongDaDung() >= voucher.getSoLuong()) {
            throw new IllegalArgumentException("Voucher đã hết");
        }
        
        if (donHang.getTongTien().compareTo(voucher.getGiaTriToiThieu()) < 0) {
            throw new IllegalArgumentException("Tổng đơn hàng không đủ điều kiện áp dụng voucher");
        }
        
        BigDecimal giamGia = BigDecimal.ZERO;
        if ("phan_tram".equals(voucher.getLoaiGiam())) {
            giamGia = donHang.getTongTien()
                    .multiply(voucher.getGiaTriGiam())
                    .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
        } else {
            giamGia = voucher.getGiaTriGiam();
        }
        
        if (voucher.getGiamToiDa() != null && giamGia.compareTo(voucher.getGiamToiDa()) > 0) {
            giamGia = voucher.getGiamToiDa();
        }
        
        donHang.setGiamGia(giamGia);
        donHang.setThanhTien(donHang.getTongTien()
                .subtract(giamGia)
                .add(donHang.getPhiVanChuyen()));
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        DonHang updatedOrder = donHangRepository.save(donHang);
        
        if (donHang.getNguoiDung() != null) {
            LichSuVoucher lichSu = new LichSuVoucher();
            lichSu.setVoucher(voucher);
            lichSu.setDonHang(updatedOrder);
            lichSu.setNguoiDung(donHang.getNguoiDung());
            lichSu.setGiaTriGiam(giamGia);
            lichSu.setNgaySuDung(LocalDateTime.now());
            lichSuVoucherRepository.save(lichSu);
        }
        
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
        
        String prevStatus = donHang.getTrangThaiDonHang();
        donHang.setPhuongThucThanhToan(phuongThucThanhToan);
        donHang.setTrangThaiThanhToan("da_thanh_toan");
        donHang.setTrangThaiDonHang(TrangThaiDonHang.HOAN_THANH.getCode());
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        DonHang updatedOrder = donHangRepository.save(donHang);
        
        LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang();
        lichSu.setDonHang(updatedOrder);
        lichSu.setTrangThaiCu(prevStatus);
        lichSu.setTrangThaiMoi(TrangThaiDonHang.HOAN_THANH.getCode());
        lichSu.setGhiChu("Hoàn thành đơn hàng tại quầy - " + phuongThucThanhToan);
        lichSu.setNguoiCapNhat(updatedOrder.getNguoiDung()); 
        lichSuTrangThaiDonHangRepository.save(lichSu);
        
        updateInventoryAfterOrder(donHangId);
        
        return convertToDonHangDTO(updatedOrder);
    }


    /**
     * Cập nhật tổng tiền đơn hàng dựa trên chi tiết
     */
    private void updateOrderTotals(Integer donHangId) {
        DonHang donHang = donHangRepository.findById(donHangId).get();
        
        BigDecimal tongTien = BigDecimal.ZERO;
        if (donHang.getChiTietDonHangs() != null && !donHang.getChiTietDonHangs().isEmpty()) {
            tongTien = donHang.getChiTietDonHangs().stream()
                    .map(ChiTietDonHang::getThanhTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
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
        
        if (donHang.getChiTietDonHangs() != null && !donHang.getChiTietDonHangs().isEmpty()) {
            donHang.getChiTietDonHangs().forEach(chiTietDonHang -> {
                ChiTietSanPham chiTietSanPham = chiTietDonHang.getChiTietSanPham();
                int soLuongTonMoi = chiTietSanPham.getSoLuongTon() - chiTietDonHang.getSoLuong();
                
                chiTietSanPham.setSoLuongTon(Math.max(0, soLuongTonMoi));
                
                if (soLuongTonMoi <= 0) {
                    chiTietSanPham.setTrangThai(false);
                }
                
                chiTietSanPham.setNgayCapNhat(LocalDateTime.now());
                chiTietSanPhamRepository.save(chiTietSanPham);
            });
        }
    }

    public Map<String, Object> getAllVouchers(int page, int size) {
        List<Voucher> all = voucherRepository.findAll().stream()
            .filter(v -> !Boolean.TRUE.equals(v.getDaXoa()))
            .collect(Collectors.toList());
        int totalVouchers = all.size();
        
        List<VoucherDTO> voucherList = all.stream()
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
        if (Boolean.TRUE.equals(voucher.getDaXoa())) {
            throw new ResourceNotFoundException("Voucher không tồn tại");
        }
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
        voucher.setDaXoa(true);
        voucher.setNgayXoa(LocalDateTime.now());
        voucherRepository.save(voucher);
    }

    // ==================== STATISTICS & REPORTING ====================

    public Map<String, Object> getStatisticsOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        long totalUsers = nguoiDungRepository.findAll().stream().filter(u -> !Boolean.TRUE.equals(u.getDaXoa())).count();
        
        long totalOrders = donHangRepository.count();
        
        long totalProducts = sanPhamRepository.findAll().stream().filter(p -> !Boolean.TRUE.equals(p.getDaXoa())).count();
        
        BigDecimal totalRevenue = donHangRepository.findAll().stream()
                .map(DonHang::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long ordersThisMonth = donHangRepository.findAll().stream()
                .filter(order -> order.getNgayDatHang().isAfter(monthStart))
                .count();
        
        overview.put("totalUsers", totalUsers);
        overview.put("totalOrders", totalOrders);
        overview.put("totalProducts", totalProducts);
        // Count active products (not deleted and trangThai == true)
        long activeProducts = sanPhamRepository.findAll().stream()
            .filter(p -> !Boolean.TRUE.equals(p.getDaXoa()))
            .filter(SanPham::getTrangThai)
            .count();
        overview.put("activeProducts", activeProducts);
        overview.put("totalRevenue", totalRevenue);
        overview.put("ordersThisMonth", ordersThisMonth);

        // Low stock products (chi tiết sản phẩm with remaining quantity < 10)
        List<ChiTietSanPham> allDetails = chiTietSanPhamRepository.findAll();
        List<Map<String, Object>> lowStockList = allDetails.stream()
            .filter(ChiTietSanPham::getTrangThai)
            .filter(detail -> detail.getSoLuongTon() != null && detail.getSoLuongTon() < 10)
            .map(detail -> {
                Map<String, Object> item = new HashMap<>();
                item.put("maChiTiet", detail.getMaChiTiet());
                item.put("maSanPham", detail.getSanPham().getMaSanPham());
                item.put("tenSanPham", detail.getSanPham().getTenSanPham());
                item.put("soLuongTon", detail.getSoLuongTon());
                return item;
            })
            .collect(Collectors.toList());

        overview.put("lowStockProducts", lowStockList);
        overview.put("lowStockCount", lowStockList.size());
        
        return overview;
    }

    public Map<String, Object> getRevenueStatistics(String fromDate, String toDate) {
        Map<String, Object> revenueStats = new HashMap<>();
        List<DonHang> allOrders = donHangRepository.findAll();

        // Parse optional date range (expected format: yyyy-MM-dd)
        LocalDateTime from = null;
        LocalDateTime to = null;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        try {
            if (fromDate != null && !fromDate.isEmpty()) {
            LocalDate ld = LocalDate.parse(fromDate, fmt);
            from = ld.atStartOfDay();
            }
            if (toDate != null && !toDate.isEmpty()) {
            LocalDate ld = LocalDate.parse(toDate, fmt);
            to = ld.atTime(23, 59, 59);
            }
        } catch (Exception e) {
            from = null;
            to = null;
        }

        final LocalDateTime start = from;
        final LocalDateTime end = to;

        List<DonHang> filteredOrders = allOrders.stream()
            .filter(order -> {
                LocalDateTime ngay = order.getNgayDatHang();
                if (ngay == null) return false;
                boolean afterFrom = (start == null) || !ngay.isBefore(start);
                boolean beforeTo = (end == null) || !ngay.isAfter(end);
                return afterFrom && beforeTo;
            })
            .collect(Collectors.toList());

        BigDecimal totalRevenue = filteredOrders.stream()
            .map(DonHang::getTongTien)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> revenueByStatus = filteredOrders.stream()
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
        revenueStats.put("totalOrders", filteredOrders.size());

        return revenueStats;
    }

    public Map<String, Object> getOrderStatistics() {
        Map<String, Object> orderStats = new HashMap<>();
        
        List<DonHang> allOrders = donHangRepository.findAll();
        
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
        
        List<SanPham> allProducts = sanPhamRepository.findAll().stream().filter(p -> !Boolean.TRUE.equals(p.getDaXoa())).collect(Collectors.toList());
        
        productStats.put("totalProducts", allProducts.size());
        productStats.put("activeProducts", allProducts.stream().filter(SanPham::getTrangThai).count());
        productStats.put("inactiveProducts", allProducts.stream().filter(p -> !p.getTrangThai()).count());
        
        return productStats;
    }

    public Map<String, Object> getUserStatistics() {
        Map<String, Object> userStats = new HashMap<>();
        
        List<NguoiDung> allUsers = nguoiDungRepository.findAll().stream().filter(u -> !Boolean.TRUE.equals(u.getDaXoa())).collect(Collectors.toList());
        
        userStats.put("totalUsers", allUsers.size());
        userStats.put("activeUsers", allUsers.stream().filter(NguoiDung::getTrangThai).count());
        userStats.put("adminUsers", allUsers.stream().filter(u -> "admin".equals(u.getVaiTro())).count());
        userStats.put("customerUsers", allUsers.stream().filter(u -> "khach_hang".equals(u.getVaiTro())).count());
        
        return userStats;
    }

    public List<Map<String, Object>> getTopProducts(int limit, String fromDate, String toDate) {
        Map<Integer, Integer> productSalesMap = new HashMap<>();
        Map<Integer, SanPham> productMap = new HashMap<>();

        List<DonHang> allOrders = donHangRepository.findAll();

        // Parse optional date range (format: yyyy-MM-dd)
        LocalDateTime from = null;
        LocalDateTime to = null;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        try {
            if (fromDate != null && !fromDate.isEmpty()) {
                LocalDate ld = LocalDate.parse(fromDate, fmt);
                from = ld.atStartOfDay();
            }
            if (toDate != null && !toDate.isEmpty()) {
                LocalDate ld = LocalDate.parse(toDate, fmt);
                to = ld.atTime(23, 59, 59);
            }
        } catch (Exception e) {
            from = null;
            to = null;
        }

        final LocalDateTime start = from;
        final LocalDateTime end = to;

        allOrders.stream()
                .filter(order -> {
                    LocalDateTime ngay = order.getNgayDatHang();
                    if (ngay == null) return false;
                    boolean afterFrom = (start == null) || !ngay.isBefore(start);
                    boolean beforeTo = (end == null) || !ngay.isAfter(end);
                    return afterFrom && beforeTo;
                })
                .flatMap(order -> order.getChiTietDonHangs().stream())
                .forEach(detail -> {
                    Integer maSanPham = detail.getChiTietSanPham().getSanPham().getMaSanPham();
                    productSalesMap.put(maSanPham,
                            productSalesMap.getOrDefault(maSanPham, 0) + detail.getSoLuong());
                    productMap.putIfAbsent(maSanPham, detail.getChiTietSanPham().getSanPham());
                });

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


    public Map<String, Object> getAllReviews(int page, int size, Integer status) {
        List<DanhGia> reviews = danhGiaRepository.findAll().stream()
            .filter(r -> !Boolean.TRUE.equals(r.getDaXoa()))
            .collect(Collectors.toList());
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
        review.setDaXoa(true);
        review.setNgayXoa(LocalDateTime.now());
        danhGiaRepository.save(review);
    }

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

        return getSystemConfig();
    }

    // ==================== ACTIVITY LOG ====================

    public Map<String, Object> getActivityLogs(int page, int size) {
        Map<String, Object> result = new HashMap<>();
 
        result.put("logs", new ArrayList<>());
        result.put("totalLogs", 0);
        result.put("totalPages", 0);
        result.put("currentPage", page);
        result.put("pageSize", size);
        
        return result;
    }

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
        List<ChiTietDonHangDTO> chiTietDTOs = new java.util.ArrayList<>();
        if (order.getChiTietDonHangs() != null && !order.getChiTietDonHangs().isEmpty()) {
            chiTietDTOs = order.getChiTietDonHangs().stream()
                    .map(this::convertToChiTietDonHangDTO)
                    .collect(java.util.stream.Collectors.toList());
        }
        
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
                .lyDoYeuCauHuy(order.getLyDoYeuCauHuy())
                .ngayYeuCauHuy(order.getNgayYeuCauHuy())
                .chiTietDonHangs(chiTietDTOs)
                .build();
    }
    
    private ChiTietDonHangDTO convertToChiTietDonHangDTO(ChiTietDonHang chiTiet) {
        ChiTietSanPham ctsp = chiTiet.getChiTietSanPham();
        return ChiTietDonHangDTO.builder()
                .maChiTietDonHang(chiTiet.getMaChiTietDon())
                .maDonHang(chiTiet.getDonHang().getMaDonHang())
                .maChiTiet(ctsp.getMaChiTiet())
                .tenSanPham(ctsp.getSanPham().getTenSanPham())
                .maSKU(ctsp.getMaSKU())
                .mauSac(ctsp.getMauSac())
                .size(ctsp.getSize())
                .hinhAnhChinh(ctsp.getHinhAnhChinh())
                .soLuong(chiTiet.getSoLuong())
                .donGia(chiTiet.getDonGia())
                .thanhTien(chiTiet.getThanhTien())
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

    /**
     * Lấy danh sách chi tiết sản phẩm (kích cỡ, màu sắc) cho hệ thống POS
     */
    public Map<String, Object> getProductDetails() {
        List<ChiTietSanPham> allDetails = chiTietSanPhamRepository.findAll();
        
        List<Map<String, Object>> detailsList = allDetails.stream()
                .filter(ChiTietSanPham::getTrangThai) 
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
