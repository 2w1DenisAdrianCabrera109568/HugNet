package com.hugnet.user_service.controller;


import com.hugnet.user_service.dto.*;
import com.hugnet.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService userService;

    // Endpoint for user registration
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody CreateUserDTO dto) {
        return ResponseEntity.ok(userService.registerUser(dto));
    }

    // Endpoint for user login
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> loginUser(@RequestBody LoginRequestDTO req) {
        // Ahora el controlador espera el mismo tipo que devuelve el servicio. ¡Coinciden!
        return ResponseEntity.ok(userService.loginUser(req.getEmail(), req.getPassword()));
    }

    //GET users by role
    @GetMapping("/role/{rol}")
    public ResponseEntity<List<UserDTO>> getByRol(@PathVariable String rol) {
        return ResponseEntity.ok(userService.getByRol(rol));
    }

    //GET all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    //GET user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    //PUT update user
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    //DELETE user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    //PATCH update user role
    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<String> updateUserRole(
            @PathVariable Long userId,
            @RequestBody RoleUpdateRequest request) {

        userService.changeUserRole(userId, request.getNewRole());
        return ResponseEntity.ok("Rol del usuario actualizado exitosamente.");
    }

}