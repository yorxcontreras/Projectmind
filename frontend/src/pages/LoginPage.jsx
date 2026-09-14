import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (event) => {
    event.preventDefault();

    login({
      id: 1,
      nome: "Usuário",
      email: "usuario@projectmind.com",
    });

    navigate("/projetos");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2">ProjectMind</h1>
        <p className="mb-6">Entre na sua conta</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg p-3 bg-black text-white"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={() => navigate("/cadastro")}
          className="mt-4 text-sm underline"
        >
          Criar uma conta
        </button>
      </div>
    </div>
  );
}

export default LoginPage;