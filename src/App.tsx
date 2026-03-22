// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { Home }               from './pages/Home'
import { LoginEmpresa }       from './pages/LoginEmpresa'
import { LoginUsuario }       from './pages/LoginUsuario'
import { Dashboard }          from './dashboard/Dashboard'
import { CompletarRegistro }  from './pages/CompletarRegistro'
import { PrivateRoute }       from './router/Privateroute'

function App() {
  return (
    <Routes>
      <Route path="/"                                    element={<Home />} />
      <Route path="/loginEmpresa"                        element={<LoginEmpresa />} />
      <Route path="/:slug/login"                         element={<LoginUsuario />} />
      <Route path="/:slug/completar-registro/:token"     element={<CompletarRegistro />} />
      <Route path="/:slug/dashboard"                     element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  )
}

export default App