package com.projectmind.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks_ia")
public class FeedbackIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer scoreSaude;

    @Column(columnDefinition = "TEXT")
    private String sugestaoMelhoria;

    @Column(columnDefinition = "JSONB")
    private String diagnosticoJson;

    private LocalDateTime dataAnalise;

    @ManyToOne
    @JoinColumn(name = "id_projeto")
    private Projeto projeto;

    public FeedbackIA() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getScoreSaude() { return scoreSaude; }
    public void setScoreSaude(Integer scoreSaude) { this.scoreSaude = scoreSaude; }

    public String getSugestaoMelhoria() { return sugestaoMelhoria; }
    public void setSugestaoMelhoria(String sugestaoMelhoria) { this.sugestaoMelhoria = sugestaoMelhoria; }

    public String getDiagnosticoJson() { return diagnosticoJson; }
    public void setDiagnosticoJson(String diagnosticoJson) { this.diagnosticoJson = diagnosticoJson; }

    public LocalDateTime getDataAnalise() { return dataAnalise; }
    public void setDataAnalise(LocalDateTime dataAnalise) { this.dataAnalise = dataAnalise; }

    public Projeto getProjeto() { return projeto; }
    public void setProjeto(Projeto projeto) { this.projeto = projeto; }
}