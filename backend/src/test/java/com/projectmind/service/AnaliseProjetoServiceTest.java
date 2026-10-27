package com.projectmind.service;

import com.projectmind.domain.Projeto;
import com.projectmind.domain.Risco;
import com.projectmind.domain.Tarefa;
import com.projectmind.dto.AnaliseProjetoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AnaliseProjetoServiceTest {

    private GrafosService grafosService;
    private AnaliseProjetoService analiseProjetoService;

    @BeforeEach
    public void setUp() {
        grafosService = new GrafosService();
        analiseProjetoService = new AnaliseProjetoService(
            null, null, null, null, grafosService, null
        );
    }

    @Test
    public void testCpmClassicoEIdentificacaoDeGargalo() {
        // Cria 3 tarefas: T1 (3d) -> T2 (5d) -> T3 (2d) no caminho crítico = 10d
        // E uma paralela T4 (4d) dependente de T1 com folga
        Tarefa t1 = criarTarefa(1L, "Design", 3, null);
        Tarefa t2 = criarTarefa(2L, "Desenvolvimento", 5, List.of(1L));
        Tarefa t3 = criarTarefa(3L, "Testes", 2, List.of(2L));
        Tarefa t4 = criarTarefa(4L, "Documentação", 4, List.of(1L));

        GrafosService.ResultadoCpm resultado = grafosService.calcularCpm(List.of(t1, t2, t3, t4));

        assertEquals(10, resultado.duracaoTotal(), "A duração total pelo CPM deve ser 10 dias");
        assertTrue(resultado.caminhoCriticoIds().contains(1L));
        assertTrue(resultado.caminhoCriticoIds().contains(2L));
        assertTrue(resultado.caminhoCriticoIds().contains(3L));
        assertFalse(resultado.caminhoCriticoIds().contains(4L), "T4 tem folga e não deve ser crítica");
    }

    @Test
    public void testDeteccaoDeCiclo() {
        // T1 depende de T2 e T2 depende de T1
        Tarefa t1 = criarTarefa(1L, "A", 3, List.of(2L));
        Tarefa t2 = criarTarefa(2L, "B", 3, List.of(1L));

        assertThrows(IllegalStateException.class, () -> {
            grafosService.calcularCpm(List.of(t1, t2));
        });
    }

    @Test
    public void testCalculoAnaliticoAtrasoEEarnedSchedule() {
        LocalDate inicio = LocalDate.of(2026, 1, 1);
        LocalDate hoje = inicio.plusDays(10); // 10 dias decorridos

        Projeto p = new Projeto();
        p.setId(10L);
        p.setNome("Projeto Teste");
        p.setDataInicio(inicio);
        p.setDataFimPlanejada(inicio.plusDays(15));

        // T1 (5d) 100% concluída, T2 (10d, depende de T1) com 0% concluída
        Tarefa t1 = criarTarefa(1L, "T1", 5, null);
        t1.setPercentualConcluido(100);
        t1.setDataInicioReal(inicio);
        t1.setDataConclusaoReal(inicio.plusDays(5));

        Tarefa t2 = criarTarefa(2L, "T2", 10, List.of(1L));
        t2.setPercentualConcluido(0);

        AnaliseProjetoDTO analise = analiseProjetoService.calcular(
            p, List.of(t1, t2), Collections.emptyList(), Collections.emptyList(),
            Collections.emptyList(), Collections.emptyList(), hoje
        );

        assertNotNull(analise);
        assertEquals("ATRASADO", analise.cronograma().situacaoPrazo());
        assertTrue(analise.cronograma().atrasoDias() > 0, "Deve registrar atraso de cronograma");
        assertTrue(analise.cronograma().progressoRealPercentual() > 0);
        assertNotNull(analise.previsao().dataTerminoP50());
        assertNotNull(analise.scoreSaude());
    }

    @Test
    public void testDeterminismoMonteCarlo() {
        LocalDate hoje = LocalDate.now();
        Projeto p = new Projeto();
        p.setId(99L);
        p.setNome("Projeto Estocástico");
        p.setDataInicio(hoje.minusDays(5));

        Tarefa t1 = criarTarefa(1L, "A", 10, null);
        t1.setPercentualConcluido(30);

        Risco r1 = new Risco();
        r1.setId(1L);
        r1.setDescricao("Falha de infra");
        r1.setProbabilidade(0.4);
        r1.setImpacto(5.0);

        AnaliseProjetoDTO analise1 = analiseProjetoService.calcular(
            p, List.of(t1), List.of(r1), Collections.emptyList(),
            Collections.emptyList(), Collections.emptyList(), hoje
        );

        AnaliseProjetoDTO analise2 = analiseProjetoService.calcular(
            p, List.of(t1), List.of(r1), Collections.emptyList(),
            Collections.emptyList(), Collections.emptyList(), hoje
        );

        assertEquals(analise1.previsao().dataTerminoP50(), analise2.previsao().dataTerminoP50(),
            "Mesmos dados devem gerar P50 idêntico deterministicamente");
        assertEquals(analise1.previsao().probabilidadeNoPrazo(), analise2.previsao().probabilidadeNoPrazo(),
            "Mesmos dados devem gerar probabilidade no prazo idêntica deterministicamente");
    }

    private Tarefa criarTarefa(Long id, String desc, int duracao, List<Long> preds) {
        Tarefa t = new Tarefa();
        t.setId(id);
        t.setDescricao(desc);
        t.setDuracaoDias(duracao);
        if (preds != null) {
            t.setIdsPredecessoras(new ArrayList<>(preds));
        }
        return t;
    }
}
