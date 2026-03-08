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
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    private boolean enabled;

    public UserPrincipal(Integer id, String username, String email, String password,
                         Collection<? extends GrantedAuthority> authorities,
                         boolean accountNonExpired,
                         boolean accountNonLocked,
                         boolean credentialsNonExpired,
                         boolean enabled) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
        this.enabled = enabled;
    }

    public static UserPrincipal create(NguoiDung user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getVaiTro() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getVaiTro().toUpperCase()));
        }

        boolean enabled = user.getTrangThai() == null ? true : user.getTrangThai();
        if (user.getDaXoa() != null && user.getDaXoa()) {
            enabled = false;
        }

        boolean accountNonLocked = enabled;

        return new UserPrincipal(
                user.getMaNguoiDung(),
                user.getTenDangNhap(),
                user.getEmail(),
                user.getMatKhau(),
                authorities,
                true, 
                accountNonLocked,
                true, 
                enabled
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
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
