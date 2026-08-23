package com.projectmind.controller;

import com.projectmind.domain.Usuario;
import com.projectmind.dto.ProjetoDTO; // Caso precise estender
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite chamadas vindas do Frontend em React
public class AuthController {

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String senha = loginData.get("senha");

        // TODO: Substituir por chamada ao AuthService no futuro
        if ("admin@projectmind.com".equals(email) && "123456".equals(senha)) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login realizado com sucesso");
            response.put("token", "fake-jwt-token-projectmind");
            response.put("userId", 1L);
            response.put("nome", "Usuário Teste");
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Credenciais inválidas"));
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> cadastrar(@RequestBody Usuario usuario) {
        // TODO: Salvar usuário no banco via UsuarioRepository
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Usuário cadastrado com sucesso!");
        response.put("userId", 1L);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}