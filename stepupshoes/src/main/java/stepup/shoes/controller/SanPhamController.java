package stepup.shoes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.ApiResponseDTO;
import stepup.shoes.dto.SanPhamDTO;
import stepup.shoes.service.SanPhamService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/san-pham")
@RequiredArgsConstructor
@Tag(name = "Product", description = "API quản lý sản phẩm")
public class SanPhamController {

    private final SanPhamService sanPhamService;

    @GetMapping
    @Operation(summary = "Lấy tất cả sản phẩm", description = "Lấy danh sách tất cả sản phẩm")
    public ResponseEntity<ApiResponseDTO<List<SanPhamDTO>>> getAllSanPham() {
        List<SanPhamDTO> sanPhams = sanPhamService.getAllSanPham();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách thành công", sanPhams)
        );
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy sản phẩm hoạt động", description = "Lấy danh sách sản phẩm có trạng thái hoạt động")
    public ResponseEntity<ApiResponseDTO<List<SanPhamDTO>>> getActiveSanPham() {
        List<SanPhamDTO> sanPhams = sanPhamService.getSanPhamActive();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách thành công", sanPhams)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy sản phẩm theo ID", description = "Lấy chi tiết sản phẩm theo ID")
    public ResponseEntity<ApiResponseDTO<SanPhamDTO>> getSanPhamById(@PathVariable Integer id) {
        SanPhamDTO sanPham = sanPhamService.getSanPhamById(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy sản phẩm thành công", sanPham)
        );
    }

    @GetMapping("/danh-muc/{maDanhMuc}")
    @Operation(summary = "Lấy sản phẩm theo danh mục", description = "Lấy danh sách sản phẩm theo danh mục")
    public ResponseEntity<ApiResponseDTO<List<SanPhamDTO>>> getSanPhamByDanhMuc(@PathVariable Integer maDanhMuc) {
        List<SanPhamDTO> sanPhams = sanPhamService.getSanPhamByDanhMuc(maDanhMuc);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách thành công", sanPhams)
        );
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm sản phẩm", description = "Tìm kiếm sản phẩm theo tên")
    public ResponseEntity<ApiResponseDTO<List<SanPhamDTO>>> searchSanPham(
            @RequestParam String tenSanPham) {
        List<SanPhamDTO> sanPhams = sanPhamService.searchSanPhamByName(tenSanPham);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Tìm kiếm thành công", sanPhams)
        );
    }

    @PostMapping
    @Operation(summary = "Tạo sản phẩm mới", description = "Tạo một sản phẩm mới")
    public ResponseEntity<ApiResponseDTO<SanPhamDTO>> createSanPham(@RequestBody SanPhamDTO sanPhamDTO) {
        SanPhamDTO createdSanPham = sanPhamService.createSanPham(sanPhamDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponseDTO<>(true, "Tạo sản phẩm thành công", createdSanPham));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật sản phẩm", description = "Cập nhật thông tin sản phẩm")
    public ResponseEntity<ApiResponseDTO<SanPhamDTO>> updateSanPham(
            @PathVariable Integer id,
            @RequestBody SanPhamDTO sanPhamDTO) {
        SanPhamDTO updatedSanPham = sanPhamService.updateSanPham(id, sanPhamDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật sản phẩm thành công", updatedSanPham)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sản phẩm", description = "Xóa một sản phẩm theo ID")
    public ResponseEntity<ApiResponseDTO<String>> deleteSanPham(@PathVariable Integer id) {
        sanPhamService.deleteSanPham(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Xóa sản phẩm thành công", null)
        );
    }
}
