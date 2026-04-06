// src/dashboard/modules/perfil/PerfilPanel.tsx
import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../../api/client'

interface TipoId { id: number; nombre: string; abreviatura: string }

interface PerfilData {
  id:                     number
  name:                   string
  last_name:              string | null
  email:                  string
  telefono:               string | null
  direccion:              string | null
  identificacion:         string | null
  tipo_identificacion_id: number | string | null
  onboarding_completado:  boolean
  tipos_identificacion:   TipoId[]
  avatar_url?:            string
}

export default function PerfilPanel() {
  const [perfil,    setPerfil]    = useState<PerfilData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [editando,  setEditando]  = useState(false)   // modo vista vs edición
  const [tab,       setTab]       = useState<'info'|'password'>('info')
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [toastErr,  setToastErr]  = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:                   '',
    last_name:              '',
    telefono:               '',
    direccion:              '',
    identificacion:         '',
    tipo_identificacion_id: '',
  })

  const [pwd, setPwd] = useState({
    password_actual:       '',
    password:              '',
    password_confirmation: '',
  })

  const showToast = (msg: string, err = false) => {
    if (err) { setToastErr(msg); setTimeout(() => setToastErr(''), 3500) }
    else     { setToast(msg);    setTimeout(() => setToast(''),    3500) }
  }

  const cargar = () => {
    setLoading(true)
    apiFetch<PerfilData>('perfil')
      .then(data => {
        setPerfil(data)
        setForm({
          name:                   data.name ?? '',
          last_name:              data.last_name ?? '',
          telefono:               data.telefono ?? '',
          direccion:              data.direccion ?? '',
          identificacion:         data.identificacion ?? '',
          tipo_identificacion_id: String(data.tipo_identificacion_id ?? ''),
        })
      })
      .catch(() => showToast('Error al cargar el perfil.', true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const handleCancelar = () => {
    // Restaurar form al estado original del perfil
    if (perfil) {
      setForm({
        name:                   perfil.name ?? '',
        last_name:              perfil.last_name ?? '',
        telefono:               perfil.telefono ?? '',
        direccion:              perfil.direccion ?? '',
        identificacion:         perfil.identificacion ?? '',
        tipo_identificacion_id: String(perfil.tipo_identificacion_id ?? ''),
      })
    }
    setEditando(false)
  }

  const handleGuardarInfo = async () => {
    setSaving(true)
    try {
      const res = await apiFetch<{ message: string; user: { name: string; last_name: string } }>('perfil', {
        method: 'PUT',
        body:   JSON.stringify({
          ...form,
          tipo_identificacion_id: form.tipo_identificacion_id ? Number(form.tipo_identificacion_id) : null,
        }),
      })
      localStorage.setItem('user_name', res.user.name)
      showToast('Perfil actualizado.')
      setEditando(false)
      cargar()
    } catch (e) {
      showToast((e as Error).message, true)
    } finally {
      setSaving(false)
    }
  }

  const handleCambiarPassword = async () => {
    if (pwd.password !== pwd.password_confirmation) {
      showToast('Las contraseñas no coinciden.', true); return
    }
    setSaving(true)
    try {
      await apiFetch('perfil/password', { method: 'PUT', body: JSON.stringify(pwd) })
      showToast('Contraseña actualizada.')
      setPwd({ password_actual: '', password: '', password_confirmation: '' })
    } catch (e) {
      showToast((e as Error).message, true)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    const token = localStorage.getItem('access_token')
    const slug  = localStorage.getItem('empresa_slug')
    const BASE  = import.meta.env.VITE_API_URL ?? '/api'
    try {
      const res  = await fetch(`${BASE}/${slug}/perfil/avatar`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body:    formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPerfil(prev => prev ? { ...prev, avatar_url: data.avatar_url } : prev)
      showToast('Foto actualizada.')
    } catch (e) {
      showToast((e as Error).message, true)
    }
  }

  // Comparar como string porque SQL Server devuelve IDs como string
  const tipoNombre = perfil?.tipos_identificacion.find(
    t => String(t.id) === String(perfil.tipo_identificacion_id)
  )

  const initials = perfil
    ? `${perfil.name.charAt(0)}${perfil.last_name?.charAt(0) ?? ''}`.toUpperCase()
    : '?'

  if (loading) return (
    <div className="pf-state"><div className="pf-spinner"/>Cargando perfil…</div>
  )

  return (
    <div className="pf-wrap">
      <style>{CSS}</style>

      {toast    && <div className="pf-toast">{toast}</div>}
      {toastErr && <div className="pf-toast pf-toast--err">{toastErr}</div>}

      {/* ── Hero ── */}
      <div className="pf-hero">
        <div className="pf-avatar-wrap"
          onClick={() => editando && fileRef.current?.click()}
          style={{cursor: editando ? 'pointer' : 'default'}}
          title={editando ? 'Cambiar foto' : ''}>
          {perfil?.avatar_url
            ? <img src={perfil.avatar_url} alt="avatar" className="pf-avatar-img"/>
            : <span className="pf-avatar-initials">{initials}</span>}
          {editando && (
            <div className="pf-avatar-overlay">
              <span className="material-symbols-outlined">photo_camera</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange}/>

        <div style={{flex:1}}>
          <h2 className="pf-name">{perfil?.name} {perfil?.last_name}</h2>
          <p className="pf-email">{perfil?.email}</p>
        </div>

        {/* Botón editar solo visible en modo vista */}
        {!editando && (
          <button className="pf-btn pf-btn--outline" onClick={() => { setEditando(true); setTab('info') }}>
            <span className="material-symbols-outlined">edit</span>
            Editar perfil
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="pf-tabs">
        <button className={`pf-tab ${tab === 'info' ? 'pf-tab--active' : ''}`} onClick={() => setTab('info')}>
          <span className="material-symbols-outlined">person</span>
          Información personal
        </button>
        <button className={`pf-tab ${tab === 'password' ? 'pf-tab--active' : ''}`} onClick={() => setTab('password')}>
          <span className="material-symbols-outlined">lock</span>
          Contraseña
        </button>
      </div>

      {/* ── Tab Información ── */}
      {tab === 'info' && (
        <div className="pf-section">
          {/* ─ MODO VISTA ─ */}
          {!editando ? (
            <div className="pf-view-grid">
              <div className="pf-field">
                <span className="pf-field-label">Nombre</span>
                <span className="pf-field-value">{perfil?.name || <em className="pf-empty">Sin completar</em>}</span>
              </div>
              <div className="pf-field">
                <span className="pf-field-label">Apellido</span>
                <span className="pf-field-value">{perfil?.last_name || <em className="pf-empty">Sin completar</em>}</span>
              </div>
              <div className="pf-field">
                <span className="pf-field-label">Teléfono</span>
                <span className="pf-field-value">{perfil?.telefono || <em className="pf-empty">Sin completar</em>}</span>
              </div>
              <div className="pf-field">
                <span className="pf-field-label">Dirección</span>
                <span className="pf-field-value">{perfil?.direccion || <em className="pf-empty">Sin completar</em>}</span>
              </div>
              <div className="pf-field">
                <span className="pf-field-label">Tipo de identificación</span>
                <span className="pf-field-value">
                  {tipoNombre
                    ? `${tipoNombre.abreviatura} — ${tipoNombre.nombre}`
                    : <em className="pf-empty">Sin completar</em>}
                </span>
              </div>
              <div className="pf-field">
                <span className="pf-field-label">Número de identificación</span>
                <span className="pf-field-value">{perfil?.identificacion || <em className="pf-empty">Sin completar</em>}</span>
              </div>
            </div>
          ) : (
            /* ─ MODO EDICIÓN ─ */
            <>
              <div className="pf-grid">
                <div>
                  <label className="pf-label">Nombre *</label>
                  <input className="pf-input" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} placeholder="Tu nombre"/>
                </div>
                <div>
                  <label className="pf-label">Apellido</label>
                  <input className="pf-input" value={form.last_name}
                    onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Tu apellido"/>
                </div>
                <div>
                  <label className="pf-label">Teléfono</label>
                  <input className="pf-input" value={form.telefono}
                    onChange={e => setForm({...form, telefono: e.target.value})} placeholder="3001234567"/>
                </div>
                <div>
                  <label className="pf-label">Dirección</label>
                  <input className="pf-input" value={form.direccion}
                    onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Tu dirección"/>
                </div>
                <div>
                  <label className="pf-label">Tipo de identificación</label>
                  <select className="pf-input" value={form.tipo_identificacion_id}
                    onChange={e => setForm({...form, tipo_identificacion_id: e.target.value})}>
                    <option value="">— Selecciona —</option>
                    {perfil?.tipos_identificacion.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.abreviatura} — {t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pf-label">Número de identificación</label>
                  <input className="pf-input" value={form.identificacion}
                    onChange={e => setForm({...form, identificacion: e.target.value})} placeholder="Tu número de ID"/>
                </div>
              </div>

              <div className="pf-footer">
                <button className="pf-btn pf-btn--ghost" onClick={handleCancelar} disabled={saving}>
                  Cancelar
                </button>
                <button className="pf-btn pf-btn--primary" onClick={handleGuardarInfo} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab Contraseña (siempre en modo edición) ── */}
      {tab === 'password' && (
        <div className="pf-section pf-section--sm">
          <div>
            <label className="pf-label">Contraseña actual *</label>
            <input className="pf-input" type="password" value={pwd.password_actual}
              onChange={e => setPwd({...pwd, password_actual: e.target.value})} placeholder="Tu contraseña actual"/>
          </div>
          <div>
            <label className="pf-label">Nueva contraseña *</label>
            <input className="pf-input" type="password" value={pwd.password}
              onChange={e => setPwd({...pwd, password: e.target.value})} placeholder="Mínimo 8 caracteres"/>
          </div>
          <div>
            <label className="pf-label">Confirmar nueva contraseña *</label>
            <input className="pf-input" type="password" value={pwd.password_confirmation}
              onChange={e => setPwd({...pwd, password_confirmation: e.target.value})} placeholder="Repite la nueva contraseña"/>
          </div>
          <div className="pf-footer">
            <button className="pf-btn pf-btn--primary" onClick={handleCambiarPassword} disabled={saving}>
              {saving ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const CSS = `
.pf-wrap { max-width:640px; }

.pf-hero { display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem;
  padding:1.5rem; background:#fff; border:1px solid #f1f5f9;
  border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,.04); flex-wrap:wrap; }

.pf-avatar-wrap { position:relative; width:72px; height:72px; border-radius:50%;
  flex-shrink:0; overflow:hidden; background:var(--c-primary,#E3342F);
  border:3px solid color-mix(in srgb,var(--c-primary,#E3342F) 30%,transparent); }
.pf-avatar-img      { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.pf-avatar-initials { width:100%; height:100%; display:grid; place-items:center;
  font-weight:700; font-size:1.4rem; color:#fff; }
.pf-avatar-overlay  { position:absolute; inset:0; background:rgba(0,0,0,.45);
  display:grid; place-items:center; opacity:0; transition:opacity .15s; border-radius:50%; }
.pf-avatar-overlay .material-symbols-outlined { color:#fff; font-size:1.4rem; }
.pf-avatar-wrap:hover .pf-avatar-overlay { opacity:1; }

.pf-name  { font-size:1.2rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; }
.pf-email { font-size:.85rem; color:#64748b; margin:0; }

.pf-tabs { display:flex; gap:.4rem; margin-bottom:1.25rem;
  border-bottom:1px solid #f1f5f9; padding-bottom:.5rem; }
.pf-tab  { display:flex; align-items:center; gap:.4rem; padding:.45rem .9rem;
  border:none; border-radius:8px; background:transparent; color:#94a3b8;
  font-size:.85rem; font-weight:500; cursor:pointer; transition:background .15s,color .15s; font-family:inherit; }
.pf-tab .material-symbols-outlined { font-size:1.05rem; }
.pf-tab:hover { background:#f1f5f9; color:#334155; }
.pf-tab--active { background:#f1f5f9; color:#0f172a; font-weight:600; }

.pf-section { background:#fff; border:1px solid #f1f5f9; border-radius:16px;
  padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.pf-section--sm { display:flex; flex-direction:column; gap:1rem; }

/* Vista (read-only) */
.pf-view-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem 1.5rem; }
@media(max-width:520px){ .pf-view-grid,.pf-grid { grid-template-columns:1fr; } }
.pf-field { display:flex; flex-direction:column; gap:.25rem; padding:.75rem 0;
  border-bottom:1px solid #f8fafc; }
.pf-field:nth-last-child(-n+2) { border-bottom:none; }
.pf-field-label { font-size:.7rem; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.06em; }
.pf-field-value { font-size:.9rem; color:#0f172a; font-weight:500; }
.pf-empty { font-style:italic; color:#cbd5e1; font-weight:400; }

/* Edición */
.pf-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.pf-label { display:block; font-size:.73rem; font-weight:600; color:#64748b;
  margin-bottom:.3rem; text-transform:uppercase; letter-spacing:.04em; }
.pf-input { width:100%; box-sizing:border-box; padding:.65rem .875rem;
  background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:9px; color:#0f172a;
  font-size:.88rem; font-family:inherit; outline:none; transition:border-color .15s; }
.pf-input:focus { border-color:var(--c-primary,#E3342F); background:#fff; }

.pf-footer { display:flex; justify-content:flex-end; gap:.6rem;
  margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid #f1f5f9; }

.pf-btn { display:inline-flex; align-items:center; gap:.35rem; padding:.55rem 1.1rem;
  border-radius:9px; border:none; font-size:.85rem; font-weight:600; cursor:pointer;
  font-family:inherit; transition:opacity .15s,background .15s; }
.pf-btn .material-symbols-outlined { font-size:1rem; }
.pf-btn--primary { background:var(--c-primary,#E3342F); color:#fff; }
.pf-btn--primary:hover { opacity:.88; }
.pf-btn--outline { background:#fff; color:#475569; border:1px solid #e2e8f0; }
.pf-btn--outline:hover { background:#f8fafc; }
.pf-btn--ghost   { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
.pf-btn--ghost:hover { background:#f1f5f9; }
.pf-btn:disabled { opacity:.5; cursor:not-allowed; }

.pf-state { display:flex; align-items:center; justify-content:center;
  gap:.75rem; padding:3rem; color:#94a3b8; font-size:.9rem; }
.pf-spinner { width:24px; height:24px; border:3px solid #f1f5f9;
  border-top-color:var(--c-primary,#E3342F); border-radius:50%;
  animation:pfSpin .7s linear infinite; }
@keyframes pfSpin { to{transform:rotate(360deg)} }

.pf-toast { position:fixed; bottom:1.5rem; right:1.5rem; background:#1e293b;
  color:#f1f5f9; padding:.7rem 1.2rem; border-radius:10px; font-size:.85rem;
  border-left:3px solid var(--c-secondary,#38C172);
  box-shadow:0 8px 24px rgba(0,0,0,.2); z-index:2000; animation:pfFade .2s ease; }
.pf-toast--err { border-left-color:#ef4444; }
@keyframes pfFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
`