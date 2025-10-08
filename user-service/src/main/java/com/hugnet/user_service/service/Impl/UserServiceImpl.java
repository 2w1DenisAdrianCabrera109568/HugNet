package com.hugnet.user_service.service.Impl;

import com.hugnet.user_service.DTO.CreateUserDTO;
import com.hugnet.user_service.DTO.UserDTO;
import com.hugnet.user_service.DTO.common.UserMapper;
import com.hugnet.user_service.entity.User;
import com.hugnet.user_service.repository.UserRepository;
import com.hugnet.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repo;
    private final UserMapper mapper;

    @Override
    public UserDTO register(CreateUserDTO dto) {
        repo.findByEmail(dto.getEmail()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email ya registrado");
        });
        User saved = repo.save(mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }

    @Override
    public UserDTO login(String email, String password) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }
        return mapper.toDTO(user);
    }

    @Override
    public List<UserDTO> getAll() {
        return mapper.toDTOList(repo.findAll());
    }

    @Override
    public UserDTO getById(Long id) {
        return mapper.toDTO(repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Override
    public UserDTO update(Long id, UserDTO userDTO) {
        User existing = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        existing.setNombre(userDTO.getNombre());
        existing.setApellido(userDTO.getApellido());
        existing.setEmail(userDTO.getEmail());
        existing.setRol(userDTO.getRol());
        existing.setActivo(userDTO.isActivo());
        User saved = repo.save(existing);
        return mapper.toDTO(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repo.deleteById(id);

    }
    @Override
    public List<UserDTO> getByRol(String rol) {
        return mapper.toDTOList(repo.findByRol(rol));
    }
}