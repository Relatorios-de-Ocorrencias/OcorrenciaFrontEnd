import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, LoaderCircle, ArrowLeft } from "lucide-react";
import { entrar } from "../../Services/api";
import "./login.css";

type Painel = "login" | "cadastro" | "recuperacao";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [painel, setPainel] = useState<Painel>("login");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function mudarPainel(proximo: Painel) {
    setPainel(proximo);
    setErro("");
    setSenha("");
    setVisivel(false);
    setCapsLock(false);
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro("");
    try {
      await entrar(email, senha);
      setSenha("");
      navigate("/", { replace: true });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      setErro(status === 401
        ? "Não foi possível entrar. Verifique seu e-mail e senha ou tente novamente mais tarde."
        : status === 403
          ? "Não foi possível validar o acesso. Atualize a página e tente novamente."
          : status === 429
            ? "Muitas tentativas de acesso. Aguarde um pouco antes de tentar novamente."
            : "Não foi possível conectar ao serviço. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-content" aria-labelledby="auth-title">
        <div className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-lock"><LockKeyhole size={24} strokeWidth={1.7} aria-hidden="true" /></span>
            <h1 id="auth-title">Relatórios de Ocorrências</h1>
          </div>
          {painel === "login" ? <>
            <form onSubmit={enviar} className="auth-form" aria-busy={enviando}>
              <div className="auth-field">
                <label htmlFor="login-email">E-mail</label>
                <div className="auth-input-wrap"><Mail size={18} aria-hidden="true" />
                  <input id="login-email" name="email" type="email" autoComplete="username" placeholder="voce@exemplo.com" required maxLength={255} disabled={enviando} value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
              </div>
              <div className="auth-field">
                <div className="auth-label-row"><label htmlFor="login-senha">Senha</label><button type="button" className="auth-text-button" disabled={enviando} onClick={() => mudarPainel("recuperacao")}>Esqueci minha senha</button></div>
                <div className="auth-input-wrap"><LockKeyhole size={18} aria-hidden="true" />
                  <input id="login-senha" name="password" type={visivel ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" required disabled={enviando} value={senha} onChange={(event) => setSenha(event.target.value)} onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))} onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))} onBlur={() => setCapsLock(false)} aria-describedby={capsLock ? "capslock-aviso" : undefined} />
                  <button type="button" className="auth-eye" aria-label={visivel ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visivel} aria-controls="login-senha" disabled={enviando} onClick={() => setVisivel(!visivel)}>{visivel ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {capsLock && <span id="capslock-aviso" className="auth-hint" role="status">Caps Lock está ativado.</span>}
              </div>
              {erro && <p className="auth-error" role="alert">{erro}</p>}
              <button type="submit" className="auth-submit" disabled={enviando}>{enviando ? <><LoaderCircle size={18} className="auth-spinner" aria-hidden="true" />Entrando…</> : <>Entrar<ArrowRight size={18} aria-hidden="true" /></>}</button>
            </form>
            <div className="auth-register"><button type="button" disabled={enviando} onClick={() => mudarPainel("cadastro")}>Cadastrar-se <ArrowRight size={15} aria-hidden="true" /></button></div>
          </> : <div className="auth-help" aria-live="polite">
            <div className="auth-help-note"><ShieldCheck size={22} aria-hidden="true" /><p>{painel === "cadastro" ? "Para criar sua conta, entre em contato com o administrador da sua organização e informe seu nome e e-mail. O portal ainda não oferece cadastro público." : "Entre em contato com o administrador da sua organização para solicitar a redefinição da senha. A recuperação automática por e-mail ainda não está disponível."}</p></div>
            <button type="button" className="auth-submit" onClick={() => mudarPainel("login")}><ArrowLeft size={18} aria-hidden="true" />Voltar para o login</button>
          </div>}
        </div>
      </section>
    </main>
  );
}
