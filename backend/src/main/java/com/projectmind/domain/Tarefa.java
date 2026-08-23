package com.projectmind.domain;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tarefas")
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    private Integer duracaoDias;
    private Integer ordemSequencial;

    @Column(length = 2)
    private String tipoDependencia; // TI, II, TT, IT

    @ManyToOne
    @JoinColumn(name = "id_projeto")
    private Projeto projeto;

    @ElementCollection
    @CollectionTable(name = "dependencias_tarefas", joinColumns = @JoinColumn(name = "id_sucessora"))
    @Column(name = "id_predecessora")
    private List<Long> idsPredecessoras;

    public Tarefa() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Integer getDuracaoDias() { return duracaoDias; }
    public void setDuracaoDias(Integer duracaoDias) { this.duracaoDias = duracaoDias; }

    public Integer getOrdemSequencial() { return ordemSequencial; }
    public void setOrdemSequencial(Integer ordemSequencial) { this.ordemSequencial = ordemSequencial; }

    public String getTipoDependencia() { return tipoDependencia; }
    public void setTipoDependencia(String tipoDependencia) { this.tipoDependencia = tipoDependencia; }

    public Projeto getProjeto() { return projeto; }
    public void setProjeto(Projeto projeto) { this.projeto = projeto; }

    public List<Long> getIdsPredecessoras() { return idsPredecessoras; }
    public void setIdsPredecessoras(List<Long> idsPredecessoras) { this.idsPredecessoras = idsPredecessoras; }
}