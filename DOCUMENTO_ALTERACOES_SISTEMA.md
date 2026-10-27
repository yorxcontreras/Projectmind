# 📘 ProjectMind — Documento Técnico de Alterações do Sistema
**TCC — Inteligência Artificial, Grafos (CPM) e Predição de Cronogramas**  
**Data:** 27/10/2026  
**Status do Build:** Backend ✅ `BUILD SUCCESS` (Testes 100%) | Frontend ✅ `Vite Build 100%`

---

## 1. Objetivo das Alterações

Atender à solicitação de transformar a IA da plataforma em um **motor analítico preditivo orientado a dados (com comportamento de *Machine Learning / Data Analytics*)**, eliminando textos genéricos e alucinações. O sistema agora fornece:
- **Análise precisa do projeto** baseada em medições reais do cronograma;
- **Características estruturais** (volume de tarefas, densidade de dependências, duração média e nós críticos);
- **Diagnóstico objetivo de prazo** (identificação matemática se o projeto está **ATRASADO**, **NO PRAZO**, **ADIANTADO** ou **CONCLUÍDO** com dias exatos);
- **Matriz quantitativa de riscos** (probabilidade $\times$ impacto com severidade em dias);
- **Histórico e Lições Aprendidas (RAG)** calibrados com tarefas passadas do usuário;
- **Previsões estocásticas de término** (cenários mais prováveis **P50**, conservadores **P80** e probabilidade de cumprimento do prazo contratado).

---

## 2. Arquitetura da Solução Implementada

Para garantir precisão matemática, foi implementada uma **camada analítica intermediária** que processa o grafo de tarefas e o progresso físico antes de acionar a IA generativa (Gemini):

