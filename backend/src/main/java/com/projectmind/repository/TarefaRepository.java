package com.projectmind.repository;

import com.projectmind.domain.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    
    // Retorna todas as tarefas de um projeto ordenadas
    List<Tarefa> findByProjetoIdOrderByOrdemSequencialAsc(Long projetoId);

    // Retorna tarefas ordenadas por ID crescente (menor para o maior, última criada no fim)
    List<Tarefa> findByProjetoIdOrderByIdAsc(Long projetoId);

    // Retorna histórico de tarefas dos projetos do usuário para calibração analítica
    List<Tarefa> findByProjetoUsuarioId(Long usuarioId);
}