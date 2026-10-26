package com.projectmind.service;

import com.projectmind.domain.Usuario;
import com.projectmind.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Método para cadastrar novo usuário
    public Usuario cadastrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado no sistema!");
        }
        // Em um sistema real haveria criptografia de senha, para o TCC salvamos direto ou validamos
        return usuarioRepository.save(usuario);
    }

    // Método para validar o login
    public Usuario fazerLogin(String email, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Valida se a senha confere
            if (usuario.getSenha().equals(senha)) {
                return usuario;
            }
        }
        throw new RuntimeException("E-mail ou senha inválidos!");
    }
}