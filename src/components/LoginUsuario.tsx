import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export const LoginUsuario = () => {
  const { slug } = useParams<{ slug: string }>(); // Capturamos el slug de la URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Iniciando sesión en ${slug} con:`, formData);
    // Aquí iría tu fetch al endpoint de login de usuario real
  };

  return (
    <section id="center">
      <div style={{ border: '1px solid #646cff', padding: '2rem', borderRadius: '15px' }}>
        <h2 style={{ textTransform: 'capitalize' }}>
          {slug?.replace('-', ' ')}
        </h2>
        <p style={{ color: '#888' }}>Ingresa tus credenciales de empleado</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ padding: '10px' }}
          />
          <input 
            type="password" 
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ padding: '10px' }}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => navigate('/loginEmpresa')}>Cambiar Empresa</button>
            <button type="submit" style={{ backgroundColor: '#646cff' }}>Entrar</button>
          </div>
        </form>
      </div>
    </section>
  )
}