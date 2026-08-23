package com.projectmind.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "riscos")
public class Risco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private Double probabilidade;
    private Double impacto;

    @Column(length = 20)
    private String nivelSeveridade; // Baixo, Médio, Alto, Crítico

    @ManyToOne
    @JoinColumn(name = "id_projeto")
    private Projeto projeto;

    public Risco() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Double getProbabilidade() { return probabilidade; }
    public void setProbabilidade(Double probabilidade) { this.probabilidade = probabilidade; }

    public Double getImpacto() { return impacto; }
    public void setImpacto(Double impacto) { this.impacto = impacto; }

    public String getNivelSeveridade() { return nivelSeveridade; }
    public void setNivelSeveridade(String nivelSeveridade) { this.nivelSeveridade = nivelSeveridade; }

    public Projeto getProjeto() { return projeto; }
    public void setProjeto(Projeto projeto) { this.projeto = projeto; }
}