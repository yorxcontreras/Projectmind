package com.projectmind.controller;

import com.projectmind.domain.Projeto;
import com.projectmind.domain.Risco;
import com.projectmind.domain.Tarefa;
import com.projectmind.repository.ProjetoRepository;
import com.projectmind.repository.RiscoRepository;
import com.projectmind.repository.TarefaRepository;
import com.projectmind.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projetos")
@CrossOrigin(origins = "*")
public class ProjetoController {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RiscoRepository riscoRepository;

    public ProjetoController(
        ProjetoRepository projetoRepository,
        TarefaRepository tarefaRepository,
        UsuarioRepository usuarioRepository,
        RiscoRepository riscoRepository
    ) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
        this.usuarioRepository = usuarioRepository;
        this.riscoRepository = riscoRepository;
    }

    // GET /api/projetos - Lista os projetos do usuário logado
    @GetMapping
    public ResponseEntity<List<Projeto>> listarProjetos(
            @RequestParam(required = false) Long usuarioId,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long idFinal = usuarioId != null ? usuarioId : headerUserId;
        if (idFinal == null && authHeader != null && authHeader.contains("pm-token-")) {
            try {
                String token = authHeader.replace("Bearer ", "").trim();
                idFinal = Long.parseLong(token.replace("pm-token-", "").trim());
            } catch (Exception ignored) {}
        }

        if (idFinal != null) {
            List<Projeto> projetos = projetoRepository.findByUsuarioId(idFinal);
            return ResponseEntity.ok(projetos);
        }

        // Se nenhum ID for fornecido, retorna vazio para que perfis novos subam limpos
        return ResponseEntity.ok(List.of());
    }

    // GET /api/projetos/{id} - Busca detalhes de um projeto específico
    @GetMapping("/{id}")
    public ResponseEntity<?> obterProjetoPorId(@PathVariable Long id) {
        return projetoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Projeto não encontrado")));
    }

    // POST /api/projetos - Cria um novo projeto vinculado ao usuário
    @PostMapping
    public ResponseEntity<?> criarProjeto(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String nome = (String) body.get("nome");
        String descricao = (String) body.get("descricao");

        if (nome == null || nome.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "O nome do projeto é obrigatório"));
        }

        Long usuarioId = null;
        if (body.get("usuarioId") != null) {
            try {
                usuarioId = Long.valueOf(body.get("usuarioId").toString());
            } catch (Exception ignored) {}
        }
        if (usuarioId == null && headerUserId != null) {
            usuarioId = headerUserId;
        }
        if (usuarioId == null && authHeader != null && authHeader.contains("pm-token-")) {
            try {
                String token = authHeader.replace("Bearer ", "").trim();
                usuarioId = Long.parseLong(token.replace("pm-token-", "").trim());
            } catch (Exception ignored) {}
        }

        Projeto projeto = new Projeto();
        projeto.setNome(nome.trim());
        projeto.setDescricao(descricao != null ? descricao.trim() : null);
        projeto.setDataInicio(LocalDate.now());

        if (usuarioId != null) {
            usuarioRepository.findById(usuarioId).ifPresent(projeto::setUsuario);
        }

        Projeto salvo = projetoRepository.save(projeto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // POST /api/projetos/{id}/tarefas - Adiciona uma tarefa ao projeto
    @PostMapping("/{id}/tarefas")
    public ResponseEntity<?> adicionarTarefa(@PathVariable Long id, @RequestBody Tarefa tarefa) {
        Projeto projeto = projetoRepository.findById(id).orElse(null);
        if (projeto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Projeto não encontrado"));
        }
        tarefa.setProjeto(projeto);
        if (tarefa.getPercentualConcluido() == null) {
            tarefa.setPercentualConcluido(0);
        }
        Tarefa salva = tarefaRepository.save(tarefa);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    // PUT /api/projetos/{projetoId}/tarefas/{tarefaId} - Atualiza tarefa, progresso e datas de execução
    @PutMapping("/{projetoId}/tarefas/{tarefaId}")
    public ResponseEntity<?> atualizarTarefa(
            @PathVariable Long projetoId,
            @PathVariable Long tarefaId,
            @RequestBody Tarefa dadosAtualizados) {
        return tarefaRepository.findById(tarefaId).map(tarefa -> {
            if (tarefa.getProjeto() != null && !tarefa.getProjeto().getId().equals(projetoId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "A tarefa não pertence a este projeto"));
            }
            if (dadosAtualizados.getDescricao() != null && !dadosAtualizados.getDescricao().trim().isEmpty()) {
                tarefa.setDescricao(dadosAtualizados.getDescricao().trim());
            }
            if (dadosAtualizados.getDuracaoDias() != null) {
                tarefa.setDuracaoDias(dadosAtualizados.getDuracaoDias());
            }
            if (dadosAtualizados.getTipoDependencia() != null) {
                tarefa.setTipoDependencia(dadosAtualizados.getTipoDependencia());
            }

            // Atualização de progresso e datas reais
            if (dadosAtualizados.getPercentualConcluido() != null) {
                int pct = Math.max(0, Math.min(100, dadosAtualizados.getPercentualConcluido()));
                tarefa.setPercentualConcluido(pct);

                if (pct == 0) {
                    if (dadosAtualizados.getDataInicioReal() == null) tarefa.setDataInicioReal(null);
                    if (dadosAtualizados.getDataConclusaoReal() == null) tarefa.setDataConclusaoReal(null);
                } else if (pct < 100) {
                    if (tarefa.getDataInicioReal() == null) tarefa.setDataInicioReal(LocalDate.now());
                    tarefa.setDataConclusaoReal(null);
                } else { // 100%
                    if (tarefa.getDataInicioReal() == null) tarefa.setDataInicioReal(LocalDate.now());
                    if (tarefa.getDataConclusaoReal() == null) tarefa.setDataConclusaoReal(LocalDate.now());
                }
            }

            if (dadosAtualizados.getDataInicioReal() != null) {
                tarefa.setDataInicioReal(dadosAtualizados.getDataInicioReal());
            }
            if (dadosAtualizados.getDataConclusaoReal() != null) {
                tarefa.setDataConclusaoReal(dadosAtualizados.getDataConclusaoReal());
                tarefa.setPercentualConcluido(100);
            }

            Tarefa atualizada = tarefaRepository.save(tarefa);
            return ResponseEntity.ok(atualizada);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Tarefa não encontrada")));
    }

    // DELETE /api/projetos/{projetoId}/tarefas/{tarefaId} - Exclui a tarefa de fato do banco de dados
    @DeleteMapping("/{projetoId}/tarefas/{tarefaId}")
    public ResponseEntity<?> excluirTarefa(
            @PathVariable Long projetoId,
            @PathVariable Long tarefaId) {
        return tarefaRepository.findById(tarefaId).map(tarefa -> {
            if (tarefa.getProjeto() != null && !tarefa.getProjeto().getId().equals(projetoId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "A tarefa não pertence a este projeto"));
            }

            // Remove referências dessa tarefa como predecessora em outras tarefas do projeto
            List<Tarefa> todasTarefas = tarefaRepository.findByProjetoIdOrderByOrdemSequencialAsc(projetoId);
            for (Tarefa t : todasTarefas) {
                if (t.getIdsPredecessoras() != null && t.getIdsPredecessoras().contains(tarefaId)) {
                    t.getIdsPredecessoras().remove(tarefaId);
                    tarefaRepository.save(t);
                }
            }

            tarefaRepository.delete(tarefa);
            return ResponseEntity.ok(Map.of("message", "Tarefa excluída com sucesso!"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Tarefa não encontrada")));
    }

    // POST /api/projetos/{id}/riscos - Cadastra um risco no projeto
    @PostMapping("/{id}/riscos")
    public ResponseEntity<?> adicionarRisco(@PathVariable Long id, @RequestBody Risco risco) {
        Projeto projeto = projetoRepository.findById(id).orElse(null);
        if (projeto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Projeto não encontrado"));
        }
        if (risco.getDescricao() == null || risco.getDescricao().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A descrição do risco é obrigatória"));
        }

        double prob = risco.getProbabilidade() != null ? risco.getProbabilidade() : 0.5;
        if (prob > 1.0 && prob <= 100.0) prob /= 100.0;
        risco.setProbabilidade(Math.max(0.01, Math.min(1.0, prob)));

        if (risco.getImpacto() == null || risco.getImpacto() < 0) {
            risco.setImpacto(1.0);
        }

        risco.setId(null);
        risco.setProjeto(projeto);
        Risco salvo = riscoRepository.save(risco);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // DELETE /api/projetos/{projetoId}/riscos/{riscoId} - Exclui um risco do projeto
    @DeleteMapping("/{projetoId}/riscos/{riscoId}")
    public ResponseEntity<?> excluirRisco(@PathVariable Long projetoId, @PathVariable Long riscoId) {
        return riscoRepository.findById(riscoId).map(risco -> {
            if (risco.getProjeto() != null && !risco.getProjeto().getId().equals(projetoId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "O risco não pertence a este projeto"));
            }
            riscoRepository.delete(risco);
            return ResponseEntity.ok(Map.of("message", "Risco excluído com sucesso!"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Risco não encontrado")));
    }

    // PUT /api/projetos/{id} - Atualiza o nome / descrição de um projeto no banco
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarProjeto(@PathVariable Long id, @RequestBody Projeto dadosAtualizados) {
        return projetoRepository.findById(id).<ResponseEntity<?>>map(projeto -> {
            if (dadosAtualizados.getNome() != null && !dadosAtualizados.getNome().trim().isEmpty()) {
                projeto.setNome(dadosAtualizados.getNome().trim());
            }
            if (dadosAtualizados.getDescricao() != null) {
                projeto.setDescricao(dadosAtualizados.getDescricao().trim());
            }
            if (dadosAtualizados.getDataInicio() != null) {
                projeto.setDataInicio(dadosAtualizados.getDataInicio());
            }
            if (dadosAtualizados.getDataFimPlanejada() != null) {
                projeto.setDataFimPlanejada(dadosAtualizados.getDataFimPlanejada());
            }
            Projeto salvo = projetoRepository.save(projeto);
            return ResponseEntity.ok(salvo);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Projeto não encontrado")));
    }

    // DELETE /api/projetos/{id} - Remove um projeto
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProjeto(@PathVariable Long id) {
        if (projetoRepository.existsById(id)) {
            projetoRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Projeto excluído com sucesso!"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Projeto não encontrado"));
    }
}