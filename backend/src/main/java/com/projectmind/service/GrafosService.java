package com.projectmind.service;

import com.projectmind.domain.Tarefa;
import org.springframework.stereotype.Service;
import org.jgrapht.graph.DefaultDirectedGraph;
import org.jgrapht.graph.DefaultEdge;
import org.jgrapht.alg.cycle.CycleDetector;
import java.util.ArrayList;
import java.util.List;

@Service
public class GrafosService {

    /**
     * Constrói o grafo direcionado de dependências e calcula as tarefas do Caminho Crítico.
     */
    public List<Long> calcularCaminhoCritico(List<Tarefa> tarefas) {
        DefaultDirectedGraph<Long, DefaultEdge> grafo = new DefaultDirectedGraph<>(DefaultEdge.class);

        // 1. Adiciona os vértices (cada tarefa pelo seu ID)
        for (Tarefa t : tarefas) {
            grafo.addVertex(t.getId());
        }

        // 2. Adiciona as arestas direcionadas com base nas precedências
        for (Tarefa t : tarefas) {
            if (t.getIdsPredecessoras() != null) {
                for (Long predId : t.getIdsPredecessoras()) {
                    if (grafo.containsVertex(predId)) {
                        grafo.addEdge(predId, t.getId());
                    }
                }
            }
        }

        // 3. Verifica se existem ciclos inválidos (A depende de B, B depende de A)
        CycleDetector<Long, DefaultEdge> cycleDetector = new CycleDetector<>(grafo);
        if (cycleDetector.detectCycles()) {
            throw new IllegalStateException("Erro no cronograma: Existe dependência cíclica entre as tarefas.");
        }

        // 4. Identifica tarefas sem sucessoras (Nós folha para ordenação do caminho crítico)
        List<Long> caminhoCriticoIds = new ArrayList<>();
        for (Tarefa t : tarefas) {
            if (grafo.outDegreeOf(t.getId()) == 0) {
                caminhoCriticoIds.add(t.getId());
            }
        }

        return caminhoCriticoIds;
    }
}