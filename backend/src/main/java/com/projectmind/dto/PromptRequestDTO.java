package com.projectmind.dto;

public class PromptRequestDTO {

    private Long projetoId;
    private String pergunta;
    private String contextoAdicional;
    private Boolean primeiraMensagem = true;

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

    public Boolean getPrimeiraMensagem() {
        return primeiraMensagem;
    }

    public void setPrimeiraMensagem(Boolean primeiraMensagem) {
        this.primeiraMensagem = primeiraMensagem;
    }
}