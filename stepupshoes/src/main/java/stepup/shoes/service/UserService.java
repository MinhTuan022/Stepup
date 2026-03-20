package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stepup.shoes.dto.ChiTietDonHangDTO;
import stepup.shoes.dto.CreateOrderRequestDTO;
import stepup.shoes.dto.DonHangDTO;
import stepup.shoes.dto.NguoiDungDTO;
import stepup.shoes.dto.VoucherValidationDTO;
import stepup.shoes.entity.*;
import stepup.shoes.exception.ResourceNotFoundException;
import stepup.shoes.repository.ChiTietDonHangRepository;
import stepup.shoes.repository.ChiTietSanPhamRepository;
import stepup.shoes.repository.DonHangRepository;
import stepup.shoes.repository.NguoiDungRepository;
import stepup.shoes.repository.VoucherRepository;
import stepup.shoes.repository.LichSuTrangThaiDonHangRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final NguoiDungRepository nguoiDungRepository;
    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final VoucherRepository voucherRepository;
    private final LichSuTrangThaiDonHangRepository lichSuTrangThaiDonHangRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== USER PROFILE ====================

    public NguoiDungDTO getUserProfile(Integer id) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return convertToNguoiDungDTO(user);
    }

    public NguoiDungDTO updateUserProfile(Integer id, NguoiDungDTO nguoiDungDTO) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        if (nguoiDungDTO.getHoTen() != null) user.setHoTen(nguoiDungDTO.getHoTen());
        if (nguoiDungDTO.getEmail() != null) user.setEmail(nguoiDungDTO.getEmail());
        if (nguoiDungDTO.getSoDienThoai() != null) user.setSoDienThoai(nguoiDungDTO.getSoDienThoai());
        if (nguoiDungDTO.getDiaChi() != null) user.setDiaChi(nguoiDungDTO.getDiaChi());
        
        user.setNgayCapNhat(LocalDateTime.now());
        NguoiDung updatedUser = nguoiDungRepository.save(user);
        return convertToNguoiDungDTO(updatedUser);
    }

    public void changePassword(Integer id, String oldPassword, String newPassword) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        if (!passwordEncoder.matches(oldPassword, user.getMatKhau())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
        
        user.setMatKhau(passwordEncoder.encode(newPassword));
        user.setNgayCapNhat(LocalDateTime.now());
        nguoiDungRepository.save(user);
    }

    // ==================== ORDER HISTORY ====================

    public List<DonHangDTO> getUserOrders(Integer userId, String status) {
        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        List<DonHang> orders;
        if (status != null && !status.isEmpty()) {
            orders = donHangRepository.findByNguoiDungAndTrangThaiDonHang(user, status);
        } else {
            orders = donHangRepository.findByNguoiDung(user);
        }
        
        return orders.stream()
                .map(this::convertToDonHangDTO)
                .sorted((o1, o2) -> o2.getNgayDatHang().compareTo(o1.getNgayDatHang()))
                .collect(Collectors.toList());
    }

    public DonHangDTO getOrderDetail(Integer orderId) {
        DonHang order = donHangRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        return convertToDonHangDTO(order);
    }


    public DonHangDTO cancelOrder(Integer userId, Integer orderId, String lyDo) {
        DonHang order = donHangRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        if (order.getNguoiDung() == null || !order.getNguoiDung().getMaNguoiDung().equals(userId)) {
            throw new ResourceNotFoundException("Đơn hàng không thuộc về người dùng");
        }

        String current = order.getTrangThaiDonHang();

        if (!TrangThaiDonHang.canCancel(current)) {
            throw new IllegalArgumentException("Không thể hủy đơn hàng ở trạng thái hiện tại");
        }

        if (TrangThaiDonHang.CHO_XAC_NHAN.getCode().equals(current)) {
            String prev = current;
            order.setTrangThaiDonHang(TrangThaiDonHang.HUY.getCode());
            order.setNgayCapNhat(LocalDateTime.now());

            LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang();
            lichSu.setDonHang(order);
            lichSu.setTrangThaiCu(prev);
            lichSu.setTrangThaiMoi(TrangThaiDonHang.HUY.getCode());
            lichSu.setGhiChu("Khách hàng hủy đơn");
            lichSu.setNguoiCapNhat(order.getNguoiDung());
            lichSuTrangThaiDonHangRepository.save(lichSu);

            DonHang updated = donHangRepository.save(order);
            return convertToDonHangDTO(updated);
        }

        if (TrangThaiDonHang.CHUAN_BI_HANG.getCode().equals(current)) {
            order.setTrangThaiDonHang(TrangThaiDonHang.YEU_CAU_HUY.getCode());
            order.setLyDoYeuCauHuy(lyDo != null && !lyDo.trim().isEmpty() ? lyDo.trim() : "Khách yêu cầu hủy");
            order.setNgayYeuCauHuy(LocalDateTime.now());
            order.setNgayCapNhat(LocalDateTime.now());

            LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang();
            lichSu.setDonHang(order);
            lichSu.setTrangThaiCu(current);
            lichSu.setTrangThaiMoi(TrangThaiDonHang.YEU_CAU_HUY.getCode());
            lichSu.setGhiChu("Khách gửi yêu cầu hủy: " + order.getLyDoYeuCauHuy());
            lichSu.setNguoiCapNhat(order.getNguoiDung());
            lichSuTrangThaiDonHangRepository.save(lichSu);

            DonHang updated = donHangRepository.save(order);
            return convertToDonHangDTO(updated);
        }

        throw new IllegalArgumentException("Yêu cầu hủy không hợp lệ");
    }

    public Map<String, Object> getUserOrderStats(Integer userId) {
        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        List<DonHang> allOrders = donHangRepository.findByNguoiDung(user);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", allOrders.size());
        stats.put("completedOrders", allOrders.stream()
                .filter(o -> "hoan_thanh".equals(o.getTrangThaiDonHang()))
                .count());
        stats.put("cancelledOrders", allOrders.stream()
                .filter(o -> "huy".equals(o.getTrangThaiDonHang()))
                .count());
        stats.put("processingOrders", allOrders.stream()
            .filter(o -> "cho_xac_nhan".equals(o.getTrangThaiDonHang()) || 
                     "chuan_bi_hang".equals(o.getTrangThaiDonHang()) ||
                     "dang_giao_hang".equals(o.getTrangThaiDonHang()))
            .count());
        stats.put("totalSpent", allOrders.stream()
                .filter(o -> "hoan_thanh".equals(o.getTrangThaiDonHang()))
                .map(DonHang::getThanhTien)
                .reduce((a, b) -> a.add(b))
                .orElse(java.math.BigDecimal.ZERO));
        
        return stats;
    }

    // ==================== CREATE ORDER ====================

    /**
     * Tạo đơn hàng online từ giỏ hàng của khách hàng
     */
    public DonHangDTO createOrder(CreateOrderRequestDTO requestDTO) {
        NguoiDung user = nguoiDungRepository.findById(requestDTO.getMaNguoiDung())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        if (requestDTO.getItems() == null || requestDTO.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }
        
        DonHang donHang = new DonHang();
        donHang.setNguoiDung(user);
        donHang.setLoaiDonHang("online");
        donHang.setTrangThaiDonHang("cho_xac_nhan");
        donHang.setTrangThaiThanhToan("chua_thanh_toan");
        donHang.setPhuongThucThanhToan("tien_mat"); // COD
        donHang.setDiaChiGiaoHang(requestDTO.getDiaChiGiaoHang());
        donHang.setNguoiNhan(requestDTO.getNguoiNhan());
        donHang.setSoDienThoaiNhan(requestDTO.getSoDienThoaiNhan());
        donHang.setGhiChu(requestDTO.getGhiChu());
        donHang.setTongTien(BigDecimal.ZERO);
        donHang.setPhiVanChuyen(BigDecimal.ZERO);
        donHang.setGiamGia(BigDecimal.ZERO);
        donHang.setThanhTien(BigDecimal.ZERO);
        donHang.setNgayDatHang(LocalDateTime.now());
        donHang.setNgayCapNhat(LocalDateTime.now());
        
        DonHang savedOrder = donHangRepository.save(donHang);
        
        BigDecimal tongTien = BigDecimal.ZERO;
        for (CreateOrderRequestDTO.OrderItemDTO itemDTO : requestDTO.getItems()) {
            ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(itemDTO.getMaChiTiet())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: " + itemDTO.getMaChiTiet()));
            if (chiTietSanPham.getSoLuongTon() < itemDTO.getSoLuong()) {
                throw new IllegalArgumentException(
                        "Không đủ số lượng tồn kho cho sản phẩm: " + chiTietSanPham.getSanPham().getTenSanPham() + 
                        ". Tồn kho: " + chiTietSanPham.getSoLuongTon() + 
                        ", Yêu cầu: " + itemDTO.getSoLuong());
            }
            
            BigDecimal donGia = chiTietSanPham.getGiaBan();
            BigDecimal thanhTien = donGia.multiply(new BigDecimal(itemDTO.getSoLuong()));
            
            ChiTietDonHang chiTietDonHang = new ChiTietDonHang();
            chiTietDonHang.setDonHang(savedOrder);
            chiTietDonHang.setChiTietSanPham(chiTietSanPham);
            chiTietDonHang.setSoLuong(itemDTO.getSoLuong());
            chiTietDonHang.setDonGia(donGia);
            chiTietDonHang.setThanhTien(thanhTien);
            
            chiTietDonHangRepository.save(chiTietDonHang);
            tongTien = tongTien.add(thanhTien);
        }
        
        if (requestDTO.getMaVoucher() != null && !requestDTO.getMaVoucher().trim().isEmpty()) {
            try {
                Voucher voucher = voucherRepository.findByCode(requestDTO.getMaVoucher())
                        .orElse(null);
                
                Integer soLuongConLai = voucher != null ? 
                    voucher.getSoLuong() - voucher.getSoLuongDaDung() : 0;
                
                if (voucher != null && voucher.getTrangThai() && soLuongConLai > 0) {
                    LocalDateTime now = LocalDateTime.now();
                    if ((voucher.getNgayBatDau() == null || !now.isBefore(voucher.getNgayBatDau())) &&
                        (voucher.getNgayKetThuc() == null || !now.isAfter(voucher.getNgayKetThuc()))) {
                        
                        BigDecimal giamGia = BigDecimal.ZERO;
                        if ("phan_tram".equals(voucher.getLoaiGiam())) {
                            giamGia = tongTien.multiply(voucher.getGiaTriGiam().divide(new BigDecimal(100)));
                            if (voucher.getGiamToiDa() != null && giamGia.compareTo(voucher.getGiamToiDa()) > 0) {
                                giamGia = voucher.getGiamToiDa();
                            }
                        } else {
                            giamGia = voucher.getGiaTriGiam();
                        }
                        
                        if (voucher.getGiaTriToiThieu() == null || 
                            tongTien.compareTo(voucher.getGiaTriToiThieu()) >= 0) {
                            savedOrder.setGiamGia(giamGia);
                            voucher.setSoLuongDaDung(voucher.getSoLuongDaDung() + 1);
                            voucherRepository.save(voucher);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to apply voucher: " + e.getMessage());
            }
        }
        
        savedOrder.setTongTien(tongTien);
        BigDecimal thanhTien = tongTien.add(savedOrder.getPhiVanChuyen()).subtract(savedOrder.getGiamGia());
        savedOrder.setThanhTien(thanhTien);
        savedOrder.setNgayCapNhat(LocalDateTime.now());
        
        DonHang finalOrder = donHangRepository.save(savedOrder);
        
        finalOrder = donHangRepository.findByIdWithChiTiet(finalOrder.getMaDonHang())
                .orElse(finalOrder);
        
        return convertToDonHangDTO(finalOrder);
    }

    // ==================== VOUCHER VALIDATION ====================

    /**
     * Validate voucher và tính toán giảm giá
     */
    public VoucherValidationDTO validateVoucher(String voucherCode, BigDecimal tongTien) {
        VoucherValidationDTO result = new VoucherValidationDTO();
        result.setCode(voucherCode);
        result.setTongTien(tongTien);
        result.setValid(false);
        
        if (voucherCode == null || voucherCode.trim().isEmpty()) {
            result.setMessage("Vui lòng nhập mã voucher");
            return result;
        }
        
        Voucher voucher = voucherRepository.findByCode(voucherCode.trim())
                .orElse(null);
        
        if (voucher == null) {
            result.setMessage("Mã voucher không tồn tại");
            return result;
        }
        
        if (!voucher.getTrangThai()) {
            result.setMessage("Mã voucher đã bị vô hiệu hóa");
            return result;
        }
        
        Integer soLuongConLai = voucher.getSoLuong() - voucher.getSoLuongDaDung();
        if (soLuongConLai <= 0) {
            result.setMessage("Mã voucher đã hết lượt sử dụng");
            return result;
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (voucher.getNgayBatDau() != null && now.isBefore(voucher.getNgayBatDau())) {
            result.setMessage("Mã voucher chưa đến thời gian sử dụng");
            return result;
        }
        if (voucher.getNgayKetThuc() != null && now.isAfter(voucher.getNgayKetThuc())) {
            result.setMessage("Mã voucher đã hết hạn");
            return result;
        }
        
        if (voucher.getGiaTriToiThieu() != null && 
            tongTien.compareTo(voucher.getGiaTriToiThieu()) < 0) {
            result.setMessage(String.format("Đơn hàng tối thiểu %s để sử dụng voucher này", 
                formatCurrency(voucher.getGiaTriToiThieu())));
            return result;
        }
        
        BigDecimal soTienGiam = BigDecimal.ZERO;
        if ("phan_tram".equals(voucher.getLoaiGiam())) {
            soTienGiam = tongTien.multiply(voucher.getGiaTriGiam())
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            if (voucher.getGiamToiDa() != null && soTienGiam.compareTo(voucher.getGiamToiDa()) > 0) {
                soTienGiam = voucher.getGiamToiDa();
            }
        } else {
            soTienGiam = voucher.getGiaTriGiam();
        }
        
        result.setValid(true);
        result.setMessage("Mã voucher hợp lệ");
        result.setMoTa(voucher.getMoTa());
        result.setLoaiGiam(voucher.getLoaiGiam());
        result.setGiaTriGiam(voucher.getGiaTriGiam());
        result.setGiamToiDa(voucher.getGiamToiDa());
        result.setGiaTriToiThieu(voucher.getGiaTriToiThieu());
        result.setSoTienGiam(soTienGiam);
        result.setThanhTien(tongTien.subtract(soTienGiam));
        
        return result;
    }


    public java.util.List<VoucherValidationDTO> getApplicableVouchers(BigDecimal tongTien) {
        java.util.List<Voucher> vouchers = voucherRepository.findByTrangThaiTrue();
        return vouchers.stream()
                .map(v -> validateVoucher(v.getCode(), tongTien))
                .sorted((a, b) -> {
                    boolean av = a.getValid() != null && a.getValid();
                    boolean bv = b.getValid() != null && b.getValid();
                    if (av != bv) return bv ? 1 : -1; 
                    java.math.BigDecimal ag = a.getSoTienGiam() != null ? a.getSoTienGiam() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal bg = b.getSoTienGiam() != null ? b.getSoTienGiam() : java.math.BigDecimal.ZERO;
                    return bg.compareTo(ag);
                })
                .collect(Collectors.toList());
    }
    
    private String formatCurrency(BigDecimal amount) {
        return String.format("%,dđ", amount.longValue());
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
        return DonHangDTO.builder()
                .maDonHang(order.getMaDonHang())
                .maNguoiDung(order.getNguoiDung().getMaNguoiDung())
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
                .ngayDatHang(order.getNgayDatHang())
                .ngayCapNhat(order.getNgayCapNhat())
                .chiTietDonHangs(order.getChiTietDonHangs() != null 
                        ? order.getChiTietDonHangs().stream()
                                .map(this::convertToChiTietDonHangDTO)
                                .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    private ChiTietDonHangDTO convertToChiTietDonHangDTO(ChiTietDonHang chiTiet) {
        return ChiTietDonHangDTO.builder()
                .maChiTietDonHang(chiTiet.getMaChiTietDon())
                .maDonHang(chiTiet.getDonHang().getMaDonHang())
                .maChiTiet(chiTiet.getChiTietSanPham().getMaChiTiet())
                .soLuong(chiTiet.getSoLuong())
                .donGia(chiTiet.getDonGia())
                .thanhTien(chiTiet.getThanhTien())
                .tenSanPham(chiTiet.getChiTietSanPham().getSanPham().getTenSanPham())
                .mauSac(chiTiet.getChiTietSanPham().getMauSac())
                .size(chiTiet.getChiTietSanPham().getSize())
                .hinhAnhChinh(chiTiet.getChiTietSanPham().getHinhAnhChinh())
                .build();
    }
}
