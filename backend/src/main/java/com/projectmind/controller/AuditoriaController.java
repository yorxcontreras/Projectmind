package com.projectmind.controller;

import com.projectmind.dto.AnaliseProjetoDTO;
import com.projectmind.dto.DiagnosticoDTO;
import com.projectmind.dto.PromptRequestDTO;
import com.projectmind.service.AnaliseProjetoService;
import com.projectmind.service.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "*")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;
    private final AnaliseProjetoService analiseProjetoService;

    public AuditoriaController(AuditoriaService auditoriaService, AnaliseProjetoService analiseProjetoService) {
        this.auditoriaService = auditoriaService;
        this.analiseProjetoService = analiseProjetoService;
    }

    // POST /api/auditoria/analisar/{projetoId}
    // Executa a auditoria completa: Grafos (CPM) + RAG + Monte Carlo + Gemini IA
    @PostMapping("/analisar/{projetoId}")
    public ResponseEntity<DiagnosticoDTO> executarAuditoriaCompleta(@PathVariable Long projetoId) {
        DiagnosticoDTO diagnostico = auditoriaService.processarAnaliseIA(projetoId);
        return ResponseEntity.ok(diagnostico);
    }

    // GET /api/auditoria/metricas/{projetoId}
    // Retorna as métricas analíticas e preditivas do projeto
    @GetMapping("/metricas/{projetoId}")
    public ResponseEntity<?> obterMetricasProjeto(@PathVariable Long projetoId) {
        AnaliseProjetoDTO analise = analiseProjetoService.analisar(projetoId);
        if (analise == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(analise);
    }

    // POST /api/auditoria/chat
    // Endpoint para conversar interativamente no chat com a IA Gemini
    @PostMapping("/chat")
    public ResponseEntity<?> interagirChatIA(@RequestBody PromptRequestDTO request) {
        Long projetoId = request.getProjetoId();
        String pergunta = request.getPergunta();
        String contexto = request.getContextoAdicional();
        boolean primeiraMensagem = request.getPrimeiraMensagem() != null ? request.getPrimeiraMensagem() : true;

        if (pergunta == null || pergunta.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A pergunta não pode ser vazia."));
        }

        String respostaIA = auditoriaService.interagirChatIA(projetoId, pergunta, contexto, primeiraMensagem);
        return ResponseEntity.ok(Map.of("resposta", respostaIA));
    }
}