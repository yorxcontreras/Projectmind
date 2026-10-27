package com.projectmind.repository;

import com.projectmind.domain.Risco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiscoRepository extends JpaRepository<Risco, Long> {
    List<Risco> findByProjetoId(Long projetoId);
}
