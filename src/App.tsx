import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Home } from './components/Home'
import { LoginEmpresa } from './components/LoginEmpresa'
import { LoginUsuario } from './components/LoginUsuario'
import './App.css'

const Dashboard = () => {
  const navigate = useNavigate()
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#0A1439', color: 'white' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Panel de Control</h1>
      <p style={{ color: '#94a3b8' }}>Conectado a: http://127.0.0.1:8000</p>
      <button
        onClick={() => navigate('/')}
        style={{ color: '#acc55f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }}
      >
        Cerrar Sesión
      </button>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/loginEmpresa" element={<LoginEmpresa />} />
      <Route path="/:slug/login" element={<LoginUsuario />} />
    </Routes>
  )
}

export default App