```
[ Banco Neon / PostgreSQL ]
            │
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAMADA ANALÍTICA & PREDITIVA                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CPM Real (GrafosService): ES, EF, LS, LF e Folga Total (Gargalos)    │
│ 2. Earned Schedule / EVM (AnaliseProjetoService): PV(t), EV, SPI e Dias│
│ 3. Monte Carlo Estocástico (2000 iterações com semente determinística) │
│ 4. Calibração Histórica: razões de duração real vs estimada            │
│ 5. RAG Léxico (RAGService): rankeamento semântico de lições aprendidas │
└────────────────────────────────────────────────────────────────────────┘
            │ Metadados Numéricos Estruturados
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   IA GENERATIVA (Google Gemini)                        │
│ - Prompt de sistema com diretrizes estritas orientadas a dados         │
│ - Temperatura configurada em 0.3 (respostas técnicas sem alucinação)   │
│ - Injeção automática no Chat e na Análise Prescritiva Completa         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detalhamento das Alterações por Módulo

### 3.1. Backend (Java 21 / Spring Boot 3)

#### a) Modelos de Domínio (`com.projectmind.domain`)
- **`Tarefa.java`**:
  - Adicionado `percentualConcluido` (0 a 100% de avanço físico real).
  - Adicionados `dataInicioReal` e `dataConclusaoReal` para registro histórico de execução.
- **`Risco.java`**:
  - Ajustado com anotação `@JsonIgnore` na relação com `Projeto` (evita recursão JSON).
  - Semântica de `probabilidade` (0.0 a 1.0) e `impacto` (dias de atraso potencial no término).
- **`FeedbackIA.java`**:
  - Adicionado `@JsonIgnore` em `Projeto` e campo `diagnosticoJson` para persistência dos snapshots analíticos.

#### b) Repositórios (`com.projectmind.repository`)
- **`RiscoRepository.java`** *(novo)*: interface Spring Data JPA com `findByProjetoId(Long projetoId)`.
- **`FeedbackIARepository.java`** *(novo)*: histórico de análises via `findByProjetoIdOrderByDataAnaliseDesc(Long projetoId)`.
- **`TarefaRepository.java`**: adicionado método `findByProjetoUsuarioId(Long usuarioId)` para calibração empírica.

#### c) DTOs Estruturados (`com.projectmind.dto`)
- **`AnaliseProjetoDTO.java`** *(novo)*: DTO completo em records aninhados:
  - `Caracteristicas`: total de tarefas, concluídas, em andamento, críticas, duração CPM, densidade.
  - `Cronograma`: data de início, término CPM, prazo contratado, dias decorridos, progresso real %, progresso planejado %, SPI, variação em dias e situação (`ATRASADO`, `NO_PRAZO`, `ADIANTADO`, `CONCLUIDO`).
  - `Previsao`: término Earned Schedule, término P50, término P80, probabilidade no prazo e fator de calibração.
  - `RiscoAnalisado`: lista de riscos com exposição em dias e nível de severidade.
  - `Historico`: amostras do usuário, mediana histórica e tendência do score (`MELHORANDO`, `ESTAVEL`, `PIORANDO`).
  - `alertas` e `premissas`.
- **`DiagnosticoDTO.java`**: adicionado campo `AnaliseProjetoDTO analise` para enriquecer a Análise Prescritiva.

#### d) Serviços Analíticos (`com.projectmind.service`)
- **`GrafosService.java`** *(reescrito)*:
  - Implementação completa do algoritmo clássico **CPM (Critical Path Method)** com passagens direta (*Early Start* e *Early Finish*) e inversa (*Late Start* e *Late Finish*).
  - Cálculo de folga total por tarefa: $\text{Folga} = LS - ES$.
  - Tarefas críticas identificadas estritamente com $\text{Folga} = 0$.
  - Detecção de ciclos topológicos com exceção controlada.
- **`AnaliseProjetoService.java`** *(novo)*:
  - Cálculo do **Earned Schedule ($ES_t$)**: interpolação da curva de valor planejado $PV(t)$ com o valor agregado $EV$.
  - Cálculo exato de atraso: $\text{Atraso} = \text{Dias Decorridos} - ES_t$.
  - Simulação de **Monte Carlo com 2000 iterações**: variações triangulares no trabalho restante somadas a sorteios estocásticos de Bernoulli para os riscos ativos.
  - Método `formatarParaPrompt(AnaliseProjetoDTO)`: formata todas as variáveis em um bloco técnico claro injetado nos prompts.
- **`RAGService.java`** *(aprimorado)*:
  - Rankeamento léxico real com normalização de diacríticos, remoção de stopwords em português e pontuação por overlap/tamanho de termos.
  - Priorização automática das lições aprendidas das categorias "Cronograma" (quando há atraso) e "Riscos".
- **`AuditoriaService.java`** *(atualizado)*:
  - `processarAnaliseIA(Long projetoId)`: calcula as métricas reais, monta o prompt prescritivo, invoca o Gemini e salva o snapshot do diagnóstico.
  - `interagirChatIA(Long projetoId, String pergunta, ...)`: injeta as métricas analíticas e previsões do projeto diretamente no contexto da conversa.
  - Correção de filtro de saudação: remoção segura de saudações redundantes sem cortar respostas legítimas.
- **`GeminiService.java`**:
  - Adicionada configuração `"generationConfig": {"temperature": 0.3}` para assegurar tom analítico e precisão matemática.

#### e) Controllers (`com.projectmind.controller`)
- **`AuditoriaController.java`**: adicionado o endpoint `GET /api/auditoria/metricas/{projetoId}`.
- **`ProjetoController.java`**:
  - `PUT /api/projetos/{pid}/tarefas/{tid}`: suporte à edição de percentual de conclusão e sincronização de datas reais.
  - `POST /api/projetos/{id}/riscos`: criação de riscos validados.
  - `DELETE /api/projetos/{pid}/riscos/{rid}`: exclusão de riscos vinculados ao projeto.

---

### 3.2. Frontend (React + Vite + Tailwind)

- **`projetoService.js`**: adicionada função `excluirRisco(projetoId, riscoId)`.
- **`auditoriaService.js`**: adicionada função `obterMetricasProjeto(projetoId)`.
- **`ChatPage.jsx`**:
  - Removido o regex local agressivo que causava perda de texto das respostas.
  - Mantida a flag `primeiraMensagem` para suprimir saudações repetidas a partir da 2ª interação.
- **`ProjetoPage.jsx`**:
  - **Métricas Superiores:** substituição dos dados estáticos (72%, 45%, 3) pelos números reais do backend.
  - **Aba Dashboards:** inclusão do card analítico com P50, P80, SPI, dias de atraso e probabilidade de cumprimento do prazo; distribuição de status de tarefas e riscos com contagens reais.
  - **Aba Tarefas:** visualização do percentual concluído em barra de progresso, indicação de nó crítico (gargalo) e folgas; modal de edição agora permite alterar a porcentagem concluída (0 a 100%).
  - **Aba Riscos:** listagem dos riscos reais cadastrados, severidade calculada e modal para cadastrar novo risco (com descrição, probabilidade % e impacto em dias).
  - **Abas IA Feedback e Lições:** exibição de alertas do motor analítico, fator de calibração histórica e lições aprendidas extraídas via RAG.
- **`AnaliseCompletaPage.jsx`**:
  - Exibição dinâmica das previsões de Monte Carlo (P50 e P80), variação de prazo em dias pelo Earned Schedule, detalhes de gargalos do CPM e recomendações da IA.

---

## 4. Tabela de Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/projetos` | Lista projetos do usuário autenticado |
| `POST` | `/api/projetos` | Cria um novo projeto vinculado ao usuário |
| `PUT` | `/api/projetos/{id}` | Atualiza nome/descrição/prazos do projeto |
| `DELETE` | `/api/projetos/{id}` | Exclui projeto e seus relacionamentos |
| `POST` | `/api/projetos/{id}/tarefas` | Adiciona tarefa com progresso inicial 0% |
| `PUT` | `/api/projetos/{pid}/tarefas/{tid}` | Atualiza descrição, duração, % concluído e datas reais |
| `DELETE` | `/api/projetos/{pid}/tarefas/{tid}` | Exclui tarefa e limpa precedências |
| `POST` | `/api/projetos/{id}/riscos` | Cadastra risco com probabilidade e impacto em dias |
| `DELETE` | `/api/projetos/{pid}/riscos/{rid}` | Exclui risco do projeto |
| `GET` | `/api/auditoria/metricas/{projetoId}` | Retorna métricas completas (CPM, EVM, Monte Carlo, Histórico) |
| `POST` | `/api/auditoria/analisar/{projetoId}` | Executa auditoria analítica e gera diagnóstico prescritivo |
| `POST` | `/api/auditoria/chat` | Chat com contexto analítico injetado e controle de saudação |

