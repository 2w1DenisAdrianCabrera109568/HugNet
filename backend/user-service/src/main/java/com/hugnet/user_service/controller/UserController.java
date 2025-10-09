package com.hugnet.user_service.controller;


import com.hugnet.user_service.DTO.CreateUserDTO;
import com.hugnet.user_service.DTO.LoginRequestDTO;
import com.hugnet.user_service.DTO.UserDTO;
import com.hugnet.user_service.entity.User;
import com.hugnet.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<UserDTO> register(@RequestBody CreateUserDTO dto) {
        return ResponseEntity.ok(userService.register(dto));
    }

    // Endpoint for user login
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequestDTO req) {
        return ResponseEntity.ok(userService.login(req.getEmail(), req.getPassword()));
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
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    //DELETE user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

}