import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { LoginEmpresa } from './components/LoginEmpresa'
import { LoginUsuario } from './components/LoginUsuario' // <--- Importa el nuevo componente

const Home = () => {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>Edit <code>src/App.tsx</code> and save to test <code>HMR</code></p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <button className="counter" onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>

          <button 
            onClick={() => navigate('/loginEmpresa')}
            style={{ backgroundColor: '#646cff', color: 'white' }}
          >
            Iniciar Sesión
          </button>
        </div>
      </section>
    </>
  )
}

const Dashboard = () => (
  <section id="center">
    <h1>Conexión con el Back</h1>
    <p>Aquí es donde llamaremos a http://127.0.0.1:8000</p>
    <Link to="/" style={{ color: '#646cff' }}>Volver al inicio</Link>
  </section>
)

function App() {
  return (
    <>
      <nav style={{ padding: '20px', textAlign: 'center' }}>
        <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
        <Link to="/dashboard">Dashboard (Back)</Link>
      </nav>

      <hr />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loginEmpresa" element={<LoginEmpresa />} />

        {/* --- ESTA ES LA RUTA DINÁMICA --- */}
        {/* El :slug capturará "pizzeria-napoli" o cualquier otro nombre */}
        <Route path="/:slug/login" element={<LoginUsuario />} />
      </Routes>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App