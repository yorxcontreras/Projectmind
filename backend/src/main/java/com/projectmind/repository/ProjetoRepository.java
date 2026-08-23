package com.projectmind.repository;

import com.projectmind.domain.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
    
    // Lista todos os projetos vinculados a um usuário específico
    List<Projeto> findByUsuarioId(Long usuarioId);
}