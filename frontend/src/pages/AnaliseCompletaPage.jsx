import { useParams, useNavigate } from "react-router-dom";

function AnaliseCompletaPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8">
      <button
        onClick={() => navigate(`/projetos/${id}`)}
        className="text-sm underline mb-6"
      >
        ← Voltar para o projeto
      </button>

      <h1 className="text-3xl font-bold">Análise Completa</h1>

      <p className="text-gray-500 mt-2">
        Diagnóstico inteligente do projeto.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <div className="border rounded-xl p-6">
          <p className="text-gray-500">Status</p>
          <p className="text-xl font-semibold mt-2">Em andamento</p>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-gray-500">Progresso</p>
          <p className="text-xl font-semibold mt-2">72%</p>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-gray-500">Riscos ativos</p>
          <p className="text-xl font-semibold mt-2">4</p>
        </div>
      </div>

      <section className="mt-8 border rounded-xl p-6">
        <h2 className="text-xl font-semibold">Arquitetura técnica</h2>

        <div className="mt-4 space-y-2">
          <p>Frontend: React + Tailwind CSS</p>
          <p>Backend: Spring Boot + Java</p>
          <p>Banco de dados: PostgreSQL</p>
          <p>Inteligência Artificial: Gemini + LangChain4j</p>
        </div>
      </section>

      <section className="mt-6 border rounded-xl p-6">
        <h2 className="text-xl font-semibold">
          Requisitos do projeto
        </h2>

        <ul className="mt-4 space-y-2">
          <li>✓ Requisitos funcionais</li>
          <li>✓ Requisitos não funcionais</li>
          <li>✓ Cronograma</li>
          <li>✓ Gestão de riscos</li>
          <li>✓ Análise por Inteligência Artificial</li>
        </ul>
      </section>
    </div>
  );
}

export default AnaliseCompletaPage;