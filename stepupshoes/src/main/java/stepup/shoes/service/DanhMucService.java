package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import stepup.shoes.dto.DanhMucDTO;
import stepup.shoes.entity.DanhMuc;
import stepup.shoes.exception.ResourceNotFoundException;
import stepup.shoes.repository.DanhMucRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;

    public DanhMucDTO getDanhMucById(Integer maDanhMuc) {
        DanhMuc danhMuc = danhMucRepository.findById(maDanhMuc)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tìm thấy với ID: " + maDanhMuc));
        return mapToDTO(danhMuc);
    }

    public List<DanhMucDTO> getAllDanhMuc() {
        return danhMucRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DanhMucDTO> getDanhMucActive() {
        return danhMucRepository.findByTrangThaiTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DanhMucDTO createDanhMuc(DanhMucDTO danhMucDTO) {
        DanhMuc danhMuc = DanhMuc.builder()
                .tenDanhMuc(danhMucDTO.getTenDanhMuc())
                .moTa(danhMucDTO.getMoTa())
                .maDanhMucCha(danhMucDTO.getMaDanhMucCha())
                .trangThai(danhMucDTO.getTrangThai() != null ? danhMucDTO.getTrangThai() : true)
                .ngayTao(LocalDateTime.now())
                .build();

        DanhMuc saved = danhMucRepository.save(danhMuc);
        return mapToDTO(saved);
    }

    public DanhMucDTO updateDanhMuc(Integer maDanhMuc, DanhMucDTO danhMucDTO) {
        DanhMuc danhMuc = danhMucRepository.findById(maDanhMuc)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tìm thấy với ID: " + maDanhMuc));

        danhMuc.setTenDanhMuc(danhMucDTO.getTenDanhMuc());
        danhMuc.setMoTa(danhMucDTO.getMoTa());
        danhMuc.setMaDanhMucCha(danhMucDTO.getMaDanhMucCha());
        danhMuc.setTrangThai(danhMucDTO.getTrangThai());

        DanhMuc updated = danhMucRepository.save(danhMuc);
        return mapToDTO(updated);
    }

    public void deleteDanhMuc(Integer maDanhMuc) {
        DanhMuc danhMuc = danhMucRepository.findById(maDanhMuc)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tìm thấy với ID: " + maDanhMuc));
        danhMucRepository.delete(danhMuc);
    }

    private DanhMucDTO mapToDTO(DanhMuc danhMuc) {
        return DanhMucDTO.builder()
                .maDanhMuc(danhMuc.getMaDanhMuc())
                .tenDanhMuc(danhMuc.getTenDanhMuc())
                .moTa(danhMuc.getMoTa())
                .maDanhMucCha(danhMuc.getMaDanhMucCha())
                .trangThai(danhMuc.getTrangThai())
                .ngayTao(danhMuc.getNgayTao())
                .build();
    }
}
