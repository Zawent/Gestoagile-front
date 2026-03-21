import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useBranding } from './useBranding'

export const LoginUsuario = () => {
  const { slug }    = useParams<{ slug: string }>()
  const navigate    = useNavigate()
  const { branding, loading: brandingLoading } = useBranding(slug)

  const [formData,     setFormData]     = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe,   setRememberMe]   = useState(false)
  const [loginState,   setLoginState]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg,     setErrorMsg]     = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginState('loading')
    setErrorMsg('')

    try {
      const empresaId = localStorage.getItem('empresa_id')
      if (!empresaId) throw new Error('No se encontró el contexto de empresa. Vuelve a identificar tu empresa.')

      const res = await fetch(`http://127.0.0.1:8000/api/${slug}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, empresa_id: empresaId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Error al iniciar sesión')

      // ── Persistir sesión ──────────────────────────────────────────────────
      localStorage.setItem('access_token',  data.access_token)
      localStorage.setItem('user_id',       String(data.user.id))
      localStorage.setItem('user_name',     data.user.name)
      localStorage.setItem('user_email',    data.user.email)
      localStorage.setItem('user_rol_id',   String(data.user.rol_id))
      localStorage.setItem('user_rol_nombre', data.user.rol_nombre) // <-- NUEVO
      // empresa_id y empresa_slug ya vienen del paso 1 (identificarEmpresa)

      setLoginState('success')
      setTimeout(() => navigate(`/${slug}/dashboard`), 2500)

    } catch (err: unknown) {
      setLoginState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado. Intenta de nuevo.')
      setTimeout(() => setLoginState('idle'), 3500)
    }
  }

  const isLoading = loginState === 'loading'
  const isSuccess = loginState === 'success'
  const isError   = loginState === 'error'

  const { primary, quaternary } = branding.colors

  const cssVars = {
    '--primary':   primary,
    '--accent-bg': primary,
    '--sidebar':   quaternary,
  } as React.CSSProperties

  const displayName = branding.nombre !== 'Mi Empresa'
    ? branding.nombre
    : slug?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ?? 'Portal'

  if (brandingLoading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f8fc' }}>
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}.sk{border-radius:12px;background:#e2e8f0;animation:pulse 1.4s ease-in-out infinite;}`}</style>
        <div style={{ width:420, padding:'2.5rem 2rem', background:'#fff', borderRadius:24, boxShadow:'0 8px 32px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'1.25rem', alignItems:'center' }}>
          <div className="sk" style={{ width:80, height:80, borderRadius:20 }} />
          <div className="sk" style={{ width:160, height:22 }} />
          <div className="sk" style={{ width:'100%', height:16, marginTop:8 }} />
          <div className="sk" style={{ width:'100%', height:50, borderRadius:14 }} />
          <div className="sk" style={{ width:'100%', height:50, borderRadius:14 }} />
          <div className="sk" style={{ width:'100%', height:52, borderRadius:14, marginTop:4 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={cssVars} className="login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .login-root{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;color:#1a1a2e;position:relative;overflow:hidden;background:color-mix(in srgb,var(--accent-bg) 8%,#f8f8fc);}
        .login-root__blob{position:fixed;border-radius:50%;filter:blur(100px);opacity:.28;pointer-events:none;z-index:0;}
        .login-root__blob--1{width:500px;height:500px;background:var(--primary);top:-140px;left:-140px;}
        .login-root__blob--2{width:600px;height:600px;background:color-mix(in srgb,var(--primary) 55%,#fff);bottom:-160px;right:-160px;}
        .login-root__blob--3{width:300px;height:300px;background:color-mix(in srgb,var(--primary) 40%,#c0d0ff);top:50%;left:60%;transform:translate(-50%,-50%);}
        .login-right{position:relative;z-index:1;width:100%;display:flex;align-items:center;justify-content:center;padding:2rem 1.5rem;}
        .login-box{width:100%;max-width:420px;background:rgba(255,255,255,0.72);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.6);border-radius:24px;padding:2.5rem 2rem;box-shadow:0 8px 32px rgba(0,0,0,.08),0 1px 0 rgba(255,255,255,.9) inset;position:relative;animation:loginBoxIn .35s ease;}
        @keyframes loginBoxIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .success-overlay{position:absolute;inset:0;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);z-index:10;animation:fadeInOverlay .4s ease forwards;}
        @keyframes fadeInOverlay{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        .success-icon-wrap{width:72px;height:72px;border-radius:50%;background:color-mix(in srgb,var(--primary) 12%,transparent);display:flex;align-items:center;justify-content:center;animation:popIn .5s cubic-bezier(.34,1.56,.64,1) forwards;}
        @keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}
        .success-icon-wrap .material-symbols-outlined{font-size:38px;color:var(--primary);}
        .success-title{font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:800;color:#1a1a2e;letter-spacing:-.02em;}
        .success-sub{font-size:.88rem;color:#7a7a9a;}
        .success-bar-wrap{width:160px;height:4px;background:#ebebf5;border-radius:99px;overflow:hidden;}
        .success-bar{height:100%;background:var(--primary);border-radius:99px;animation:fillBar 2.3s ease forwards;}
        @keyframes fillBar{from{width:0%}to{width:100%}}
        .login-logo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;}
        .login-logo{width:80px;height:80px;object-fit:contain;border-radius:20px;box-shadow:0 8px 30px color-mix(in srgb,var(--primary) 20%,transparent);margin-bottom:.85rem;}
        .login-company{font-family:'Sora',sans-serif;font-size:1.35rem;font-weight:700;color:#1a1a2e;letter-spacing:-.02em;}
        .login-heading{font-family:'Sora',sans-serif;font-size:1.75rem;font-weight:800;color:#1a1a2e;margin-bottom:.35rem;}
        .login-subheading{font-size:.9rem;color:#7a7a9a;margin-bottom:2rem;}
        .login-form{display:flex;flex-direction:column;gap:1.25rem;}
        .field-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;}
        .field-label span{font-size:.85rem;font-weight:600;color:#3a3a5c;}
        .field-label a{font-size:.82rem;font-weight:600;color:var(--primary);text-decoration:none;transition:opacity .2s;}
        .field-label a:hover{opacity:.75;}
        .field-input-wrap{position:relative;}
        .field-input{width:100%;padding:.9rem 1rem;border:1.5px solid #e2e2ee;border-radius:14px;background:#fafafd;font-family:'DM Sans',sans-serif;font-size:.95rem;color:#1a1a2e;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;}
        .field-input::placeholder{color:#b0b0c8;}
        .field-input:focus{border-color:var(--primary);background:#fff;box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 12%,transparent);}
        .field-input--error{border-color:#f87171!important;box-shadow:0 0 0 4px rgba(248,113,113,.12)!important;}
        .field-input--padded-right{padding-right:3rem;}
        .visibility-btn{position:absolute;right:.9rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#a0a0be;display:flex;align-items:center;transition:color .2s;padding:0;}
        .visibility-btn:hover{color:#5a5a78;}
        .visibility-btn .material-symbols-outlined{font-size:20px;}
        .remember-row{display:flex;align-items:center;gap:.5rem;}
        .remember-checkbox{width:16px;height:16px;accent-color:var(--primary);cursor:pointer;flex-shrink:0;}
        .remember-label{font-size:.85rem;color:#5a5a78;cursor:pointer;user-select:none;}
        .error-msg{display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:12px;font-size:.85rem;color:#dc2626;animation:shakeX .4s ease;}
        .error-msg .material-symbols-outlined{font-size:18px;flex-shrink:0;}
        @keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .btn-submit{width:100%;padding:1rem;background:var(--primary);color:#fff;font-family:'Sora',sans-serif;font-size:1rem;font-weight:700;border:none;border-radius:14px;cursor:pointer;box-shadow:0 8px 24px color-mix(in srgb,var(--primary) 30%,transparent);transition:opacity .2s,transform .1s;letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:52px;}
        .btn-submit:hover:not(:disabled){opacity:.9;}
        .btn-submit:active:not(:disabled){transform:scale(.98);}
        .btn-submit:disabled{opacity:.65;cursor:not-allowed;}
        .spinner{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .btn-back{width:100%;padding:.9rem;background:transparent;color:#7a7a9a;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;border:1.5px solid #e2e2ee;border-radius:14px;cursor:pointer;transition:background .2s,color .2s,border-color .2s;display:flex;align-items:center;justify-content:center;gap:.4rem;}
        .btn-back:hover{background:#f2f2fa;color:#3a3a5c;border-color:#c8c8e0;}
        .btn-back .material-symbols-outlined{font-size:18px;}
        .login-footer{margin-top:1.75rem;text-align:center;font-size:.85rem;color:#9090b0;}
        .login-footer a{color:var(--primary);font-weight:600;text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--primary) 35%,transparent);}
        .login-footer a:hover{opacity:.8;}
      `}</style>

      <div className="login-root__blob login-root__blob--1" />
      <div className="login-root__blob login-root__blob--2" />
      <div className="login-root__blob login-root__blob--3" />

      <div className="login-right">
        <div className="login-box">
          {isSuccess && (
            <div className="success-overlay">
              <div className="success-icon-wrap">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div style={{ textAlign:'center' }}>
                <p className="success-title">¡Bienvenido de nuevo!</p>
                <p className="success-sub">Cargando tu espacio de trabajo…</p>
              </div>
              <div className="success-bar-wrap"><div className="success-bar" /></div>
            </div>
          )}

          <div className="login-logo-wrap">
            <img src={branding.logo} alt={displayName} className="login-logo" />
            <span className="login-company">{displayName}</span>
          </div>

          <h2 className="login-heading">Bienvenido de nuevo</h2>
          <p className="login-subheading">Ingresa tus credenciales para acceder.</p>

          <form onSubmit={handleLogin} className="login-form">
            <div>
              <div className="field-label"><span>Correo electrónico</span></div>
              <div className="field-input-wrap">
                <input type="email" className={`field-input ${isError ? 'field-input--error' : ''}`}
                  placeholder="usuario@empresa.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading || isSuccess} required />
              </div>
            </div>

            <div>
              <div className="field-label">
                <span>Contraseña</span>
                <a href="#">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="field-input-wrap">
                <input type={showPassword ? 'text' : 'password'}
                  className={`field-input field-input--padded-right ${isError ? 'field-input--error' : ''}`}
                  placeholder="••••••••" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading || isSuccess} required />
                <button type="button" className="visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {isError && (
              <div className="error-msg">
                <span className="material-symbols-outlined">error</span>
                {errorMsg}
              </div>
            )}

            <div className="remember-row">
              <input type="checkbox" id="remember" className="remember-checkbox"
                checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isSuccess} />
              <label htmlFor="remember" className="remember-label">Recordarme por 30 días</label>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading || isSuccess}>
              {isLoading ? <><div className="spinner" /> Verificando credenciales…</> : 'Iniciar sesión'}
            </button>

            <button type="button" className="btn-back"
              onClick={() => navigate('/loginEmpresa')}
              disabled={isLoading || isSuccess}>
              <span className="material-symbols-outlined">arrow_back</span>
              Cambiar empresa
            </button>
          </form>

          <p className="login-footer">¿No tienes cuenta?{' '}<a href="#">Crear una cuenta</a></p>
        </div>
      </div>
    </div>
  )
}

export default LoginUsuario