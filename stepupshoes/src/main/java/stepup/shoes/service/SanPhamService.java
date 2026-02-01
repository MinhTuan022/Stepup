package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
public class SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final DanhMucRepository danhMucRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final HinhAnhChiTietRepository hinhAnhChiTietRepository;

    public SanPhamDTO getSanPhamById(Integer maSanPham) {
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tìm thấy với ID: " + maSanPham));
        return mapToDTO(sanPham);
    }

    public List<SanPhamDTO> getAllSanPham() {
        return sanPhamRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SanPhamDTO> getSanPhamByDanhMuc(Integer maDanhMuc) {
        return sanPhamRepository.findByDanhMuc_MaDanhMuc(maDanhMuc)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SanPhamDTO> getSanPhamActive() {
        return sanPhamRepository.findByTrangThaiTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SanPhamDTO> searchSanPhamByName(String tenSanPham) {
        return sanPhamRepository.findByTenSanPhamContainingIgnoreCase(tenSanPham)
                .stream()
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

        // Lưu chi tiết sản phẩm duy nhất
        if (sanPhamDTO.getChiTietSanPham() != null) {
            ChiTietSanPhamDTO chiTietDTO = sanPhamDTO.getChiTietSanPham();
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

            // Lưu danh sách hình ảnh phụ nếu có
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

        // Cập nhật chi tiết sản phẩm duy nhất
        if (sanPhamDTO.getChiTietSanPham() != null) {
            ChiTietSanPham chiTiet = chiTietSanPhamRepository.findBySanPham_MaSanPham(maSanPham).stream().findFirst().orElse(null);
            ChiTietSanPhamDTO chiTietDTO = sanPhamDTO.getChiTietSanPham();
            if (chiTiet == null) {
                chiTiet = ChiTietSanPham.builder()
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
            } else {
                chiTiet.setMaSKU(chiTietDTO.getMaSKU());
                chiTiet.setMauSac(chiTietDTO.getMauSac());
                chiTiet.setSize(chiTietDTO.getSize());
                chiTiet.setGiaBan(chiTietDTO.getGiaBan());
                chiTiet.setSoLuongTon(chiTietDTO.getSoLuongTon());
                chiTiet.setTrangThai(chiTietDTO.getTrangThai());
                chiTiet.setHinhAnhChinh(chiTietDTO.getHinhAnhChinh());
                chiTiet.setNgayCapNhat(LocalDateTime.now());
            }
            chiTietSanPhamRepository.save(chiTiet);
        }

        return mapToDTO(updated);
    }

    public void deleteSanPham(Integer maSanPham) {
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tìm thấy với ID: " + maSanPham));
        sanPhamRepository.delete(sanPham);
    }

    private SanPhamDTO mapToDTO(SanPham sanPham) {
        ChiTietSanPham chiTiet = chiTietSanPhamRepository.findBySanPham_MaSanPham(sanPham.getMaSanPham()).stream().findFirst().orElse(null);
        ChiTietSanPhamDTO chiTietDTO = chiTiet != null ? mapChiTietToDTO(chiTiet) : null;
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
                .chiTietSanPham(chiTietDTO)
                .build();
    }

    private ChiTietSanPhamDTO mapChiTietToDTO(ChiTietSanPham chiTiet) {
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
                // TODO: map hình ảnh và điểm trung bình
                .build();
    }
}
