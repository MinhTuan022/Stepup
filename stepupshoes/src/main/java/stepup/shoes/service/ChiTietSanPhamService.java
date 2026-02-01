package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import stepup.shoes.dto.ChiTietSanPhamDTO;
import stepup.shoes.entity.ChiTietSanPham;
import stepup.shoes.entity.SanPham;
import stepup.shoes.exception.ResourceNotFoundException;
import stepup.shoes.repository.ChiTietSanPhamRepository;
import stepup.shoes.repository.SanPhamRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChiTietSanPhamService {
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final SanPhamRepository sanPhamRepository;

    public List<ChiTietSanPhamDTO> getBySanPhamId(Integer maSanPham) {
        List<ChiTietSanPham> list = chiTietSanPhamRepository.findBySanPham_MaSanPham(maSanPham);
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ChiTietSanPhamDTO getById(Integer id) {
        ChiTietSanPham chiTiet = chiTietSanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết sản phẩm"));
        return mapToDTO(chiTiet);
    }

    public ChiTietSanPhamDTO create(Integer maSanPham, ChiTietSanPhamDTO dto) {
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));
        ChiTietSanPham chiTiet = ChiTietSanPham.builder()
                .sanPham(sanPham)
                .maSKU(dto.getMaSKU())
                .mauSac(dto.getMauSac())
                .size(dto.getSize())
                .giaBan(dto.getGiaBan())
                .soLuongTon(dto.getSoLuongTon())
                .trangThai(dto.getTrangThai())
                .hinhAnhChinh(dto.getHinhAnhChinh())
                .build();
        ChiTietSanPham saved = chiTietSanPhamRepository.save(chiTiet);
        return mapToDTO(saved);
    }

    public ChiTietSanPhamDTO update(Integer id, ChiTietSanPhamDTO dto) {
        ChiTietSanPham chiTiet = chiTietSanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết sản phẩm"));
        chiTiet.setMaSKU(dto.getMaSKU());
        chiTiet.setMauSac(dto.getMauSac());
        chiTiet.setSize(dto.getSize());
        chiTiet.setGiaBan(dto.getGiaBan());
        chiTiet.setSoLuongTon(dto.getSoLuongTon());
        chiTiet.setTrangThai(dto.getTrangThai());
        chiTiet.setHinhAnhChinh(dto.getHinhAnhChinh());
        ChiTietSanPham updated = chiTietSanPhamRepository.save(chiTiet);
        return mapToDTO(updated);
    }

    public void delete(Integer id) {
        ChiTietSanPham chiTiet = chiTietSanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết sản phẩm"));
        chiTietSanPhamRepository.delete(chiTiet);
    }

    private ChiTietSanPhamDTO mapToDTO(ChiTietSanPham chiTiet) {
        return ChiTietSanPhamDTO.builder()
                .maChiTiet(chiTiet.getMaChiTiet())
                .maSanPham(chiTiet.getSanPham().getMaSanPham())
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
