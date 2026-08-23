package com.projectmind.controller;

import com.projectmind.domain.Projeto;
import com.projectmind.domain.Risco;
import com.projectmind.domain.Tarefa;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projetos")
@CrossOrigin(origins = "*")
public class ProjetoController {

    // GET /api/projetos - Lista todos os projetos do usuário
    @GetMapping
    public ResponseEntity<List<Projeto>> listarProjetos() {
        // TODO: Buscar projetos reais no ProjetoRepository
        List<Projeto> projetos = new ArrayList<>(); 
        return ResponseEntity.ok(projetos);
    }

    // GET /api/projetos/{id} - Busca detalhes de um projeto específico
    @GetMapping("/{id}")
    public ResponseEntity<?> obterProjetoPorId(@PathVariable Long id) {
        // TODO: Buscar no ProjetoRepository por ID
        return ResponseEntity.ok(Map.of("id", id, "nome", "Projeto Exemplo"));
    }

    // POST /api/projetos - Cria um novo projeto
    @PostMapping
    public ResponseEntity<Projeto> criarProjeto(@RequestBody Projeto projeto) {
        // TODO: Salvar via ProjetoRepository
        return ResponseEntity.status(HttpStatus.CREATED).body(projeto);
    }

    // POST /api/projetos/{id}/tarefas - Adiciona uma tarefa com dependências ao projeto
    @PostMapping("/{id}/tarefas")
    public ResponseEntity<?> adicionarTarefa(@PathVariable Long id, @RequestBody Tarefa tarefa) {
        // TODO: Vincular tarefa ao projeto e calcular regras de precedência (TI, II, TT, IT)
        return ResponseEntity.status(HttpStatus.CREATED).body(tarefa);
    }

    // POST /api/projetos/{id}/riscos - Registra um novo risco no projeto
    @PostMapping("/{id}/riscos")
    public ResponseEntity<?> adicionarRisco(@PathVariable Long id, @RequestBody Risco risco) {
        // TODO: Salvar risco no banco
        return ResponseEntity.status(HttpStatus.CREATED).body(risco);
    }

    // DELETE /api/projetos/{id} - Remove um projeto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProjeto(@PathVariable Long id) {
        // TODO: Deletar via ProjetoRepository
        return ResponseEntity.noContent().build();
    }
}