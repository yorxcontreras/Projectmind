package com.projectmind.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "licoes_aprendidas_vetores")
public class LicaoAprendida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String categoria;

    @Column(columnDefinition = "TEXT")
    private String descricaoConhecimento;

    public LicaoAprendida() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDescricaoConhecimento() { return descricaoConhecimento; }
    public void setDescricaoConhecimento(String descricaoConhecimento) { this.descricaoConhecimento = descricaoConhecimento; }
}