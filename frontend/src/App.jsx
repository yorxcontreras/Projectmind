import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CadastroPage from "./pages/CadastroPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import MeusProjetosPage from "./pages/MeusProjetosPage.jsx";
import ProjetoPage from "./pages/ProjetoPage.jsx";
import AnaliseCompletaPage from "./pages/AnaliseCompletaPage.jsx";
import PerfilPage from "./pages/PerfilPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/projetos" element={<MeusProjetosPage />} />
        <Route path="/projetos/:id" element={<ProjetoPage />} />
        <Route path="/projetos/:id/analise" element={<AnaliseCompletaPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
