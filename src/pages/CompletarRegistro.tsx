// src/pages/CompletarRegistro.tsx
// Ruta: /:slug/completar-registro/:token

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

interface DatosOnboarding {
  email:          string
  empresa_slug:   string
  empresa_nombre: string
  logo_url:       string
}

export const CompletarRegistro = () => {
  const { slug, token } = useParams<{ slug: string; token: string }>()
  const navigate        = useNavigate()

  const [datos,    setDatos]    = useState<DatosOnboarding | null>(null)
  const [estado,   setEstado]   = useState<'cargando'|'listo'|'invalido'|'expirado'|'enviando'|'ok'>('cargando')
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    name:                  '',
    last_name:             '',
    telefono:              '',
    direccion:             '',
    password:              '',
    password_confirmation: '',
  })

  useEffect(() => {
    fetch(`${BASE}/${slug}/completar-registro/${token}`)
      .then(async res => {
        const data = await res.json()
        if (res.ok) {
          setDatos(data)
          setEstado('listo')
        } else if (res.status === 410) {
          setEstado('expirado')
        } else {
          setEstado('invalido')
        }
      })
      .catch(() => setEstado('invalido'))
  }, [slug, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (form.password !== form.password_confirmation) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }

    setEstado('enviando')
    try {
      const res  = await fetch(`${BASE}/${slug}/completar-registro/${token}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Error al completar el registro.')

      setEstado('ok')
      setTimeout(() => navigate(`/${slug}/login`), 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado.')
      setEstado('listo')
    }
  }

  // ── Estados ────────────────────────────────────────────────────────────────

  if (estado === 'cargando') return (
    <div style={s.centrado}>
      <div style={s.spinner}/>
      <p style={{color:'#64748b',marginTop:'1rem'}}>Verificando link…</p>
    </div>
  )

  if (estado === 'invalido') return (
    <div style={s.centrado}>
      <span style={{fontSize:'3rem'}}>❌</span>
      <p style={s.titulo}>Link inválido</p>
      <p style={s.sub}>Este link no existe o ya fue utilizado.</p>
    </div>
  )

  if (estado === 'expirado') return (
    <div style={s.centrado}>
      <span style={{fontSize:'3rem'}}>⏰</span>
      <p style={s.titulo}>Link expirado</p>
      <p style={s.sub}>Solicita al administrador que genere un nuevo link.</p>
    </div>
  )

  if (estado === 'ok') return (
    <div style={s.centrado}>
      <span style={{fontSize:'3rem'}}>✅</span>
      <p style={s.titulo}>¡Cuenta activada!</p>
      <p style={s.sub}>Redirigiendo al login de <strong>{datos?.empresa_nombre}</strong>…</p>
    </div>
  )

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f8f9fc;font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cr-input{width:100%;padding:.7rem .875rem;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;color:#0f172a;font-size:.9rem;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s;}
        .cr-input:focus{border-color:#E3342F;background:#fff;box-shadow:0 0 0 3px rgba(227,52,47,.1);}
      `}</style>

      <div style={s.card}>
        {/* Logo de la empresa */}
        {datos?.logo_url && (
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <img src={datos.logo_url} alt={datos.empresa_nombre}
              style={{width:64,height:64,objectFit:'contain',borderRadius:14,boxShadow:'0 4px 12px rgba(0,0,0,.1)'}}/>
            <p style={{fontWeight:700,fontSize:'1rem',color:'#0f172a',marginTop:'.5rem'}}>{datos.empresa_nombre}</p>
          </div>
        )}

        <div style={{marginBottom:'1.5rem'}}>
          <h1 style={s.titulo}>Completa tu perfil</h1>
          <p style={{...s.sub, marginTop:'.3rem'}}>
            Bienvenido. Configura tu cuenta para empezar.
          </p>
          <p style={{fontSize:'.8rem',color:'#94a3b8',marginTop:'.25rem'}}>{datos?.email}</p>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'.875rem'}}>
          <div style={s.row}>
            <div style={{flex:1}}>
              <label style={s.label}>Nombre *</label>
              <input className="cr-input" required value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Tu nombre"/>
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>Apellido</label>
              <input className="cr-input" value={form.last_name}
                onChange={e => setForm({...form, last_name: e.target.value})}
                placeholder="Tu apellido"/>
            </div>
          </div>

          <div style={s.row}>
            <div style={{flex:1}}>
              <label style={s.label}>Teléfono</label>
              <input className="cr-input" value={form.telefono}
                onChange={e => setForm({...form, telefono: e.target.value})}
                placeholder="3001234567"/>
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>Dirección</label>
              <input className="cr-input" value={form.direccion}
                onChange={e => setForm({...form, direccion: e.target.value})}
                placeholder="Tu dirección"/>
            </div>
          </div>

          <div>
            <label style={s.label}>Nueva contraseña *</label>
            <input className="cr-input" type="password" required value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Mínimo 8 caracteres"/>
          </div>

          <div>
            <label style={s.label}>Confirmar contraseña *</label>
            <input className="cr-input" type="password" required value={form.password_confirmation}
              onChange={e => setForm({...form, password_confirmation: e.target.value})}
              placeholder="Repite tu contraseña"/>
          </div>

          {errorMsg && (
            <p style={{color:'#ef4444',fontSize:'.83rem',padding:'.6rem .75rem',background:'#fef2f2',borderRadius:'8px',border:'1px solid #fecaca'}}>
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={estado === 'enviando'}
            style={{
              padding:'.875rem', background:'#E3342F', color:'#fff',
              border:'none', borderRadius:'10px', fontFamily:'inherit',
              fontWeight:700, fontSize:'1rem', cursor:'pointer',
              marginTop:'.25rem', opacity: estado === 'enviando' ? .6 : 1,
              transition:'opacity .15s',
            }}>
            {estado === 'enviando' ? 'Guardando…' : 'Activar mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  root:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', background:'#f8f9fc' } as React.CSSProperties,
  card:    { width:'100%', maxWidth:'500px', background:'#fff', borderRadius:'16px', padding:'2rem 2.25rem', boxShadow:'0 4px 24px rgba(0,0,0,.08)' } as React.CSSProperties,
  centrado:{ minHeight:'100vh', display:'flex', flexDirection:'column' as const, alignItems:'center', justifyContent:'center', gap:'1rem', fontFamily:'sans-serif' },
  titulo:  { fontSize:'1.3rem', fontWeight:700, color:'#0f172a' } as React.CSSProperties,
  sub:     { fontSize:'.88rem', color:'#64748b' } as React.CSSProperties,
  label:   { display:'block', fontSize:'.73rem', fontWeight:600, color:'#64748b', marginBottom:'.3rem', textTransform:'uppercase' as const, letterSpacing:'.04em' },
  row:     { display:'flex', gap:'1rem' } as React.CSSProperties,
  spinner: { width:'32px', height:'32px', border:'3px solid #f1f5f9', borderTopColor:'#E3342F', borderRadius:'50%', animation:'spin .7s linear infinite' } as React.CSSProperties,
}

export default CompletarRegistro