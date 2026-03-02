package stepup.shoes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stepup.shoes.dto.GioHangDTO;
import stepup.shoes.service.GioHangService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/gio-hang")
@RequiredArgsConstructor
public class GioHangController {
    private final GioHangService gioHangService;

    @GetMapping("/{maNguoiDung}")
    public ResponseEntity<List<GioHangDTO>> getCart(@PathVariable Integer maNguoiDung) {
        return ResponseEntity.ok(gioHangService.getCartByUser(maNguoiDung));
    }

    @PostMapping("/add")
    public ResponseEntity<GioHangDTO> addToCart(@RequestParam Integer maNguoiDung,
                                                @RequestParam Integer maChiTiet,
                                                @RequestParam Integer soLuong) {
        return ResponseEntity.ok(gioHangService.addToCart(maNguoiDung, maChiTiet, soLuong));
    }

    @PutMapping("/update")
    public ResponseEntity<GioHangDTO> updateCartItem(@RequestParam Integer maNguoiDung,
                                                     @RequestParam Integer maChiTiet,
                                                     @RequestParam Integer soLuong) {
        return ResponseEntity.ok(gioHangService.updateCartItem(maNguoiDung, maChiTiet, soLuong));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeCartItem(@RequestParam Integer maNguoiDung,
                                               @RequestParam Integer maChiTiet) {
        gioHangService.removeCartItem(maNguoiDung, maChiTiet);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear/{maNguoiDung}")
    public ResponseEntity<Void> clearCart(@PathVariable Integer maNguoiDung) {
        gioHangService.clearCart(maNguoiDung);
        return ResponseEntity.ok().build();
    }
}
