package stepup.shoes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import stepup.shoes.dto.JwtResponseDTO;
import stepup.shoes.dto.LoginDTO;
import stepup.shoes.dto.NguoiDungDTO;
import stepup.shoes.entity.NguoiDung;
import stepup.shoes.exception.BadRequestException;
import stepup.shoes.exception.ResourceNotFoundException;
import stepup.shoes.repository.NguoiDungRepository;
import stepup.shoes.security.JwtProvider;
import stepup.shoes.security.UserPrincipal;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final NguoiDungRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // public JwtResponseDTO login(LoginDTO loginDTO) {
    //     Authentication authentication = authenticationManager.authenticate(
    //             new UsernamePasswordAuthenticationToken(
    //                     loginDTO.getTenDangNhap(),
    //                     loginDTO.getMatKhau()
    //             )
    //     );

    //     UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    //     String token = jwtProvider.generateToken(authentication);

    //     return new JwtResponseDTO(
    //             token,
    //             userPrincipal.getId(),
    //             userPrincipal.getUsername(),
    //             userPrincipal.getEmail(),
    //             userPrincipal.getAuthorities().stream()
    //                     .map(auth -> auth.getAuthority().replace("ROLE_", ""))
    //                     .findFirst()
    //                     .orElse("khach_hang")
    //     );
    // }

    public JwtResponseDTO login(LoginDTO loginDTO) {
    try {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getTenDangNhap(),
                        loginDTO.getMatKhau()
                )
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtProvider.generateToken(authentication);

        String vaiTro = userPrincipal.getAuthorities().stream()
                        .map(auth -> auth.getAuthority().replace("ROLE_", "").toLowerCase())
                        .findFirst()
                        .orElse("khach_hang");

        System.out.println("DEBUG Login: User " + userPrincipal.getUsername() + " with authorities: " + userPrincipal.getAuthorities() + ", vaiTro: " + vaiTro);

        return new JwtResponseDTO(
                token,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                vaiTro
        );

    } catch (org.springframework.security.authentication.BadCredentialsException e) {
        throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không đúng!");
    } catch (org.springframework.security.authentication.DisabledException e) {
        throw new BadRequestException("Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ quản trị viên!");
    } catch (org.springframework.security.authentication.LockedException e) {
        throw new BadRequestException("Tài khoản đã bị khóa!");
    } catch (Exception e) {
        throw new BadRequestException("Đăng nhập thất bại, vui lòng thử lại sau!");
    }
}


    public NguoiDungDTO register(NguoiDungDTO nguoiDungDTO) {
        if (userRepository.findByTenDangNhap(nguoiDungDTO.getTenDangNhap()).isPresent()) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại");
        }

        if (userRepository.findByEmail(nguoiDungDTO.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã tồn tại");
        }

        // Determine role: if provided and valid, use it; otherwise default to 'khach_hang'
        // Valid roles: khach_hang, nhan_vien, quan_tri
        String vaiTro = "khach_hang";
        if (nguoiDungDTO.getVaiTro() != null) {
            String requestedRole = nguoiDungDTO.getVaiTro().toLowerCase().trim();
            if (requestedRole.equals("admin") || requestedRole.equals("quan_tri")) {
                vaiTro = "quan_tri";
            } else if (requestedRole.equals("nhan_vien")) {
                vaiTro = "nhan_vien";
            } else if (requestedRole.equals("khach_hang")) {
                vaiTro = "khach_hang";
            }
        }

        NguoiDung newUser = NguoiDung.builder()
                .tenDangNhap(nguoiDungDTO.getTenDangNhap())
                .matKhau(passwordEncoder.encode(nguoiDungDTO.getMatKhau()))
                .email(nguoiDungDTO.getEmail())
                .hoTen(nguoiDungDTO.getHoTen())
                .soDienThoai(nguoiDungDTO.getSoDienThoai())
                .diaChi(nguoiDungDTO.getDiaChi())
                .vaiTro(vaiTro)
                .trangThai(true)
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        NguoiDung saved = userRepository.save(newUser);
        return mapToDTO(saved);
    }

    public NguoiDungDTO getUserById(Integer maNguoiDung) {
        NguoiDung user = userRepository.findById(maNguoiDung)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tìm thấy"));
        return mapToDTO(user);
    }

    private NguoiDungDTO mapToDTO(NguoiDung user) {
        return NguoiDungDTO.builder()
                .maNguoiDung(user.getMaNguoiDung())
                .tenDangNhap(user.getTenDangNhap())
                .matKhau(user.getMatKhau())
                .email(user.getEmail())
                .hoTen(user.getHoTen())
                .soDienThoai(user.getSoDienThoai())
                .diaChi(user.getDiaChi())
                .vaiTro(user.getVaiTro())
                .trangThai(user.getTrangThai())
                .ngayTao(user.getNgayTao())
                .ngayCapNhat(user.getNgayCapNhat())
                .build();
    }
}
