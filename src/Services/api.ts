import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  withCredentials: true,
});

type Csrf = { headerName: string; token: string };
export type UsuarioLogado = {
  id: number;
  nome: string;
  email: string;
  role: "USER" | "ADMIN";
};

let csrf: Csrf | null = null;
let carregamentoCsrf: Promise<Csrf> | null = null;

function limparCsrf() {
  csrf = null;
  carregamentoCsrf = null;
}

async function obterCsrf(): Promise<Csrf> {
  if (csrf) return csrf;
  if (!carregamentoCsrf) {
    carregamentoCsrf = api.get<Csrf>("/auth/csrf").then((resposta) => {
      csrf = resposta.data;
      return resposta.data;
    }).finally(() => { carregamentoCsrf = null; });
  }
  return carregamentoCsrf;
}

api.interceptors.request.use(async (config) => {
  const metodo = config.method?.toLowerCase() ?? "get";
  if (!["get", "head", "options"].includes(metodo)) {
    const token = await obterCsrf();
    config.headers.set(token.headerName, token.token);
  }
  return config;
});

api.interceptors.response.use((resposta) => resposta, (erro) => {
  if (axios.isAxiosError(erro) && erro.response?.status === 401) {
    limparCsrf();
    if (erro.config?.url !== "/login") {
      window.dispatchEvent(new Event("sessao-expirada"));
    }
  }
  return Promise.reject(erro);
});

export async function entrar(email: string, senha: string): Promise<UsuarioLogado> {
  const formulario = new URLSearchParams();
  formulario.set("email", email.trim());
  formulario.set("password", senha);
  await api.post("/login", formulario, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  limparCsrf();
  await obterCsrf();
  return consultarUsuario();
}

export async function consultarUsuario(): Promise<UsuarioLogado> {
  return (await api.get<UsuarioLogado>("/auth/me")).data;
}

export async function sair(): Promise<void> {
  await api.post("/logout");
  limparCsrf();
}
