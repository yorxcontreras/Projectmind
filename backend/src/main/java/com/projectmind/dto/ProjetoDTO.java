package com.projectmind.dto;

import java.time.LocalDate;
import java.util.List;

public class ProjetoDTO {

    private Long id;
    private String nome;
    private String descricao;
    private LocalDate dataInicio;
    private LocalDate dataFimPlanejada;
    private Long usuarioId;
    private Integer totalTarefas;
    private Integer totalRiscos;
    private Integer ultimoScoreSaude;

    public ProjetoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFimPlanejada() { return dataFimPlanejada; }
    public void setDataFimPlanejada(LocalDate dataFimPlanejada) { this.dataFimPlanejada = dataFimPlanejada; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Integer getTotalTarefas() { return totalTarefas; }
    public void setTotalTarefas(Integer totalTarefas) { this.totalTarefas = totalTarefas; }

    public Integer getTotalRiscos() { return totalRiscos; }
    public void setTotalRiscos(Integer totalRiscos) { this.totalRiscos = totalRiscos; }

    public Integer getUltimoScoreSaude() { return ultimoScoreSaude; }
    public void setUltimoScoreSaude(Integer ultimoScoreSaude) { this.ultimoScoreSaude = ultimoScoreSaude; }
}