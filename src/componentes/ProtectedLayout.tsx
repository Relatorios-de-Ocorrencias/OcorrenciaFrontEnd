import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { consultarUsuario, sair } from "../Services/api";
import type { UsuarioLogado } from "../Services/api";

type Sessao =
  | { tipo: "carregando" }
  | { tipo: "anonima" }
  | { tipo: "erro" }
  | { tipo: "autenticada"; usuario: UsuarioLogado };

export function ProtectedLayout() {
  const [sessao, setSessao] = useState<Sessao>({ tipo: "carregando" });
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let ativo = true;
    consultarUsuario().then((usuario) => {
      if (ativo) setSessao({ tipo: "autenticada", usuario });
    }).catch((error) => {
      if (ativo) setSessao({ tipo: axios.isAxiosError(error)
        && [401, 403].includes(error.response?.status ?? 0) ? "anonima" : "erro" });
    });
    function expirou() { if (ativo) setSessao({ tipo: "anonima" }); }
    window.addEventListener("sessao-expirada", expirou);
    return () => {
      ativo = false;
      window.removeEventListener("sessao-expirada", expirou);
    };
  }, [location.pathname]);

  async function encerrar() {
    setSaindo(true);
    setErroSaida("");
    try {
      await sair();
      navigate("/login", { replace: true });
    } catch {
      setErroSaida("Não foi possível encerrar a sessão. Tente novamente.");
    } finally { setSaindo(false); }
  }

  if (sessao.tipo === "carregando") return <p className="session-message" role="status">Verificando sessão…</p>;
  if (sessao.tipo === "anonima") return <Navigate to="/login" replace />;
  if (sessao.tipo === "erro") return <div className="session-message" role="alert">
    <p>Não foi possível verificar sua sessão.</p>
    <button onClick={() => window.location.reload()}>Tentar novamente</button>
  </div>;

  return <>
    <div className="session-controls">
      <span>{sessao.usuario.nome}</span>
      <button type="button" disabled={saindo} onClick={encerrar}>{saindo ? "Saindo…" : "Sair"}</button>
      {erroSaida && <span role="alert">{erroSaida}</span>}
    </div>
    <Outlet />
  </>;
}
