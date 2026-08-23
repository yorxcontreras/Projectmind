package com.projectmind.service;

import com.projectmind.domain.LicaoAprendida;
import com.projectmind.domain.Projeto;
import com.projectmind.domain.Tarefa;
import com.projectmind.dto.DiagnosticoDTO;
import com.projectmind.repository.ProjetoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditoriaService {

    private final ProjetoRepository projetoRepository;
    private final GrafosService grafosService;
    private final RAGService ragService;

    public AuditoriaService(ProjetoRepository projetoRepository, 
                            GrafosService grafosService, 
                            RAGService ragService) {
        this.projetoRepository = projetoRepository;
        this.grafosService = grafosService;
        this.ragService = ragService;
    }

    /**
     * Processa a análise prescritiva do projeto com IA e Grafos.
     */
    public DiagnosticoDTO processarAnaliselA(Long projetoId) {
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com ID: " + projetoId));

        List<Tarefa> tarefas = projeto.getTarefas();

        // 1. Executa o algoritmo de Grafos (CPM)
        List<Long> caminhoCriticoIds = grafosService.calcularCaminhoCritico(tarefas);

        // 2. Executa a busca semântica por RAG
        List<LicaoAprendida> licoes = ragService.buscarLicoesRelevantes(projeto.getDescricao());

        // 3. Monta o DTO de resposta ajustado para o React
        DiagnosticoDTO diagnostico = new DiagnosticoDTO();
        diagnostico.setProjetoId(projetoId);
        
        // Exemplo de cálculo de score baseado em riscos x tarefas do caminho crítico
        int scoreCalculado = Math.max(10, 100 - (caminhoCriticoIds.size() * 5));
        diagnostico.setScoreSaude(scoreCalculado);

        diagnostico.setAnaliseCaminhoCritico("O caminho crítico possui " + caminhoCriticoIds.size() + " tarefas gargalo.");
        diagnostico.setTarefasCriticasIds(caminhoCriticoIds.stream().map(String::valueOf).collect(Collectors.toList()));

        diagnostico.setLicoesAprendidasRelevantes(
            licoes.stream().map(LicaoAprendida::getDescricaoConhecimento).collect(Collectors.toList())
        );

        diagnostico.setSugestoesIA(List.of(
            "Alocar mais desenvolvedores nas tarefas do caminho crítico.",
            "Reavaliar dependências com o time de infraestrutura para evitar atrasos."
        ));

        return diagnostico;
    }
}