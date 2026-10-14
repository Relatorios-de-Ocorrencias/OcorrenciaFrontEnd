import './App.css'
import { Home } from './pages/Home';
import { DadosGerais } from './pages/DadosGerais';
import { Observacoes } from './pages/Observacoes';
import { ObservacoesForm } from './pages/ObservacoesForm';
import { PreVisualizacao } from './pages/PreVisualizacao';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Login } from './pages/Login';
import { ProtectedLayout } from './componentes/ProtectedLayout';

function App() {

    return(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />}/>
            <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />}/>
            <Route path="/DadosGerais" element={<DadosGerais />}/>
            <Route path="/ocorrencias/:ocorrenciaId/observacoes" element={<Observacoes/>}/>
            <Route path="/ocorrencias/:ocorrenciaId/observacoes/nova" element={<ObservacoesForm/>}/>
            <Route path="/ocorrencias/:ocorrenciaId/observacoes/:observacaoId/editar" element={<ObservacoesForm/>}/>
            <Route path="/ocorrencias/:ocorrenciaId/pre-visualizacao" element={<PreVisualizacao />}/>
            </Route>
          </Routes>
        </BrowserRouter> 
    )
}

export default App
