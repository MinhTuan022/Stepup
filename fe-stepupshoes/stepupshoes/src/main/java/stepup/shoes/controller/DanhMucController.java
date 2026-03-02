package stepup.shoes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.ApiResponseDTO;
import stepup.shoes.dto.DanhMucDTO;
import stepup.shoes.service.DanhMucService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/danh-muc")
@RequiredArgsConstructor
@Tag(name = "Category", description = "API quản lý danh mục sản phẩm")
public class DanhMucController {

    private final DanhMucService danhMucService;

    @GetMapping
    @Operation(summary = "Lấy tất cả danh mục", description = "Lấy danh sách tất cả danh mục")
    public ResponseEntity<ApiResponseDTO<List<DanhMucDTO>>> getAllDanhMuc() {
        List<DanhMucDTO> danhMucs = danhMucService.getAllDanhMuc();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách thành công", danhMucs)
        );
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy danh mục hoạt động", description = "Lấy danh sách danh mục có trạng thái hoạt động")
    public ResponseEntity<ApiResponseDTO<List<DanhMucDTO>>> getActiveDanhMuc() {
        List<DanhMucDTO> danhMucs = danhMucService.getDanhMucActive();
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh sách thành công", danhMucs)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy danh mục theo ID", description = "Lấy chi tiết danh mục theo ID")
    public ResponseEntity<ApiResponseDTO<DanhMucDTO>> getDanhMucById(@PathVariable Integer id) {
        DanhMucDTO danhMuc = danhMucService.getDanhMucById(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Lấy danh mục thành công", danhMuc)
        );
    }

    @PostMapping
    @Operation(summary = "Tạo danh mục mới", description = "Tạo một danh mục sản phẩm mới")
    public ResponseEntity<ApiResponseDTO<DanhMucDTO>> createDanhMuc(@RequestBody DanhMucDTO danhMucDTO) {
        DanhMucDTO createdDanhMuc = danhMucService.createDanhMuc(danhMucDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponseDTO<>(true, "Tạo danh mục thành công", createdDanhMuc));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật danh mục", description = "Cập nhật thông tin danh mục")
    public ResponseEntity<ApiResponseDTO<DanhMucDTO>> updateDanhMuc(
            @PathVariable Integer id,
            @RequestBody DanhMucDTO danhMucDTO) {
        DanhMucDTO updatedDanhMuc = danhMucService.updateDanhMuc(id, danhMucDTO);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Cập nhật danh mục thành công", updatedDanhMuc)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa danh mục", description = "Xóa một danh mục theo ID")
    public ResponseEntity<ApiResponseDTO<String>> deleteDanhMuc(@PathVariable Integer id) {
        danhMucService.deleteDanhMuc(id);
        return ResponseEntity.ok(
            new ApiResponseDTO<>(true, "Xóa danh mục thành công", null)
        );
    }
}
