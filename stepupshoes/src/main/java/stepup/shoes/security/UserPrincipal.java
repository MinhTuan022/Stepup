package stepup.shoes.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import stepup.shoes.entity.NguoiDung;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {
    private Integer id;
    private String username;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Integer id, String username, String email, String password,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(NguoiDung user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getVaiTro() != null) {
            // Keep the vaiTro as-is from database (quan_tri, nhan_vien, khach_hang)
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getVaiTro().toUpperCase()));
        }
        return new UserPrincipal(
                user.getMaNguoiDung(),
                user.getTenDangNhap(),
                user.getEmail(),
                user.getMatKhau(),
                authorities
        );
    }

    public Integer getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
