package com.projectmind.service;

import com.projectmind.domain.LicaoAprendida;
import com.projectmind.repository.LicaoAprendidaRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class RAGService {

    private final LicaoAprendidaRepository licaoAprendidaRepository;

    private static final Set<String> STOPWORDS = Set.of(
        "projeto", "projetos", "para", "com", "uma", "um", "este", "esta", "esse", "essa",
        "como", "sobre", "pela", "pelo", "entre", "quando", "onde", "qual", "quais",
        "mais", "muito", "cada", "deve", "devem", "sera", "foram", "pode", "podem",
        "fazer", "sendo", "tudo", "todo", "toda", "todos", "todas"
    );

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    public RAGService(LicaoAprendidaRepository licaoAprendidaRepository) {
        this.licaoAprendidaRepository = licaoAprendidaRepository;
    }

    public List<LicaoAprendida> todasAsLicoes() {
        return licaoAprendidaRepository.findAll();
    }

    public List<LicaoAprendida> buscarLicoesRelevantes(String contextoProjeto) {
        List<LicaoAprendida> todas = todasAsLicoes();
        return rankear(todas, contextoProjeto, Collections.emptyList(), 3);
    }

    /**
     * Rankeamento de lições aprendidas baseado em similaridade léxica e priorização de categorias.
     */
    public static List<LicaoAprendida> rankear(
        List<LicaoAprendida> licoes,
        String contexto,
        List<String> categoriasPrioritarias,
        int limite
    ) {
        if (licoes == null || licoes.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> termosContexto = extrairTermos(contexto);
        Set<String> catPrioritariasNormalizadas = categoriasPrioritarias != null
            ? categoriasPrioritarias.stream().map(RAGService::normalizarTexto).collect(Collectors.toSet())
            : Collections.emptySet();

        record ScoredLicao(LicaoAprendida licao, double score) {}

        List<ScoredLicao> pontuadas = new ArrayList<>();

        for (LicaoAprendida l : licoes) {
            String textoCompleto = (l.getCategoria() != null ? l.getCategoria() + " " : "")
                + (l.getDescricaoConhecimento() != null ? l.getDescricaoConhecimento() : "");
            Set<String> termosLicao = extrairTermos(textoCompleto);

            double overlap = 0.0;
            for (String t : termosLicao) {
                if (termosContexto.contains(t)) {
                    overlap += 1.0;
                }
            }

            double score = termosLicao.isEmpty() ? 0.0 : overlap / Math.sqrt(termosLicao.size());

            // Boost por categoria prioritária (ex: se o projeto está em atraso ou tem riscos)
            if (l.getCategoria() != null && catPrioritariasNormalizadas.contains(normalizarTexto(l.getCategoria()))) {
                score += 1.5;
            }

            pontuadas.add(new ScoredLicao(l, score));
        }

        // Ordena por maior pontuação
        pontuadas.sort((a, b) -> Double.compare(b.score, a.score));

        // Se nenhuma tiver pontuação relevante, traz lições gerais ou as primeiras
        List<LicaoAprendida> resultado = pontuadas.stream()
            .filter(p -> p.score > 0.0)
            .map(p -> p.licao)
            .limit(limite)
            .collect(Collectors.toList());

        if (resultado.isEmpty()) {
            resultado = licoes.stream()
                .filter(l -> "Geral".equalsIgnoreCase(l.getCategoria()))
                .limit(limite)
                .collect(Collectors.toList());

            if (resultado.isEmpty()) {
                resultado = licoes.stream().limit(limite).collect(Collectors.toList());
            }
        }

        return resultado;
    }

    private static Set<String> extrairTermos(String texto) {
        if (texto == null || texto.isBlank()) return Collections.emptySet();
        String normalizado = normalizarTexto(texto);
        String[] tokens = normalizado.split("[^a-z0-9]+");

        Set<String> termos = new HashSet<>();
        for (String tok : tokens) {
            if (tok.length() >= 4 && !STOPWORDS.contains(tok)) {
                // Leve remoção de plural em português (ex: "atrasos" -> "atraso")
                if (tok.endsWith("s") && tok.length() > 4) {
                    tok = tok.substring(0, tok.length() - 1);
                }
                termos.add(tok);
            }
        }
        return termos;
    }

    private static String normalizarTexto(String texto) {
        if (texto == null) return "";
        String decomp = Normalizer.normalize(texto.toLowerCase(), Normalizer.Form.NFD);
        return DIACRITICS.matcher(decomp).replaceAll("");
    }
}