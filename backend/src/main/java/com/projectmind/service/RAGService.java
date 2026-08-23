package com.projectmind.service;

import com.projectmind.domain.LicaoAprendida;
import com.projectmind.repository.LicaoAprendidaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RAGService {

    private final LicaoAprendidaRepository licaoAprendidaRepository;

    public RAGService(LicaoAprendidaRepository licaoAprendidaRepository) {
        this.licaoAprendidaRepository = licaoAprendidaRepository;
    }

    /**
     * Consulta no PostgreSQL com PGVector as lições aprendidas mais similares.
     */
    public List<LicaoAprendida> buscarLicoesRelevantes(String contextoProjeto) {
        // TODO: Gerar o vetor embedding do contextoProjeto usando LangChain4j
        String embeddingFake = "[0.12, -0.43, ...]";

        try {
            // Tenta buscar no banco via PGVector
            return licaoAprendidaRepository.buscarSimilaresPorVetor(embeddingFake, 3);
        } catch (Exception e) {
            // Fallback caso a extensão PGVector ainda não esteja totalmente populada
            return licaoAprendidaRepository.findByCategoria("Geral");
        }
    }
}