---

## 5. Arquivos Criados ou Modificados

| Camada | Arquivo | Modificação |
|---|---|---|
| Backend (Domain) | [Tarefa.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/domain/Tarefa.java) | Campos de progresso físico e datas reais |
| Backend (Domain) | [Risco.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/domain/Risco.java) | `@JsonIgnore` e semântica quantitativa |
| Backend (Domain) | [FeedbackIA.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/domain/FeedbackIA.java) | Snapshot analítico e `@JsonIgnore` |
| Backend (DTO) | [AnaliseProjetoDTO.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/dto/AnaliseProjetoDTO.java) | **Novo:** Estrutura completa de métricas analíticas |
| Backend (DTO) | [DiagnosticoDTO.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/dto/DiagnosticoDTO.java) | Campo `analise` integrado |
| Backend (Repository) | [RiscoRepository.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/repository/RiscoRepository.java) | **Novo:** Acesso a dados de riscos |
| Backend (Repository) | [FeedbackIARepository.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/repository/FeedbackIARepository.java) | **Novo:** Acesso a histórico de feedbacks |
| Backend (Repository) | [TarefaRepository.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/repository/TarefaRepository.java) | Método de busca por usuário para calibração |
| Backend (Service) | [GrafosService.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/service/GrafosService.java) | Algoritmo CPM completo com folgas e gargalos |
| Backend (Service) | [AnaliseProjetoService.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/service/AnaliseProjetoService.java) | **Novo:** Motor analítico (EVM, Monte Carlo, Calibração) |
| Backend (Service) | [RAGService.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/service/RAGService.java) | Rankeamento léxico inteligente de lições |
| Backend (Service) | [AuditoriaService.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/service/AuditoriaService.java) | Injeção analítica no Gemini e higienização |
| Backend (Service) | [GeminiService.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/service/GeminiService.java) | Temperatura 0.3 para rigor analítico |
| Backend (Controller) | [AuditoriaController.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/controller/AuditoriaController.java) | Endpoint `/metricas/{id}` |
| Backend (Controller) | [ProjetoController.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/main/java/com/projectmind/controller/ProjetoController.java) | Gestão de riscos e progresso de tarefas |
| Backend (Test) | [AnaliseProjetoServiceTest.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/test/java/com/projectmind/service/AnaliseProjetoServiceTest.java) | **Novo:** Testes unitários do motor analítico |
| Frontend | [projetoService.js](file:///c:/Users/0120857/Documents/TCC/Projectmind/frontend/src/services/projetoService.js) | Função `excluirRisco` |
| Frontend | [auditoriaService.js](file:///c:/Users/0120857/Documents/TCC/Projectmind/frontend/src/services/auditoriaService.js) | Função `obterMetricasProjeto` |
| Frontend | [ChatPage.jsx](file:///c:/Users/0120857/Documents/TCC/Projectmind/frontend/src/pages/ChatPage.jsx) | Correção de regex e prompt |
| Frontend | [ProjetoPage.jsx](file:///c:/Users/0120857/Documents/TCC/Projectmind/frontend/src/pages/ProjetoPage.jsx) | Dashboards reais, % de tarefas e riscos |
| Frontend | [AnaliseCompletaPage.jsx](file:///c:/Users/0120857/Documents/TCC/Projectmind/frontend/src/pages/AnaliseCompletaPage.jsx) | Painel preditivo de Monte Carlo e Earned Schedule |

---

## 6. Validação e Testes Automatizados

- **Testes Unitários:** [AnaliseProjetoServiceTest.java](file:///c:/Users/0120857/Documents/TCC/Projectmind/backend/src/test/java/com/projectmind/service/AnaliseProjetoServiceTest.java)
  - `testCpmClassicoEIdentificacaoDeGargalo`: valida duração total do caminho crítico e diferenciação entre tarefas com e sem folga.
  - `testDeteccaoDeCiclo`: valida interceptação de dependências circulares.
  - `testCalculoAnaliticoAtrasoEEarnedSchedule`: valida cálculo de dias decorridos versus avanço físico pelo Earned Schedule e identificação de `ATRASADO`.
  - `testDeterminismoMonteCarlo`: valida se a mesma foto do projeto gera simulações estocásticas reproduzíveis.
  - **Resultado:** `Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` (`BUILD SUCCESS`).
- **Build Frontend:** `vite build` executado gerando bundle de produção sem alertas de tipagem ou falhas.

---

## 7. Como Executar e Demonstrar no TCC

```powershell
# 1. Iniciar o Backend (na pasta backend)
$env:JAVA_HOME="C:\Users\0120857\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
.\mvnw.cmd spring-boot:run

# 2. Iniciar o Frontend (em outro terminal, na pasta frontend)
cmd /c npm run dev
```

1. Acesse `http://localhost:5173` e abra um projeto.
2. Na aba **Tarefas**, edite uma tarefa e altere o `% Concluído`.
3. Na aba **Riscos**, cadastre um risco (ex: 80% de chance e 5 dias de impacto).
4. Na aba **Dashboards**, veja o recálculo imediato do **P50**, **P80** e a situação do cronograma.
5. Abra o **Chat com IA** e pergunte: *"Qual é o diagnóstico de prazo do projeto e quais são as previsões de término?"* — a IA apresentará os números exatos calculados pelo motor de forma analítica e fundamentada.
