import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Home } from './components/Home'
import { LoginEmpresa } from './components/LoginEmpresa'
import { LoginUsuario } from './components/LoginUsuario'
import { Dashboard } from './components/Dashboard'
import './App.css'
import { PrivateRoute } from './Privateroute'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/loginEmpresa" element={<LoginEmpresa />} />
      <Route path="/:slug/login" element={<LoginUsuario />} />
      <Route path="/:slug/login"     element={<LoginUsuario />} />
      <Route path="/:slug/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }/>

    </Routes>
  )
}

export default App