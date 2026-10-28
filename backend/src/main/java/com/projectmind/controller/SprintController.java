package com.projectmind.controller;

import com.projectmind.domain.Projeto;
import com.projectmind.domain.Sprint;
import com.projectmind.repository.ProjetoRepository;
import com.projectmind.repository.SprintRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projetos")
@CrossOrigin(origins = "*")
public class SprintController {

    private final SprintRepository sprintRepository;
    private final ProjetoRepository projetoRepository;

    public SprintController(SprintRepository sprintRepository, ProjetoRepository projetoRepository) {
        this.sprintRepository = sprintRepository;
        this.projetoRepository = projetoRepository;
    }

    @GetMapping("/{projetoId}/sprints")
    public ResponseEntity<?> listarSprints(@PathVariable Long projetoId) {
        List<Sprint> sprints = sprintRepository.findByProjetoId(projetoId);
        return ResponseEntity.ok(sprints);
    }

    @PostMapping("/{projetoId}/sprints")
    public ResponseEntity<?> criarSprint(@PathVariable Long projetoId, @RequestBody Sprint sprint) {
        Projeto projeto = projetoRepository.findById(projetoId).orElse(null);
        if (projeto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Projeto não encontrado"));
        }
        sprint.setProjeto(projeto);
        Sprint salva = sprintRepository.save(sprint);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
}