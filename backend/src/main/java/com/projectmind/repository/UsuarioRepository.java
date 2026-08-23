package com.projectmind.repository;

import com.projectmind.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Busca usuário pelo e-mail para validação de login
    Optional<Usuario> findByEmail(String email);
    
    // Verifica se já existe um cadastro com este e-mail
    boolean existsByEmail(String email);
}