package stepup.shoes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.ApiResponseDTO;
import stepup.shoes.entity.TinhThanh;
import stepup.shoes.service.ShippingRegionService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipping-regions")
@RequiredArgsConstructor
public class ShippingRegionController {
    private final ShippingRegionService service;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<TinhThanh>>> getAll() {
        List<TinhThanh> list = service.findAll();
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Danh sách vùng giao hàng", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<TinhThanh>> create(@RequestBody TinhThanh r) {
        TinhThanh saved = service.save(r);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Tạo vùng thành công", saved));
    }

    @PutMapping("/{code}")
    public ResponseEntity<ApiResponseDTO<TinhThanh>> update(@PathVariable String code, @RequestBody TinhThanh r) {
        r.setMaTinh(code);
        TinhThanh saved = service.save(r);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Cập nhật vùng thành công", saved));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<ApiResponseDTO<String>> delete(@PathVariable String code) {
        service.deleteByCode(code);
        return ResponseEntity.ok(new ApiResponseDTO<>(true, "Xóa vùng thành công", null));
    }
}
