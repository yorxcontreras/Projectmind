package com.projectmind.service;

import com.projectmind.domain.LicaoAprendida;
import com.projectmind.domain.Projeto;
import com.projectmind.domain.Tarefa;
import com.projectmind.dto.DiagnosticoDTO;
import com.projectmind.repository.ProjetoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditoriaService {

    private final ProjetoRepository projetoRepository;
    private final GrafosService grafosService;
    private final RAGService ragService;
    private final GeminiService geminiService;

    public AuditoriaService(ProjetoRepository projetoRepository, 
                            GrafosService grafosService, 
                            RAGService ragService,
                            GeminiService geminiService) {
        this.projetoRepository = projetoRepository;
        this.grafosService = grafosService;
        this.ragService = ragService;
        this.geminiService = geminiService;
    }

    /**
     * Processa a análise prescritiva do projeto com IA Gemini e Grafos CPM.
     */
    public DiagnosticoDTO processarAnaliseIA(Long projetoId) {
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElse(null);

        List<Tarefa> tarefas = (projeto != null && projeto.getTarefas() != null) ? projeto.getTarefas() : new ArrayList<>();

        // 1. Executa o algoritmo de Grafos (CPM)
        List<Long> caminhoCriticoIds = new ArrayList<>();
        if (!tarefas.isEmpty()) {
            try {
                caminhoCriticoIds = grafosService.calcularCaminhoCritico(tarefas);
            } catch (Exception e) {
                // Caso ocorra exceção em ciclos ou sem tarefas
            }
        }

        // 2. Executa a busca por lições aprendidas (RAG)
        String contextoProjeto = projeto != null ? projeto.getNome() + ": " + projeto.getDescricao() : "Projeto Padrão";
        List<LicaoAprendida> licoes = ragService.buscarLicoesRelevantes(contextoProjeto);

        // 3. Consulta a IA Gemini para obter diagnóstico prescritivo real
        String systemPrompt = "Você é o Gemini, assistente inteligente de IA. Forneça uma análise prescritiva detalhada, profissional e prática para este projeto em português.";
        String userPrompt = String.format(
            "Análise do Projeto '%s'. Descrição: %s. Total de tarefas: %d. Gargalos no Caminho Crítico (CPM): %d tarefas. Por favor, forneça recomendações prescritivas estratégicas.",
            projeto != null ? projeto.getNome() : "Sem nome",
            projeto != null ? projeto.getDescricao() : "",
            tarefas.size(),
            caminhoCriticoIds.size()
        );

        String sugestaoIaTexto = geminiService.gerarResposta(systemPrompt, userPrompt);

        // 4. Monta o DTO de resposta
        DiagnosticoDTO diagnostico = new DiagnosticoDTO();
        diagnostico.setProjetoId(projetoId);
        
        int scoreCalculado = Math.max(20, 100 - (caminhoCriticoIds.size() * 6));
        diagnostico.setScoreSaude(scoreCalculado);

        diagnostico.setAnaliseCaminhoCritico(
            caminhoCriticoIds.isEmpty() 
                ? "Nenhuma dependência crítica identificada no momento." 
                : "Caminho crítico identificado nas tarefas IDs: " + caminhoCriticoIds.stream().map(String::valueOf).collect(Collectors.joining(" -> "))
        );

        diagnostico.setTarefasCriticasIds(caminhoCriticoIds.stream().map(String::valueOf).collect(Collectors.toList()));

        diagnostico.setLicoesAprendidasRelevantes(
            licoes.stream().map(LicaoAprendida::getDescricaoConhecimento).collect(Collectors.toList())
        );

        List<String> sugestoesList = new ArrayList<>();
        sugestoesList.add(sugestaoIaTexto);
        diagnostico.setSugestoesIA(sugestoesList);

        return diagnostico;
    }

    /**
     * Interage diretamente com a IA Gemini no contexto do chat.
     */
    public String interagirChatIA(Long projetoId, String pergunta, String contextoAdicional) {
        String infoProjeto = "";
        if (projetoId != null) {
            Projeto projeto = projetoRepository.findById(projetoId).orElse(null);
            if (projeto != null) {
                infoProjeto = "[Contexto do Projeto: " + projeto.getNome() + " - " + projeto.getDescricao() + "]\n";
            }
        }

        String systemPrompt = "Você é o Gemini, a inteligência artificial da Google. Responda como no site oficial do Gemini, de forma natural, completa, inteligente e prestativa em português.";
        String userPrompt = infoProjeto + (contextoAdicional != null ? contextoAdicional + "\n" : "") + pergunta;

        return geminiService.gerarResposta(systemPrompt, userPrompt);
    }
}