package org.example.is_lab.controllers;

import lombok.RequiredArgsConstructor;
import org.example.is_lab.dto.AuthDTO;
import org.example.is_lab.entity.User;
import org.example.is_lab.jwt.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.is_lab.dto.UserDTO;
import org.example.is_lab.services.UserService;

import java.util.List;

@RestController
@RequestMapping(value = "/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        UserDTO user = userService.getUser(id);
        if (user == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/by-train/{trainId}")
    public ResponseEntity<List<User>> getUsersByTrainId(@PathVariable Long trainId) {
        List<User> users = userService.getUsersByTrainId(trainId);
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/out")
    public ResponseEntity<List<UserDTO>> getInactiveUsers() {
        List<UserDTO> inactiveUsers = userService.getInactiveUsers();
        if (inactiveUsers.isEmpty()) {
            System.out.println("inactiveUsers.isEmpty()");
            return ResponseEntity.noContent().build();
        }
        System.out.println(inactiveUsers);
        return ResponseEntity.ok(inactiveUsers);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthDTO authDTO) {
        if (userService.authenticate(authDTO)) {
            User user = userService.getByEmail(authDTO.getEmail());
            String token = JwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName(), Math.toIntExact(user.getId()));
            return ResponseEntity.ok("{\"token\":\"" + token + "\"}");
        } else
            return ResponseEntity.status(401).body("{\"error\":\"Invalid email or password\"}");
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        if (createdUser == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(createdUser);
    }

    @PostMapping("/{id}/refresh-token")
    public ResponseEntity<String> refreshToken(@PathVariable Long id) {
        UserDTO user = userService.getUser(id);
        if (user == null)
            return ResponseEntity.notFound().build();
        String token = JwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName(), Math.toIntExact(user.getId()));
        return ResponseEntity.ok(token);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        if (updatedUser == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (!deleted)
            return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}