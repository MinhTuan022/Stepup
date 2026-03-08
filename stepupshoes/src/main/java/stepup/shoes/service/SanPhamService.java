package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stepup.shoes.dto.SanPhamDTO;
import stepup.shoes.entity.DanhMuc;
import stepup.shoes.entity.SanPham;
import stepup.shoes.exception.ResourceNotFoundException;
import stepup.shoes.repository.DanhMucRepository;
import stepup.shoes.repository.HinhAnhChiTietRepository;
import stepup.shoes.repository.SanPhamRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import stepup.shoes.dto.ChiTietSanPhamDTO;
import stepup.shoes.entity.ChiTietSanPham;
import stepup.shoes.repository.ChiTietSanPhamRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final DanhMucRepository danhMucRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final HinhAnhChiTietRepository hinhAnhChiTietRepository;

    public SanPhamDTO getSanPhamById(Integer maSanPham) {
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tìm thấy với ID: " + maSanPham));
        if (Boolean.TRUE.equals(sanPham.getDaXoa())) {
            throw new ResourceNotFoundException("Sản phẩm không tìm thấy với ID: " + maSanPham);
        }
        return mapToDTO(sanPham);
    }

    public List<SanPhamDTO> getAllSanPham() {
        return sanPhamRepository.findAll()
            .stream()
            .filter(sp -> !Boolean.TRUE.equals(sp.getDaXoa()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<SanPhamDTO> getSanPhamByDanhMuc(Integer maDanhMuc) {
        return sanPhamRepository.findByDanhMuc_MaDanhMuc(maDanhMuc)
            .stream()
            .filter(sp -> !Boolean.TRUE.equals(sp.getDaXoa()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<SanPhamDTO> getSanPhamActive() {
        return sanPhamRepository.findByTrangThaiTrue()
            .stream()
            .filter(sp -> !Boolean.TRUE.equals(sp.getDaXoa()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<SanPhamDTO> searchSanPhamByName(String tenSanPham) {
        return sanPhamRepository.findByTenSanPhamContainingIgnoreCase(tenSanPham)
            .stream()
            .filter(sp -> !Boolean.TRUE.equals(sp.getDaXoa()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public SanPhamDTO createSanPham(SanPhamDTO sanPhamDTO) {
        DanhMuc danhMuc = danhMucRepository.findById(sanPhamDTO.getMaDanhMuc())
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tìm thấy"));

        SanPham sanPham = SanPham.builder()
            .tenSanPham(sanPhamDTO.getTenSanPham())
            .moTa(sanPhamDTO.getMoTa())
            .thuongHieu(sanPhamDTO.getThuongHieu())
            .danhMuc(danhMuc)
            .giaCoBan(sanPhamDTO.getGiaCoBan())
            .trangThai(sanPhamDTO.getTrangThai() != null ? sanPhamDTO.getTrangThai() : true)
            .ngayTao(LocalDateTime.now())
            .ngayCapNhat(LocalDateTime.now())
            .build();

        SanPham saved = sanPhamRepository.save(sanPham);

        if (sanPhamDTO.getChiTietSanPhams() != null) {
            for (ChiTietSanPhamDTO chiTietDTO : sanPhamDTO.getChiTietSanPhams()) {
                ChiTietSanPham chiTiet = ChiTietSanPham.builder()
                    .sanPham(saved)
                    .maSKU(chiTietDTO.getMaSKU())
                    .mauSac(chiTietDTO.getMauSac())
                    .size(chiTietDTO.getSize())
                    .giaBan(chiTietDTO.getGiaBan())
                    .soLuongTon(chiTietDTO.getSoLuongTon())
                    .trangThai(chiTietDTO.getTrangThai() != null ? chiTietDTO.getTrangThai() : true)
                    .hinhAnhChinh(chiTietDTO.getHinhAnhChinh())
                    .ngayTao(LocalDateTime.now())
                    .ngayCapNhat(LocalDateTime.now())
                    .build();
                ChiTietSanPham savedChiTiet = chiTietSanPhamRepository.save(chiTiet);

                if (chiTietDTO.getHinhAnhs() != null && !chiTietDTO.getHinhAnhs().isEmpty()) {
                    for (stepup.shoes.dto.HinhAnhChiTietDTO haDTO : chiTietDTO.getHinhAnhs()) {
                        stepup.shoes.entity.HinhAnhChiTiet ha = stepup.shoes.entity.HinhAnhChiTiet.builder()
                            .chiTietSanPham(savedChiTiet)
                            .duongDan(haDTO.getDuongDan())
                            .laAnhChinh(Boolean.TRUE.equals(haDTO.getLaAnhChinh()))
                            .thuTu(haDTO.getThuTu() != null ? haDTO.getThuTu() : 0)
                            .ngayTao(LocalDateTime.now())
                            .build();
                        hinhAnhChiTietRepository.save(ha);
                    }
                }
            }
        }

        return mapToDTO(saved);
    }

    public SanPhamDTO updateSanPham(Integer maSanPham, SanPhamDTO sanPhamDTO) {
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tìm thấy với ID: " + maSanPham));

        sanPham.setTenSanPham(sanPhamDTO.getTenSanPham());
        sanPham.setMoTa(sanPhamDTO.getMoTa());
        sanPham.setThuongHieu(sanPhamDTO.getThuongHieu());
        sanPham.setGiaCoBan(sanPhamDTO.getGiaCoBan());
        sanPham.setTrangThai(sanPhamDTO.getTrangThai());
        sanPham.setNgayCapNhat(LocalDateTime.now());

        SanPham updated = sanPhamRepository.save(sanPham);

        if (sanPhamDTO.getChiTietSanPhams() != null) {
            
            for (ChiTietSanPhamDTO chiTietDTO : sanPhamDTO.getChiTietSanPhams()) {
                if (chiTietDTO.getMaChiTiet() != null) {
                    ChiTietSanPham existing = chiTietSanPhamRepository.findById(chiTietDTO.getMaChiTiet())
                            .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm không tồn tại"));
                    
                    existing.setMaSKU(chiTietDTO.getMaSKU());
                    existing.setMauSac(chiTietDTO.getMauSac());
                    existing.setSize(chiTietDTO.getSize());
                    existing.setGiaBan(chiTietDTO.getGiaBan());
                    existing.setSoLuongTon(chiTietDTO.getSoLuongTon());
                    existing.setTrangThai(chiTietDTO.getTrangThai() != null ? chiTietDTO.getTrangThai() : true);
                    existing.setHinhAnhChinh(chiTietDTO.getHinhAnhChinh());
                    existing.setNgayCapNhat(LocalDateTime.now());
                    
                    chiTietSanPhamRepository.save(existing);
                    
                    if (chiTietDTO.getHinhAnhs() != null) {
                        hinhAnhChiTietRepository.deleteByChiTietSanPham_MaChiTiet(existing.getMaChiTiet());
                        for (stepup.shoes.dto.HinhAnhChiTietDTO haDTO : chiTietDTO.getHinhAnhs()) {
                            stepup.shoes.entity.HinhAnhChiTiet ha = stepup.shoes.entity.HinhAnhChiTiet.builder()
                                .chiTietSanPham(existing)
                                .duongDan(haDTO.getDuongDan())
                                .laAnhChinh(Boolean.TRUE.equals(haDTO.getLaAnhChinh()))
                                .thuTu(haDTO.getThuTu() != null ? haDTO.getThuTu() : 0)
                                .ngayTao(LocalDateTime.now())
                                .build();
                            hinhAnhChiTietRepository.save(ha);
                        }
                    }
                } else {
                    // THÊM MỚI biến thể
                    ChiTietSanPham chiTiet = ChiTietSanPham.builder()
                        .sanPham(updated)
                        .maSKU(chiTietDTO.getMaSKU())
                        .mauSac(chiTietDTO.getMauSac())
                        .size(chiTietDTO.getSize())
                        .giaBan(chiTietDTO.getGiaBan())
                        .soLuongTon(chiTietDTO.getSoLuongTon())
                        .trangThai(chiTietDTO.getTrangThai() != null ? chiTietDTO.getTrangThai() : true)
                        .hinhAnhChinh(chiTietDTO.getHinhAnhChinh())
                        .ngayTao(LocalDateTime.now())
                        .ngayCapNhat(LocalDateTime.now())
                        .build();
                    ChiTietSanPham savedChiTiet = chiTietSanPhamRepository.save(chiTiet);
                    
                    // Lưu hình ảnh phụ nếu có
                    if (chiTietDTO.getHinhAnhs() != null && !chiTietDTO.getHinhAnhs().isEmpty()) {
                        for (stepup.shoes.dto.HinhAnhChiTietDTO haDTO : chiTietDTO.getHinhAnhs()) {
                            stepup.shoes.entity.HinhAnhChiTiet ha = stepup.shoes.entity.HinhAnhChiTiet.builder()
                                .chiTietSanPham(savedChiTiet)
                                .duongDan(haDTO.getDuongDan())
                                .laAnhChinh(Boolean.TRUE.equals(haDTO.getLaAnhChinh()))
                                .thuTu(haDTO.getThuTu() != null ? haDTO.getThuTu() : 0)
                                .ngayTao(LocalDateTime.now())
                                .build();
                            hinhAnhChiTietRepository.save(ha);
                        }
                    }
                }
            }
        }

        return mapToDTO(updated);
    }

    public void deleteSanPham(Integer maSanPham) {
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tìm thấy với ID: " + maSanPham));
        sanPham.setDaXoa(true);
        sanPham.setNgayXoa(LocalDateTime.now());
        sanPhamRepository.save(sanPham);
    }

    private SanPhamDTO mapToDTO(SanPham sanPham) {
        List<ChiTietSanPhamDTO> chiTietDTOs = chiTietSanPhamRepository.findBySanPham_MaSanPham(sanPham.getMaSanPham())
            .stream()
            .filter(ct -> !Boolean.TRUE.equals(ct.getDaXoa()))
            .map(this::mapChiTietToDTO)
            .collect(java.util.stream.Collectors.toList());
        return SanPhamDTO.builder()
                .maSanPham(sanPham.getMaSanPham())
                .tenSanPham(sanPham.getTenSanPham())
                .moTa(sanPham.getMoTa())
                .thuongHieu(sanPham.getThuongHieu())
                .maDanhMuc(sanPham.getDanhMuc().getMaDanhMuc())
                .tenDanhMuc(sanPham.getDanhMuc().getTenDanhMuc())
                .giaCoBan(sanPham.getGiaCoBan())
                .trangThai(sanPham.getTrangThai())
                .ngayTao(sanPham.getNgayTao())
                .ngayCapNhat(sanPham.getNgayCapNhat())
                .chiTietSanPhams(chiTietDTOs)
                .build();
    }

    private ChiTietSanPhamDTO mapChiTietToDTO(ChiTietSanPham chiTiet) {
        List<stepup.shoes.dto.HinhAnhChiTietDTO> hinhAnhDTOs = hinhAnhChiTietRepository
            .findByChiTietSanPham_MaChiTietOrderByThuTuAsc(chiTiet.getMaChiTiet())
            .stream()
            .map(ha -> stepup.shoes.dto.HinhAnhChiTietDTO.builder()
                .duongDan(ha.getDuongDan())
                .laAnhChinh(ha.getLaAnhChinh())
                .thuTu(ha.getThuTu())
                .build())
            .collect(Collectors.toList());
        
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
                .hinhAnhs(hinhAnhDTOs)
                .build();
    }
}
