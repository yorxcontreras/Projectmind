package com.projectmind.controller;

import com.projectmind.dto.DiagnosticoDTO;
import com.projectmind.dto.PromptRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "*")
public class AuditoriaController {

    // POST /api/auditoria/analisar/{projetoId}
    // Executa a auditoria completa: Grafos (CPM) + RAG (PGVector) + Gemini API
    @PostMapping("/analisar/{projetoId}")
    public ResponseEntity<DiagnosticoDTO> executarAuditoriaCompleta(@PathVariable Long projetoId) {
        // TODO: Integrar com AuditoriaService, GrafosService e RAGService
        
        // Estrutura do DTO de resposta para o Front-end
        DiagnosticoDTO diagnostico = new DiagnosticoDTO();
        diagnostico.setProjetoId(projetoId);
        diagnostico.setScoreSaude(78); // Exemplo de score calculado
        diagnostico.setAnaliseCaminhoCritico("Caminho crítico identificado nas tarefas T1 -> T3 -> T5.");
        diagnostico.setSugestoesIA(List.of(
            "Reduzir o tempo de alocação da tarefa de arquitetura.",
            "Mitigar o risco R2 reavaliando as dependências de infraestrutura."
        ));

        return ResponseEntity.ok(diagnostico);
    }

    // POST /api/auditoria/chat
    // Endpoint para conversar interativamente no chat com a IA
    @PostMapping("/chat")
    public ResponseEntity<?> interagirChatIA(@RequestBody PromptRequestDTO request) {
        // TODO: Enviar o prompt e o contexto para o Gemini via LangChain4j
        String perguntaUsuario = request.getPergunta();
        
        // Resposta simulada para integração
        String respostaIA = "Analisando seu projeto: Recomendo ajustar as prioridades do backlog antes do próximo ciclo de entrega.";

        return ResponseEntity.ok(Map.of("resposta", respostaIA));
    }
}