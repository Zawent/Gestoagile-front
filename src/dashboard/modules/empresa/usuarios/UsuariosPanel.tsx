// src/dashboard/modules/empresa/usuarios/UsuariosPanel.tsx
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../../../api/client'
import { usePermisos } from '../../../../hooks/usePermisos'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Rol  { id: number; nombre: string }

interface Usuario {
  id:                    number
  name:                  string
  last_name:             string | null
  email:                 string
  telefono:              string | null
  esta_activo:           boolean
  onboarding_completado: boolean
  rol:                   Rol | null
}

interface PermisoCatalogo {
  id:     number
  clave:  string
  nombre: string
  modulo: string
}

interface PermisosUsuario {
  rol:              Rol | null
  permisos_del_rol: string[]
  excepciones:      { clave: string; concedido: boolean }[]
}

// ─── Modal Crear Usuario ──────────────────────────────────────────────────────

interface CrearModalProps {
  roles:   Rol[]
  onClose: () => void
  onSaved: (url: string) => void
}

function CrearModal({ roles, onClose, onSaved }: CrearModalProps) {
  const [email,   setEmail]   = useState('')
  const [rolId,   setRolId]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) { setError('El email es obligatorio.'); return }
    if (!rolId)        { setError('Selecciona un rol.'); return }
    setLoading(true)
    try {
      const res = await apiFetch<{ onboarding_url: string }>('users', {
        method: 'POST',
        body:   JSON.stringify({ email, rol_id: Number(rolId) }),
      })
      onSaved(res.onboarding_url)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="up-overlay" onClick={onClose}>
      <div className="up-modal" onClick={e => e.stopPropagation()}>
        <h3 className="up-modal__title">Nuevo usuario</h3>
        <p style={{fontSize:'.83rem',color:'#64748b',marginBottom:'1rem'}}>
          Se generará un link para que el usuario complete su perfil.
        </p>

        <label className="up-label">Email</label>
        <input className="up-input" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="usuario@empresa.com" />

        <label className="up-label">Rol inicial</label>
        <select className="up-input" value={rolId} onChange={e => setRolId(e.target.value)}>
          <option value="">— Selecciona un rol —</option>
          {roles.map(r => <option key={r.id} value={String(r.id)}>{r.nombre}</option>)}
        </select>

        {error && <p className="up-error">{error}</p>}

        <div className="up-modal__footer">
          <button className="up-btn up-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="up-btn up-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando…' : 'Crear y obtener link'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Editar Permisos ────────────────────────────────────────────────────

interface EditarPermisosModalProps {
  usuario:  Usuario
  roles:    Rol[]
  onClose:  () => void
  onSaved:  () => void
}

function EditarPermisosModal({ usuario, roles, onClose, onSaved }: EditarPermisosModalProps) {
  const [rolId,             setRolId]             = useState(String(usuario.rol?.id ?? ''))
  const [permisosData,      setPermisosData]      = useState<PermisosUsuario | null>(null)
  const [catalogo,          setCatalogo]          = useState<PermisoCatalogo[]>([])
  const [permisosExtra,     setPermisosExtra]     = useState<string[]>([])
  const [permisosDenegados, setPermisosDenegados] = useState<string[]>([])
  const [loading,             setLoading]             = useState(true)
  const [loadingRolPermisos,  setLoadingRolPermisos]  = useState(false)
  const [saving,              setSaving]              = useState(false)
  const [error,               setError]               = useState('')

  // Carga inicial: permisos del usuario + catálogo completo
  useEffect(() => {
    Promise.all([
      apiFetch<PermisosUsuario>(`users/${usuario.id}/permisos`),
      apiFetch<{ permisos: PermisoCatalogo[] }>('permisos'),
    ]).then(([pData, cData]) => {
      setPermisosData(pData)
      setCatalogo(cData.permisos)
      setPermisosExtra(pData.excepciones.filter(e => e.concedido).map(e => e.clave))
      setPermisosDenegados(pData.excepciones.filter(e => !e.concedido).map(e => e.clave))
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [usuario.id])

  // Cuando el admin cambia el rol en el select, recarga permisos_del_rol
  // para que el editor muestre correctamente qué permisos trae el nuevo rol
  useEffect(() => {
    if (!rolId || rolId === String(usuario.rol?.id ?? '')) return
    setLoadingRolPermisos(true)
    apiFetch<{ permisos: string[] }>(`roles/${rolId}/permisos`)
      .then(data => {
        setPermisosData(prev => prev ? { ...prev, permisos_del_rol: data.permisos } : prev)
      })
      .catch(console.error)
      .finally(() => setLoadingRolPermisos(false))
  }, [rolId, usuario.rol?.id])

  const toggleExtra = (clave: string) => {
    setPermisosExtra(prev => prev.includes(clave) ? prev.filter(c => c !== clave) : [...prev, clave])
    setPermisosDenegados(prev => prev.filter(c => c !== clave))
  }

  const toggleDenegado = (clave: string) => {
    setPermisosDenegados(prev => prev.includes(clave) ? prev.filter(c => c !== clave) : [...prev, clave])
    setPermisosExtra(prev => prev.filter(c => c !== clave))
  }

  const handleGuardar = async () => {
    setError('')
    setSaving(true)
    try {
      // Cambiar rol si cambió
      if (rolId && rolId !== String(usuario.rol?.id ?? '')) {
        await apiFetch(`users/${usuario.id}/rol`, {
          method: 'PUT',
          body:   JSON.stringify({ rol_id: Number(rolId) }),
        })
      }
      // Guardar excepciones de permisos
      await apiFetch(`users/${usuario.id}/permisos`, {
        method: 'PUT',
        body:   JSON.stringify({ permisos_extra: permisosExtra, permisos_denegados: permisosDenegados }),
      })
      onSaved()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // Agrupar catálogo por módulo
  const porModulo = catalogo.reduce((acc, p) => {
    if (!acc[p.modulo]) acc[p.modulo] = []
    acc[p.modulo].push(p)
    return acc
  }, {} as Record<string, PermisoCatalogo[]>)

  const esDelRol   = (clave: string) => permisosData?.permisos_del_rol.includes(clave) ?? false
  const esExtra    = (clave: string) => permisosExtra.includes(clave)
  const esDenegado = (clave: string) => permisosDenegados.includes(clave)

  const getEstadoClase = (clave: string) => {
    if (esExtra(clave))    return 'up-permiso--extra'
    if (esDenegado(clave)) return 'up-permiso--denegado'
    if (esDelRol(clave))   return 'up-permiso--rol'
    return ''
  }

  return (
    <div className="up-overlay" onClick={onClose}>
      <div className="up-modal up-modal--wide" onClick={e => e.stopPropagation()}>
        <h3 className="up-modal__title">Editar — {usuario.name} {usuario.last_name}</h3>
        <p style={{fontSize:'.8rem',color:'#94a3b8',marginBottom:'1rem'}}>{usuario.email}</p>

        {/* ── Rol ── */}
        <label className="up-label">Rol</label>
        <div style={{position:'relative'}}>
          <select className="up-input" value={rolId} onChange={e => setRolId(e.target.value)}
            style={{marginBottom:'1.25rem', paddingRight: loadingRolPermisos ? '2.5rem' : undefined}}>
            <option value="">— Sin cambios —</option>
            {roles.map(r => <option key={r.id} value={String(r.id)}>{r.nombre}</option>)}
          </select>
          {loadingRolPermisos && (
            <div className="up-spinner" style={{position:'absolute',right:'.75rem',top:'.65rem',width:16,height:16,borderWidth:2}}/>
          )}
        </div>

        {/* ── Editor de permisos ── */}
        <div className="up-permisos-header">
          <p className="up-permisos-title">Permisos individuales</p>
          <div className="up-leyenda">
            <span className="up-leyenda-item up-leyenda--rol">Del rol</span>
            <span className="up-leyenda-item up-leyenda--extra">Concedido extra</span>
            <span className="up-leyenda-item up-leyenda--denegado">Denegado</span>
            <span className="up-leyenda-item">Sin asignar</span>
          </div>
        </div>

        {loading ? (
          <div className="up-state" style={{padding:'2rem'}}>
            <div className="up-spinner"/>Cargando permisos…
          </div>
        ) : (
          <div className="up-permisos-body">
            {Object.entries(porModulo).map(([modulo, perms]) => (
              <div key={modulo} className="up-modulo">
                <p className="up-modulo-label">{modulo}</p>
                {perms.map(p => (
                  <div key={p.clave} className={`up-permiso-row ${getEstadoClase(p.clave)}`}>
                    <span className="up-permiso-nombre">{p.nombre}</span>
                    <div className="up-permiso-btns">
                      <button type="button"
                        className={`up-toggle ${esExtra(p.clave) ? 'up-toggle--on-green' : ''}`}
                        title="Conceder extra" onClick={() => toggleExtra(p.clave)}>
                        <span className="material-symbols-outlined">add_circle</span>
                      </button>
                      <button type="button"
                        className={`up-toggle ${esDenegado(p.clave) ? 'up-toggle--on-red' : ''}`}
                        title="Denegar" onClick={() => toggleDenegado(p.clave)}>
                        <span className="material-symbols-outlined">cancel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {error && <p className="up-error" style={{marginTop:'.5rem'}}>{error}</p>}

        <div className="up-modal__footer">
          <button className="up-btn up-btn--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="up-btn up-btn--primary" onClick={handleGuardar} disabled={saving || loading}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal URL Onboarding ─────────────────────────────────────────────────────

function OnboardingUrlModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = () => {
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }
  return (
    <div className="up-overlay" onClick={onClose}>
      <div className="up-modal" onClick={e => e.stopPropagation()}>
        <span className="material-symbols-outlined" style={{fontSize:'2rem',color:'#22c55e',display:'block',marginBottom:'.5rem'}}>check_circle</span>
        <h3 className="up-modal__title">Usuario creado</h3>
        <p style={{fontSize:'.85rem',color:'#64748b',margin:'.5rem 0 1rem'}}>
          Comparte este link. El usuario tendrá <strong>30 minutos</strong> para completar su perfil.
        </p>
        <div className="up-url-box">
          <span className="up-url-text">{url}</span>
          <button className="up-btn up-btn--sm up-btn--primary" onClick={copiar}>
            <span className="material-symbols-outlined">{copiado ? 'check' : 'content_copy'}</span>
            {copiado ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
        <div className="up-modal__footer">
          <button className="up-btn up-btn--ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal confirmar eliminar ─────────────────────────────────────────────────

function EliminarModal({ usuario, onClose, onDeleted }: { usuario: Usuario; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleEliminar = async () => {
    setLoading(true)
    try {
      await apiFetch(`users/${usuario.id}`, { method: 'DELETE' })
      onDeleted()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="up-overlay" onClick={onClose}>
      <div className="up-modal" style={{textAlign:'center'}} onClick={e => e.stopPropagation()}>
        <span className="material-symbols-outlined" style={{fontSize:'2.5rem',color:'#f59e0b',display:'block',marginBottom:'.5rem'}}>warning</span>
        <h3 className="up-modal__title">¿Eliminar usuario?</h3>
        <p style={{fontSize:'.85rem',color:'#64748b',margin:'.5rem 0 1rem'}}>
          Se eliminará <strong>{usuario.email}</strong> permanentemente. Esta acción no se puede deshacer.
        </p>
        {error && <p className="up-error">{error}</p>}
        <div className="up-modal__footer" style={{justifyContent:'center'}}>
          <button className="up-btn up-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="up-btn up-btn--danger" onClick={handleEliminar} disabled={loading}>
            {loading ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

type ModalEstado =
  | { tipo: 'crear' }
  | { tipo: 'editar'; usuario: Usuario }
  | { tipo: 'eliminar'; usuario: Usuario }
  | { tipo: 'url'; url: string }
  | null

export default function UsuariosPanel() {
  const { puede } = usePermisos()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles,    setRoles]    = useState<Rol[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<ModalEstado>(null)
  const [toast,    setToast]    = useState('')
  const [busqueda, setBusqueda] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([
        apiFetch<Usuario[]>('users'),
        apiFetch<Rol[]>('roles'),
      ])
      setUsuarios(Array.isArray(u) ? u : [])
      setRoles(Array.isArray(r) ? r : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleSuspender = async (u: Usuario) => {
    try {
      const res = await apiFetch<{ message: string }>(`users/${u.id}/suspender`, { method: 'PUT' })
      showToast(res.message)
      cargar()
    } catch (e) { showToast((e as Error).message) }
  }

  // Filtro por nombre o email
  const usuariosFiltrados = usuarios.filter(u => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      u.name.toLowerCase().includes(q)      ||
      (u.last_name ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="up-wrap">
      <style>{CSS}</style>

      {/* Header */}
      <div className="up-header">
        <div>
          <h2 className="up-title">Gestión de Usuarios</h2>
          <p className="up-subtitle">Administra los usuarios de tu empresa y sus permisos</p>
        </div>
        {puede('empresa.usuarios.crear') && (
          <button className="up-btn up-btn--primary" onClick={() => setModal({ tipo: 'crear' })}>
            <span className="material-symbols-outlined">person_add</span>
            Nuevo usuario
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="up-search-wrap">
        <span className="material-symbols-outlined up-search-icon">search</span>
        <input className="up-search" placeholder="Buscar por nombre o email…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {toast && <div className="up-toast">{toast}</div>}

      {/* Lista */}
      {loading ? (
        <div className="up-state"><div className="up-spinner"/>Cargando usuarios…</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="up-state">
          <span className="material-symbols-outlined">group_off</span>
          <p>{busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay usuarios en esta empresa.'}</p>
        </div>
      ) : (
        <div className="up-list">
          {usuariosFiltrados.map(u => (
            <div key={u.id} className={`up-card ${!u.esta_activo ? 'up-card--suspendido' : ''}`}>
              <div className="up-card__info">
                <div className="up-avatar"
                  style={{background: u.onboarding_completado ? 'var(--c-secondary,#38C172)' : '#94a3b8'}}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="up-name-row">
                    <p className="up-card__name">{u.name} {u.last_name}</p>
                    {!u.onboarding_completado && <span className="up-badge up-badge--pending">Pendiente activar</span>}
                    {!u.esta_activo           && <span className="up-badge up-badge--suspended">Suspendido</span>}
                  </div>
                  <p className="up-card__email">{u.email}</p>
                </div>
              </div>

              <div className="up-card__right">
                <span className="up-rol-chip">{u.rol?.nombre ?? 'Sin rol'}</span>
                <div className="up-card__actions">
                  {/* Editar permisos — solo si completó onboarding */}
                  {puede('empresa.usuarios.editar') && u.onboarding_completado && (
                    <button className="up-icon-btn up-icon-btn--edit" title="Editar permisos y rol"
                      onClick={() => setModal({ tipo: 'editar', usuario: u })}>
                      <span className="material-symbols-outlined">manage_accounts</span>
                    </button>
                  )}
                  {/* Suspender/reactivar — solo si completó onboarding */}
                  {puede('empresa.usuarios.suspender') && u.onboarding_completado && (
                    <button
                      className={`up-icon-btn ${u.esta_activo ? 'up-icon-btn--suspend' : 'up-icon-btn--activate'}`}
                      title={u.esta_activo ? 'Suspender' : 'Reactivar'}
                      onClick={() => handleSuspender(u)}>
                      <span className="material-symbols-outlined">
                        {u.esta_activo ? 'person_off' : 'person_check'}
                      </span>
                    </button>
                  )}
                  {/* Eliminar — solo si NO completó onboarding */}
                  {puede('empresa.usuarios.crear') && !u.onboarding_completado && (
                    <button className="up-icon-btn up-icon-btn--delete" title="Eliminar"
                      onClick={() => setModal({ tipo: 'eliminar', usuario: u })}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {modal?.tipo === 'crear' && (
        <CrearModal roles={roles} onClose={() => setModal(null)}
          onSaved={url => setModal({ tipo: 'url', url })} />
      )}
      {modal?.tipo === 'url' && (
        <OnboardingUrlModal url={modal.url} onClose={() => { setModal(null); cargar() }} />
      )}
      {modal?.tipo === 'editar' && (
        <EditarPermisosModal usuario={modal.usuario} roles={roles}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast('Cambios guardados.'); cargar() }} />
      )}
      {modal?.tipo === 'eliminar' && (
        <EliminarModal usuario={modal.usuario} onClose={() => setModal(null)}
          onDeleted={() => { setModal(null); showToast('Usuario eliminado.'); cargar() }} />
      )}
    </div>
  )
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.up-wrap { padding:0; max-width:920px; }
.up-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.25rem; }
.up-title    { font-size:1.4rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; letter-spacing:-.03em; }
.up-subtitle { font-size:.85rem; color:#64748b; margin:0; }

/* Buscador */
.up-search-wrap { position:relative; margin-bottom:1rem; }
.up-search-icon { position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem; pointer-events:none; }
.up-search { width:100%; padding:.6rem 1rem .6rem 2.5rem; background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; font-family:inherit; font-size:.88rem; color:#0f172a; outline:none; transition:border-color .15s; }
.up-search:focus { border-color:var(--c-primary,#E3342F); }

/* Cards */
.up-list { display:flex; flex-direction:column; gap:.5rem; }
.up-card { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.875rem 1.1rem; background:#fff; border:1px solid #f1f5f9; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.04); transition:box-shadow .15s,border-color .15s; }
.up-card:hover { border-color:#e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,.07); }
.up-card--suspendido { opacity:.55; }
.up-card__info  { display:flex; align-items:center; gap:.8rem; flex:1; min-width:0; }
.up-card__right { display:flex; align-items:center; gap:.75rem; flex-shrink:0; }
.up-card__actions { display:flex; gap:.35rem; }
.up-name-row    { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.up-card__name  { font-weight:600; font-size:.9rem; color:#0f172a; margin:0; }
.up-card__email { font-size:.78rem; color:#94a3b8; margin:.1rem 0 0; }

.up-avatar { width:36px; height:36px; border-radius:50%; display:grid; place-items:center; font-weight:700; font-size:.9rem; color:#fff; flex-shrink:0; }
.up-rol-chip { padding:.2rem .65rem; border-radius:99px; font-size:.73rem; font-weight:600; background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; white-space:nowrap; }
.up-badge { padding:.15rem .5rem; border-radius:99px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
.up-badge--pending   { background:#fef9c3; color:#854d0e; border:1px solid #fde047; }
.up-badge--suspended { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }

.up-icon-btn { width:30px; height:30px; border:none; border-radius:7px; display:grid; place-items:center; cursor:pointer; transition:background .15s; }
.up-icon-btn .material-symbols-outlined { font-size:.95rem; }
.up-icon-btn--edit     { background:#eff6ff; color:#3b82f6; }
.up-icon-btn--edit:hover     { background:#dbeafe; }
.up-icon-btn--suspend  { background:#fef2f2; color:#ef4444; }
.up-icon-btn--suspend:hover  { background:#fee2e2; }
.up-icon-btn--activate { background:#f0fdf4; color:#22c55e; }
.up-icon-btn--activate:hover { background:#dcfce7; }
.up-icon-btn--delete   { background:#fef2f2; color:#ef4444; }
.up-icon-btn--delete:hover   { background:#fee2e2; }

/* Botones */
.up-btn { display:inline-flex; align-items:center; gap:.35rem; padding:.48rem 1rem; border-radius:8px; border:none; font-size:.83rem; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s,background .15s; }
.up-btn .material-symbols-outlined { font-size:1rem; }
.up-btn--primary { background:var(--c-primary,#E3342F); color:#fff; }
.up-btn--primary:hover { opacity:.88; }
.up-btn--ghost  { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
.up-btn--ghost:hover { background:#f1f5f9; }
.up-btn--danger { background:#ef4444; color:#fff; }
.up-btn--danger:hover { background:#dc2626; }
.up-btn--sm { padding:.28rem .6rem; font-size:.77rem; }
.up-btn:disabled { opacity:.5; cursor:not-allowed; }

/* Form */
.up-label { display:block; font-size:.72rem; font-weight:600; color:#64748b; margin:.75rem 0 .3rem; text-transform:uppercase; letter-spacing:.05em; }
.up-input { width:100%; box-sizing:border-box; padding:.6rem .875rem; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:9px; color:#0f172a; font-size:.88rem; font-family:inherit; outline:none; transition:border-color .15s; }
.up-input:focus { border-color:var(--c-primary,#E3342F); background:#fff; }
.up-error { color:#ef4444; font-size:.82rem; margin-top:.4rem; }

/* Modal */
.up-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(4px); display:grid; place-items:center; z-index:1000; animation:upFade .15s ease; }
.up-modal { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:1.75rem; width:100%; max-width:440px; box-shadow:0 20px 60px rgba(0,0,0,.15); animation:upSlide .2s ease; max-height:90vh; overflow-y:auto; }
.up-modal--wide { max-width:700px; }
@keyframes upFade  { from{opacity:0} to{opacity:1} }
@keyframes upSlide { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:none} }
.up-modal__title  { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0 0 .1rem; }
.up-modal__footer { display:flex; justify-content:flex-end; gap:.6rem; margin-top:1.25rem; }

/* URL box */
.up-url-box  { display:flex; align-items:center; gap:.5rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:9px; padding:.6rem .875rem; }
.up-url-text { font-size:.72rem; color:#475569; word-break:break-all; flex:1; font-family:monospace; }

/* Editor permisos */
.up-permisos-header { display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-bottom:.75rem; flex-wrap:wrap; }
.up-permisos-title  { font-size:.88rem; font-weight:700; color:#0f172a; }
.up-leyenda { display:flex; gap:.5rem; flex-wrap:wrap; }
.up-leyenda-item { font-size:.68rem; font-weight:600; padding:.15rem .5rem; border-radius:99px; background:#f1f5f9; color:#475569; }
.up-leyenda--rol      { background:#f0fdf4; color:#166534; }
.up-leyenda--extra    { background:#eff6ff; color:#1d4ed8; }
.up-leyenda--denegado { background:#fef2f2; color:#991b1b; }

.up-permisos-body { border:1px solid #f1f5f9; border-radius:10px; overflow:hidden; max-height:360px; overflow-y:auto; }
.up-modulo { }
.up-modulo-label { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#94a3b8; padding:.5rem .875rem .3rem; background:#fafafa; border-bottom:1px solid #f1f5f9; position:sticky; top:0; }
.up-permiso-row { display:flex; align-items:center; justify-content:space-between; padding:.45rem .875rem; border-bottom:1px solid #f8fafc; transition:background .1s; }
.up-permiso-row:last-child { border-bottom:none; }
.up-permiso--rol      { background:#f0fdf4; }
.up-permiso--extra    { background:#eff6ff; }
.up-permiso--denegado { background:#fef2f2; }
.up-permiso-nombre { font-size:.8rem; color:#334155; }
.up-permiso-btns { display:flex; gap:.2rem; }
.up-toggle { width:26px; height:26px; border:none; background:transparent; border-radius:5px; display:grid; place-items:center; cursor:pointer; color:#cbd5e1; transition:color .15s,background .15s; }
.up-toggle .material-symbols-outlined { font-size:.95rem; }
.up-toggle:hover { background:#f1f5f9; }
.up-toggle--on-green { color:#22c55e; background:#f0fdf4; }
.up-toggle--on-red   { color:#ef4444; background:#fef2f2; }

/* States */
.up-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:3rem; color:#94a3b8; font-size:.9rem; }
.up-state .material-symbols-outlined { font-size:2.5rem; opacity:.35; }
.up-spinner { width:24px; height:24px; border:3px solid #f1f5f9; border-top-color:var(--c-primary,#E3342F); border-radius:50%; animation:upSpin .7s linear infinite; }
@keyframes upSpin { to{transform:rotate(360deg)} }

.up-toast { position:fixed; bottom:1.5rem; right:1.5rem; background:#1e293b; color:#f1f5f9; padding:.7rem 1.2rem; border-radius:10px; font-size:.85rem; border-left:3px solid var(--c-secondary,#38C172); box-shadow:0 8px 24px rgba(0,0,0,.2); z-index:2000; animation:upFade .2s ease; }
`