package com.projectmind.repository;

import com.projectmind.domain.LicaoAprendida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LicaoAprendidaRepository extends JpaRepository<LicaoAprendida, Long> {
    
    // Busca lições aprendidas por categoria (ex: "Riscos", "Cronograma")
    List<LicaoAprendida> findByCategoria(String categoria);

    // Método preparado para a busca por similaridade de embeddings via PGVector no PostgreSQL
    @Query(value = "SELECT * FROM licoes_aprendidas_vetores ORDER BY vetor_embedding <=> CAST(:embedding AS vector) LIMIT :limite", nativeQuery = true)
    List<LicaoAprendida> buscarSimilaresPorVetor(@Param("embedding") String embedding, @Param("limite") int limite);
}