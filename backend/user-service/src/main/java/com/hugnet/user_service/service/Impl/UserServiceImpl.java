package com.hugnet.user_service.service.Impl;

import com.hugnet.user_service.dto.CreateUserDTO;
import com.hugnet.user_service.dto.LoginResponseDTO;
import com.hugnet.user_service.dto.UserDTO;
import com.hugnet.user_service.dto.common.UserMapper;
import com.hugnet.user_service.config.JwtService;
import com.hugnet.user_service.entity.Rol;
import com.hugnet.user_service.entity.User;
import com.hugnet.user_service.exceptions.ResourceNotFoundException;
import com.hugnet.user_service.repository.UserRepository;
import com.hugnet.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repo;
    private final UserMapper mapper;
    private final JwtService jwtService;

    // Registro de usuario con verificación de email único
    @Override
    public UserDTO registerUser(CreateUserDTO dto) {
        repo.findByEmail(dto.getEmail()).ifPresent(u -> {
            throw new IllegalArgumentException("El email '" + dto.getEmail() + "' ya está registrado.");
        });
        User saved = repo.save(mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }

    // Inicio de sesión de usuario con generación de token JWT
    @Override
    public LoginResponseDTO loginUser(String email, String password) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }
        // Genera el token
        String token = jwtService.generateToken(user);
        // Construye y devuelve la respuesta
        return LoginResponseDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .rol(user.getRol())
                .token(token)
                .build();
    }


    // Obtención de todos los usuarios
    @Override
    public List<UserDTO> getAll() {
        return mapper.toDTOList(repo.findAll());
    }

    // Obtención de usuario por ID con manejo de excepción personalizada
    @Override
    public UserDTO getById(Long id) {
        User user = repo.findById(id)
                // ¡Refactorizado! Ahora usamos nuestra excepción personalizada.
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return mapper.toDTO(user);
    }

    // Actualización de usuario con manejo de concurrencia optimista
    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existing = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        existing.setNombre(userDTO.getNombre());
        existing.setApellido(userDTO.getApellido());
        existing.setEmail(userDTO.getEmail());
        existing.setRol(userDTO.getRol());
        existing.setActivo(userDTO.isActivo());
        User saved = repo.save(existing);
        return mapper.toDTO(saved);
    }

    // Eliminación de usuario con verificación de existencia
    @Override
    public void deleteUser(Long id) {
        if (!repo.existsById(id)) {

            throw new ResourceNotFoundException("No se puede eliminar. Usuario no encontrado con ID: " + id);
        }
        repo.deleteById(id);
    }

    // Búsqueda de usuarios por rol
    @Override
    public List<UserDTO> getByRol(String rol) {

        return mapper.toDTOList(repo.findByRol(rol));
    }

    // Cambio de rol de usuario con validación
    @Override
    @Transactional
    public void changeUserRole(Long userId, String newRoleName) {
        // 1. Buscamos el usuario en la BD.
        User userToUpdate = repo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        // 2. Convertimos el String del rol al tipo Enum 'Rol'.
        try {
            Rol newRole = Rol.valueOf(newRoleName.toUpperCase());
            userToUpdate.setRol(newRole);
        } catch (IllegalArgumentException e) {
            // Esto ocurre si el string no corresponde a ningún valor del Enum
            throw new IllegalArgumentException("El rol '" + newRoleName + "' no es válido.");
        }

        // 3. Guardamos los cambios.
        repo.save(userToUpdate);
    }
}