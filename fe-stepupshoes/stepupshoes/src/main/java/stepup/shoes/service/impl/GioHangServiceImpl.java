package stepup.shoes.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stepup.shoes.dto.GioHangDTO;
import stepup.shoes.dto.ChiTietSanPhamDTO;
import stepup.shoes.entity.GioHang;
import stepup.shoes.entity.NguoiDung;
import stepup.shoes.entity.ChiTietSanPham;
import stepup.shoes.entity.SanPham;
import stepup.shoes.repository.GioHangRepository;
import stepup.shoes.repository.NguoiDungRepository;
import stepup.shoes.repository.ChiTietSanPhamRepository;
import stepup.shoes.service.GioHangService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GioHangServiceImpl implements GioHangService {
    private final GioHangRepository gioHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    @Override
    public List<GioHangDTO> getCartByUser(Integer maNguoiDung) {
        List<GioHang> cartItems = gioHangRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
        return cartItems.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public GioHangDTO addToCart(Integer maNguoiDung, Integer maChiTiet, Integer soLuong) {
        NguoiDung user = nguoiDungRepository.findById(maNguoiDung).orElseThrow();
        ChiTietSanPham chiTiet = chiTietSanPhamRepository.findById(maChiTiet).orElseThrow();
        GioHang cartItem = gioHangRepository.findByNguoiDung_MaNguoiDungAndChiTietSanPham_MaChiTiet(maNguoiDung, maChiTiet)
                .orElse(GioHang.builder()
                        .nguoiDung(user)
                        .chiTietSanPham(chiTiet)
                        .soLuong(0)
                        .build());
        cartItem.setSoLuong(cartItem.getSoLuong() + soLuong);
        GioHang saved = gioHangRepository.save(cartItem);
        return toDTO(saved);
    }

    @Override
    public GioHangDTO updateCartItem(Integer maNguoiDung, Integer maChiTiet, Integer soLuong) {
        GioHang cartItem = gioHangRepository.findByNguoiDung_MaNguoiDungAndChiTietSanPham_MaChiTiet(maNguoiDung, maChiTiet)
                .orElseThrow();
        cartItem.setSoLuong(soLuong);
        GioHang saved = gioHangRepository.save(cartItem);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void removeCartItem(Integer maNguoiDung, Integer maChiTiet) {
        GioHang cartItem = gioHangRepository.findByNguoiDung_MaNguoiDungAndChiTietSanPham_MaChiTiet(maNguoiDung, maChiTiet)
                .orElseThrow();
        gioHangRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void clearCart(Integer maNguoiDung) {
        gioHangRepository.deleteByNguoiDung_MaNguoiDung(maNguoiDung);
    }

    private GioHangDTO toDTO(GioHang cartItem) {
        ChiTietSanPham chiTiet = cartItem.getChiTietSanPham();
        SanPham sanPham = chiTiet != null ? chiTiet.getSanPham() : null;
        return GioHangDTO.builder()
                .maGioHang(cartItem.getMaGioHang())
                .maNguoiDung(cartItem.getNguoiDung().getMaNguoiDung())
                .maChiTiet(chiTiet != null ? chiTiet.getMaChiTiet() : null)
                .tenSanPham(sanPham != null ? sanPham.getTenSanPham() : null)
                .mauSac(chiTiet != null ? chiTiet.getMauSac() : null)
                .size(chiTiet != null ? chiTiet.getSize() : null)
                .maSKU(chiTiet != null ? chiTiet.getMaSKU() : null)
                .soLuong(cartItem.getSoLuong())
                .chiTietSanPham(chiTiet != null ? toChiTietSanPhamDTO(chiTiet) : null)
                .build();
    }

    private ChiTietSanPhamDTO toChiTietSanPhamDTO(ChiTietSanPham chiTiet) {
        return ChiTietSanPhamDTO.builder()
                .maChiTiet(chiTiet.getMaChiTiet())
                .maSanPham(chiTiet.getSanPham() != null ? chiTiet.getSanPham().getMaSanPham() : null)
                .maSKU(chiTiet.getMaSKU())
                .mauSac(chiTiet.getMauSac())
                .size(chiTiet.getSize())
                .giaBan(chiTiet.getGiaBan())
                .soLuongTon(chiTiet.getSoLuongTon())
                .trangThai(chiTiet.getTrangThai())
                .hinhAnhChinh(chiTiet.getHinhAnhChinh())
                .ngayTao(chiTiet.getNgayTao())
                .ngayCapNhat(chiTiet.getNgayCapNhat())
                .build();
    }
}
