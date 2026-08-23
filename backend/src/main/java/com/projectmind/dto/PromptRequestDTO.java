package com.projectmind.dto;

public class PromptRequestDTO {

    private Long projetoId;
    private String pergunta;
    private String contextoAdicional;

    public PromptRequestDTO() {}

    public Long getProjetoId() { 
        return projetoId; 
    }
    
    public void setProjetoId(Long projetoId) { 
        this.projetoId = projetoId; 
    }

    public String getPergunta() { 
        return pergunta; 
    }
    
    public void setPergunta(String pergunta) { 
        this.pergunta = pergunta; 
    }

    public String getContextoAdicional() { 
        return contextoAdicional; 
    }
    
    public void setContextoAdicional(String contextoAdicional) { 
        this.contextoAdicional = contextoAdicional; 
    }
}