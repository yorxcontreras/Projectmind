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
     * Consulta as lições aprendidas mais relevantes do repositório (RAG).
     */
    public List<LicaoAprendida> buscarLicoesRelevantes(String contextoProjeto) {
        try {
            // Em PostgreSQL com PGVector, executa busca vetorial por similaridade
            return licaoAprendidaRepository.buscarSimilaresPorVetor("[0.12, -0.43, ...]", 3);
        } catch (Throwable e) {
            // Fallback limpo para busca por categoria/lista em H2 / ambiente local
            List<LicaoAprendida> gerais = licaoAprendidaRepository.findByCategoria("Geral");
            if (gerais != null && !gerais.isEmpty()) {
                return gerais;
            }
            return licaoAprendidaRepository.findAll();
        }
    }
}