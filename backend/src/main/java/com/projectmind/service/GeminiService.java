package com.projectmind.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent}")
    private String apiUrl;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Envia o prompt diretamente para a API oficial do Google Gemini e retorna a resposta gerada.
     * Inclui mecanismo de tentativas automáticas em caso de erro 503 (alta demanda temporária).
     */
    public String gerarResposta(String promptSystem, String promptUser) {
        String promptCompleto = (promptSystem != null && !promptSystem.trim().isEmpty()) 
                ? promptSystem + "\n\n" + promptUser 
                : promptUser;

        String keyToUse = apiKey != null ? apiKey.trim() : "";

        if (!keyToUse.isEmpty()) {
            int maxTentativas = 3;
            for (int tentativa = 1; tentativa <= maxTentativas; tentativa++) {
                try {
                    log.info("Enviando requisição diretamente para a API Google Gemini (tentativa {}/{})...", tentativa, maxTentativas);
                    String fullUrl = apiUrl + "?key=" + keyToUse;

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);

                    Map<String, Object> part = Map.of("text", promptCompleto);
                    Map<String, Object> content = Map.of("parts", List.of(part));
                    Map<String, Object> requestBody = Map.of("contents", List.of(content));

                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                    ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Map responseBody = response.getBody();
                        List candidates = (List) responseBody.get("candidates");
                        if (candidates != null && !candidates.isEmpty()) {
                            Map firstCandidate = (Map) candidates.get(0);
                            Map contentMap = (Map) firstCandidate.get("content");
                            if (contentMap != null) {
                                List parts = (List) contentMap.get("parts");
                                if (parts != null && !parts.isEmpty()) {
                                    Map firstPart = (Map) parts.get(0);
                                    String respostaGemini = (String) firstPart.get("text");
                                    log.info("Resposta recebida com sucesso da API Gemini!");
                                    return respostaGemini;
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Instabilidade temporária na API Gemini (tentativa {}/{}): {}", tentativa, maxTentativas, e.getMessage());
                    
                    // Se for erro 503 (High Demand) ou 429 (Rate Limit) e ainda houver tentativas, aguarda 1s e tenta de novo
                    if (e.getMessage() != null && (e.getMessage().contains("503") || e.getMessage().contains("429")) && tentativa < maxTentativas) {
                        try {
                            Thread.sleep(1200 * tentativa);
                        } catch (InterruptedException ignored) {}
                        continue;
                    }

                    if (tentativa == maxTentativas) {
                        if (e.getMessage() != null && e.getMessage().contains("503")) {
                            return "⚡ A API do Gemini está enfrentando um pico de alta demanda temporário no momento (Erro 503 nos servidores do Google). Por favor, aguarde alguns segundos e envie sua mensagem novamente!";
                        }
                        return "⚠️ Ocorreu um erro ao conectar à API da Gemini: " + e.getMessage() + ". Verifique se a sua chave GEMINI_API_KEY é válida.";
                    }
                }
            }
        }

        log.warn("Chave GEMINI_API_KEY não configurada.");
        return "⚠️ A chave da API Gemini não foi configurada no application.properties.";
    }
}
