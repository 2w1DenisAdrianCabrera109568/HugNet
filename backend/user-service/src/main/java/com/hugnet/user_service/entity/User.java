package com.hugnet.user_service.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    private String nombre;
    private String apellido;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @PrePersist
    public void setDefaultRole() {
        if (this.rol == null) {
            this.rol = Rol.USUARIO;
        }
    }

    @Builder.Default
    private boolean activo = true;

    // --- MÉTODOS OBLIGATORIOS DE USER DETAILS  ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convierte tu Enum Rol en un permiso que Spring entienda (ROLE_ADMINISTRADOR, etc.)
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getUsername() {
        return email; // Le decimos a Spring que nuestro "usuario" es el email
    }

    @Override
    public String getPassword() {
        return password;
    }

    // Estos 4 métodos controlan si la cuenta expira o se bloquea. 
    // Para este proyecto, devolvemos siempre 'true' (siempre activa).
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
