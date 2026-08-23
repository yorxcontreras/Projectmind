package com.projectmind.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DiagnosticoDTO {

    private Long projetoId;
    private Integer scoreSaude;
    private String analiseCaminhoCritico;
    private List<String> tarefasCriticasIds;
    private List<String> sugestoesIA;
    private List<String> licoesAprendidasRelevantes;
    private LocalDateTime dataGeracao;

    public DiagnosticoDTO() {
        this.dataGeracao = LocalDateTime.now();
    }

    public Long getProjetoId() { return projetoId; }
    public void setProjetoId(Long projetoId) { this.projetoId = projetoId; }

    public Integer getScoreSaude() { return scoreSaude; }
    public void setScoreSaude(Integer scoreSaude) { this.scoreSaude = scoreSaude; }

    public String getAnaliseCaminhoCritico() { return analiseCaminhoCritico; }
    public void setAnaliseCaminhoCritico(String analiseCaminhoCritico) { this.analiseCaminhoCritico = analiseCaminhoCritico; }

    public List<String> getTarefasCriticasIds() { return tarefasCriticasIds; }
    public void setTarefasCriticasIds(List<String> tarefasCriticasIds) { this.tarefasCriticasIds = tarefasCriticasIds; }

    public List<String> getSugestoesIA() { return sugestoesIA; }
    public void setSugestoesIA(List<String> sugestoesIA) { this.sugestoesIA = sugestoesIA; }

    public List<String> getLicoesAprendidasRelevantes() { return licoesAprendidasRelevantes; }
    public void setLicoesAprendidasRelevantes(List<String> licoesAprendidasRelevantes) { this.licoesAprendidasRelevantes = licoesAprendidasRelevantes; }

    public LocalDateTime getDataGeracao() { return dataGeracao; }
    public void setDataGeracao(LocalDateTime dataGeracao) { this.dataGeracao = dataGeracao; }
}