package com.projectmind.service;

import com.projectmind.domain.Tarefa;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GrafosService {

    public record TarefaCpm(
        Long id,
        String descricao,
        int duracao,
        int inicioMaisCedo,
        int fimMaisCedo,
        int inicioMaisTarde,
        int fimMaisTarde,
        int folga,
        boolean critica
    ) {}

    public record ResultadoCpm(
        List<TarefaCpm> tarefas,
        int duracaoTotal,
        List<Long> caminhoCriticoIds,
        boolean cicloDetectado,
        Map<Long, List<Long>> predecessorasValidas
    ) {}

    /**
     * Calcula o Método do Caminho Crítico (CPM) completo com passagens direta e inversa.
     */
    public ResultadoCpm calcularCpm(List<Tarefa> tarefas) {
        if (tarefas == null || tarefas.isEmpty()) {
            return new ResultadoCpm(Collections.emptyList(), 0, Collections.emptyList(), false, Collections.emptyMap());
        }

        Map<Long, Tarefa> tarefaMap = new LinkedHashMap<>();
        for (Tarefa t : tarefas) {
            if (t.getId() != null) {
                tarefaMap.put(t.getId(), t);
            }
        }

        if (tarefaMap.isEmpty()) {
            return new ResultadoCpm(Collections.emptyList(), 0, Collections.emptyList(), false, Collections.emptyMap());
        }

        // Prepara predecessoras e sucessoras válidas
        Map<Long, List<Long>> predsMap = new HashMap<>();
        Map<Long, List<Long>> sucsMap = new HashMap<>();
        Map<Long, Integer> inDegree = new HashMap<>();

        for (Long id : tarefaMap.keySet()) {
            predsMap.put(id, new ArrayList<>());
            sucsMap.put(id, new ArrayList<>());
            inDegree.put(id, 0);
        }

        for (Tarefa t : tarefas) {
            Long tid = t.getId();
            if (tid == null || !tarefaMap.containsKey(tid)) continue;

            if (t.getIdsPredecessoras() != null) {
                for (Long pId : t.getIdsPredecessoras()) {
                    // Evita auto-loop e predecessora inexistente
                    if (pId != null && !pId.equals(tid) && tarefaMap.containsKey(pId)) {
                        if (!predsMap.get(tid).contains(pId)) {
                            predsMap.get(tid).add(pId);
                            sucsMap.get(pId).add(tid);
                        }
                    }
                }
            }
        }

        for (Long id : tarefaMap.keySet()) {
            inDegree.put(id, predsMap.get(id).size());
        }

        // Ordenação Topológica de Kahn
        Queue<Long> queue = new ArrayDeque<>();
        for (Map.Entry<Long, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.add(entry.getKey());
            }
        }

        List<Long> ordemTopologica = new ArrayList<>();
        Map<Long, Integer> degCopy = new HashMap<>(inDegree);

        while (!queue.isEmpty()) {
            Long u = queue.poll();
            ordemTopologica.add(u);

            for (Long v : sucsMap.get(u)) {
                int deg = degCopy.get(v) - 1;
                degCopy.put(v, deg);
                if (deg == 0) {
                    queue.add(v);
                }
            }
        }

        if (ordemTopologica.size() < tarefaMap.size()) {
            throw new IllegalStateException("Erro no cronograma: Existe dependência cíclica entre as tarefas.");
        }

        // 1. Passagem Direta (Early Start / Early Finish)
        Map<Long, Integer> es = new HashMap<>();
        Map<Long, Integer> ef = new HashMap<>();

        for (Long id : ordemTopologica) {
            Tarefa t = tarefaMap.get(id);
            int duracao = normalizarDuracao(t.getDuracaoDias());

            int maxEfPred = 0;
            for (Long pId : predsMap.get(id)) {
                maxEfPred = Math.max(maxEfPred, ef.getOrDefault(pId, 0));
            }
            int inicioCedo = maxEfPred;
            int fimCedo = inicioCedo + duracao;

            es.put(id, inicioCedo);
            ef.put(id, fimCedo);
        }

        int duracaoTotal = 0;
        for (int fim : ef.values()) {
            duracaoTotal = Math.max(duracaoTotal, fim);
        }

        // 2. Passagem Inversa (Late Start / Late Finish)
        Map<Long, Integer> lf = new HashMap<>();
        Map<Long, Integer> ls = new HashMap<>();

        // Itera na ordem topológica inversa
        for (int i = ordemTopologica.size() - 1; i >= 0; i--) {
            Long id = ordemTopologica.get(i);
            Tarefa t = tarefaMap.get(id);
            int duracao = normalizarDuracao(t.getDuracaoDias());

            List<Long> sucs = sucsMap.get(id);
            int minLsSuc;
            if (sucs.isEmpty()) {
                minLsSuc = duracaoTotal;
            } else {
                minLsSuc = Integer.MAX_VALUE;
                for (Long sId : sucs) {
                    minLsSuc = Math.min(minLsSuc, ls.getOrDefault(sId, duracaoTotal));
                }
            }

            int fimTarde = minLsSuc;
            int inicioTarde = fimTarde - duracao;

            lf.put(id, fimTarde);
            ls.put(id, inicioTarde);
        }

        // 3. Identifica Folgas e Tarefas Críticas (Folga == 0)
        List<TarefaCpm> resultadoTarefas = new ArrayList<>();
        List<Long> caminhoCriticoIds = new ArrayList<>();

        for (Long id : ordemTopologica) {
            Tarefa t = tarefaMap.get(id);
            int dur = normalizarDuracao(t.getDuracaoDias());
            int eStart = es.get(id);
            int eFinish = ef.get(id);
            int lStart = ls.get(id);
            int lFinish = lf.get(id);
            int folga = lStart - eStart;
            boolean critica = (folga == 0);

            if (critica) {
                caminhoCriticoIds.add(id);
            }

            resultadoTarefas.add(new TarefaCpm(
                id,
                t.getDescricao(),
                dur,
                eStart,
                eFinish,
                lStart,
                lFinish,
                folga,
                critica
            ));
        }

        return new ResultadoCpm(
            resultadoTarefas,
            duracaoTotal,
            caminhoCriticoIds,
            false,
            predsMap
        );
    }

    /**
     * Mantém compatibilidade com a assinatura anterior que retornava List<Long>.
     */
    public List<Long> calcularCaminhoCritico(List<Tarefa> tarefas) {
        return calcularCpm(tarefas).caminhoCriticoIds();
    }

    private int normalizarDuracao(Integer duracao) {
        if (duracao == null) return 1;
        return Math.max(duracao, 0);
    }
}