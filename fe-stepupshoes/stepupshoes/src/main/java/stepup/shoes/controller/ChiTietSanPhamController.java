package stepup.shoes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.ApiResponseDTO;
import stepup.shoes.dto.ChiTietSanPhamDTO;
import stepup.shoes.service.ChiTietSanPhamService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chi-tiet-san-pham")
@RequiredArgsConstructor
public class ChiTietSanPhamController {
    private final ChiTietSanPhamService chiTietSanPhamService;

    @GetMapping("/san-pham/{maSanPham}")
    public ResponseEntity<ApiResponseDTO<List<ChiTietSanPhamDTO>>> getBySanPham(@PathVariable Integer maSanPham) {
        List<ChiTietSanPhamDTO> list = chiTietSanPhamService.getBySanPhamId(maSanPham);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Lấy chi tiết sản phẩm thành công", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ChiTietSanPhamDTO>> getById(@PathVariable Integer id) {
        ChiTietSanPhamDTO dto = chiTietSanPhamService.getById(id);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Lấy chi tiết thành công", dto));
    }

    @PostMapping("/san-pham/{maSanPham}")
    public ResponseEntity<ApiResponseDTO<ChiTietSanPhamDTO>> create(@PathVariable Integer maSanPham, @RequestBody ChiTietSanPhamDTO dto) {
        ChiTietSanPhamDTO created = chiTietSanPhamService.create(maSanPham, dto);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Tạo biến thể thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ChiTietSanPhamDTO>> update(@PathVariable Integer id, @RequestBody ChiTietSanPhamDTO dto) {
        ChiTietSanPhamDTO updated = chiTietSanPhamService.update(id, dto);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Cập nhật biến thể thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<String>> delete(@PathVariable Integer id) {
        chiTietSanPhamService.delete(id);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Xóa biến thể thành công", null));
    }
}
