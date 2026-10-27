package com.projectmind.repository;

import com.projectmind.domain.FeedbackIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackIARepository extends JpaRepository<FeedbackIA, Long> {
    List<FeedbackIA> findByProjetoIdOrderByDataAnaliseDesc(Long projetoId);
}
