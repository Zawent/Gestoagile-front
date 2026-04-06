// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { Home }              from './pages/Home'
import { LoginEmpresa }      from './pages/LoginEmpresa'
import { LoginUsuario }      from './pages/LoginUsuario'
import { Dashboard }         from './dashboard/Dashboard'
import { CompletarRegistro } from './pages/CompletarRegistro'
import { PrivateRoute }      from './router/Privateroute'
import POS from './pages/POS'

function App() {
  return (
    <Routes>
      <Route path="/"                                element={<Home />} />
      <Route path="/loginEmpresa"                    element={<LoginEmpresa />} />
      <Route path="/:slug/login"                     element={<LoginUsuario />} />
      <Route path="/:slug/completar-registro/:token" element={<CompletarRegistro />} />
      <Route path="/:slug/pos"                       element={<PrivateRoute><POS /></PrivateRoute>} />

      {/*
        Dashboard con enrutamiento anidado.
        /:slug/dashboard             → Panel Principal
        /:slug/dashboard/empresa/usuarios
        /:slug/dashboard/inventario
        etc.
        El "*" captura cualquier subsección y Dashboard la lee de la URL.
      */}
      <Route path="/:slug/dashboard/*" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  )
}

export default App