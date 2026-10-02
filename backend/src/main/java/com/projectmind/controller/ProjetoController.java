package com.projectmind.controller;

import com.projectmind.domain.Projeto;
import com.projectmind.domain.Risco;
import com.projectmind.domain.Tarefa;
import com.projectmind.repository.ProjetoRepository;
import com.projectmind.repository.TarefaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projetos")
@CrossOrigin(origins = "*")
public class ProjetoController {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;

    public ProjetoController(ProjetoRepository projetoRepository, TarefaRepository tarefaRepository) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
    }

    // GET /api/projetos - Lista todos os projetos
    @GetMapping
    public ResponseEntity<List<Projeto>> listarProjetos() {
        List<Projeto> projetos = projetoRepository.findAll();
        return ResponseEntity.ok(projetos);
    }

    // GET /api/projetos/{id} - Busca detalhes de um projeto específico
    @GetMapping("/{id}")
    public ResponseEntity<?> obterProjetoPorId(@PathVariable Long id) {
        return projetoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Projeto não encontrado")));
    }

    // POST /api/projetos - Cria um novo projeto
    @PostMapping
    public ResponseEntity<Projeto> criarProjeto(@RequestBody Projeto projeto) {
        if (projeto.getDataInicio() == null) {
            projeto.setDataInicio(LocalDate.now());
        }
        Projeto salvo = projetoRepository.save(projeto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // POST /api/projetos/{id}/tarefas - Adiciona uma tarefa ao projeto
    @PostMapping("/{id}/tarefas")
    public ResponseEntity<?> adicionarTarefa(@PathVariable Long id, @RequestBody Tarefa tarefa) {
        Projeto projeto = projetoRepository.findById(id).orElse(null);
        if (projeto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Projeto não encontrado"));
        }
        tarefa.setProjeto(projeto);
        Tarefa salva = tarefaRepository.save(tarefa);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    // DELETE /api/projetos/{id} - Remove um projeto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProjeto(@PathVariable Long id) {
        if (projetoRepository.existsById(id)) {
            projetoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}