// src/dashboard/modules/empresa/parametrizacion/ParametrizacionPanel.tsx
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../../../api/client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Moneda       { id: number; nombre: string; codigo_iso: string; simbolo: string }
interface TipoId       { id: number; nombre: string; abreviatura: string; esta_activo: boolean | string }
interface MetodoPago   { id: number; nombre: string; descripcion: string | null; esta_activo: boolean | string }
interface UnidadMedida { id: number; nombre: string; abreviatura: string; esta_activa: boolean | string }

interface Config {
  moneda_id:                 number
  moneda_actual:             Moneda | null
  facturacion_prefijo:       string | null
  facturacion_numero_inicio: number
  facturacion_numero_actual: number
  stock_minimo_global:       number
  monedas_disponibles:       Moneda[]
}

type Tab = 'config' | 'tipos_id' | 'metodos_pago' | 'unidades'

const isActivo = (v: boolean | string | number): boolean =>
  v === true || v === '1' || v === 1

// ─── Modal genérico (nombre + descripción opcional) ───────────────────────────

interface ItemModalProps {
  titulo:          string
  item:            { nombre: string; descripcion?: string | null } | null
  conDescripcion?: boolean
  onClose:         () => void
  onSaved:         (nombre: string, descripcion: string) => Promise<void>
}

function ItemModal({ titulo, item, conDescripcion = false, onClose, onSaved }: ItemModalProps) {
  const [nombre,      setNombre]      = useState(item?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setLoading(true)
    try { await onSaved(nombre, descripcion) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <h3 className="pm-modal__title">{titulo}</h3>
        <label className="pm-label">Nombre</label>
        <input className="pm-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre..." autoFocus />
        {conDescripcion && (<>
          <label className="pm-label">Descripción</label>
          <input className="pm-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción opcional" />
        </>)}
        {error && <p className="pm-error">{error}</p>}
        <div className="pm-modal__footer">
          <button className="pm-btn pm-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal tipo de identificación ────────────────────────────────────────────

function TipoIdModal({ item, onClose, onSaved }: { item: TipoId | null; onClose: () => void; onSaved: () => void }) {
  const [nombre,      setNombre]      = useState(item?.nombre ?? '')
  const [abreviatura, setAbreviatura] = useState(item?.abreviatura ?? '')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim())      { setError('El nombre es obligatorio.'); return }
    if (!abreviatura.trim()) { setError('La abreviatura es obligatoria.'); return }
    setLoading(true)
    try {
      if (item) {
        await apiFetch(`parametrizacion/tipos-identificacion/${item.id}`, { method: 'PUT', body: JSON.stringify({ nombre, abreviatura }) })
      } else {
        await apiFetch('parametrizacion/tipos-identificacion', { method: 'POST', body: JSON.stringify({ nombre, abreviatura }) })
      }
      onSaved()
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <h3 className="pm-modal__title">{item ? 'Editar tipo de identificación' : 'Nuevo tipo de identificación'}</h3>
        <label className="pm-label">Nombre</label>
        <input className="pm-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Cédula de Ciudadanía" autoFocus />
        <label className="pm-label">Abreviatura</label>
        <input className="pm-input" value={abreviatura} onChange={e => setAbreviatura(e.target.value.toUpperCase())} placeholder="Ej: CC" maxLength={10} />
        {error && <p className="pm-error">{error}</p>}
        <div className="pm-modal__footer">
          <button className="pm-btn pm-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal unidad de medida ───────────────────────────────────────────────────

function UnidadModal({ item, onClose, onSaved }: { item: UnidadMedida | null; onClose: () => void; onSaved: () => void }) {
  const [nombre,      setNombre]      = useState(item?.nombre ?? '')
  const [abreviatura, setAbreviatura] = useState(item?.abreviatura ?? '')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim())      { setError('El nombre es obligatorio.'); return }
    if (!abreviatura.trim()) { setError('La abreviatura es obligatoria.'); return }
    setLoading(true)
    try {
      if (item) {
        await apiFetch(`parametrizacion/unidades-medida/${item.id}`, { method: 'PUT', body: JSON.stringify({ nombre, abreviatura }) })
      } else {
        await apiFetch('parametrizacion/unidades-medida', { method: 'POST', body: JSON.stringify({ nombre, abreviatura }) })
      }
      onSaved()
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <h3 className="pm-modal__title">{item ? 'Editar unidad de medida' : 'Nueva unidad de medida'}</h3>
        <label className="pm-label">Nombre</label>
        <input className="pm-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Kilogramo" autoFocus />
        <label className="pm-label">Abreviatura</label>
        <input className="pm-input" value={abreviatura} onChange={e => setAbreviatura(e.target.value.toLowerCase())} placeholder="Ej: kg" maxLength={20} />
        <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.3rem' }}>Se guardará en minúsculas. Ej: kg, ml, und</p>
        {error && <p className="pm-error">{error}</p>}
        <div className="pm-modal__footer">
          <button className="pm-btn pm-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

type ModalState =
  | { tipo: 'tipo_id'; item: TipoId | null }
  | { tipo: 'metodo';  item: MetodoPago | null }
  | { tipo: 'unidad';  item: UnidadMedida | null }
  | null

export default function ParametrizacionPanel() {
  const [tab,       setTab]       = useState<Tab>('config')
  const [config,    setConfig]    = useState<Config | null>(null)
  const [tiposId,   setTiposId]   = useState<TipoId[]>([])
  const [metodos,   setMetodos]   = useState<MetodoPago[]>([])
  const [unidades,  setUnidades]  = useState<UnidadMedida[]>([])
  const [loading,   setLoading]   = useState(false)
  const [savingCfg, setSavingCfg] = useState(false)
  const [modal,     setModal]     = useState<ModalState>(null)
  const [toast,     setToast]     = useState('')
  const [toastErr,  setToastErr]  = useState('')

  const [cfgForm, setCfgForm] = useState({
    moneda_id:                 '',
    facturacion_prefijo:       '',
    facturacion_numero_inicio: '',
    stock_minimo_global:       '',
  })

  const showToast = (msg: string, err = false) => {
    if (err) { setToastErr(msg); setTimeout(() => setToastErr(''), 3500) }
    else     { setToast(msg);    setTimeout(() => setToast(''),    3500) }
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  const cargarConfig = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<Config>('parametrizacion/config')
      setConfig(data)
      setCfgForm({
        moneda_id:                 String(data.moneda_id ?? ''),
        facturacion_prefijo:       data.facturacion_prefijo ?? '',
        facturacion_numero_inicio: String(data.facturacion_numero_inicio ?? 1),
        stock_minimo_global:       String(data.stock_minimo_global ?? 5),
      })
    } catch (e) { showToast((e as Error).message, true) }
    finally { setLoading(false) }
  }, [])

  const cargarTipos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<TipoId[]>('parametrizacion/tipos-identificacion')
      setTiposId(Array.isArray(data) ? data : [])
    } catch (e) { showToast((e as Error).message, true) }
    finally { setLoading(false) }
  }, [])

  const cargarMetodos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<MetodoPago[]>('parametrizacion/metodos-pago')
      setMetodos(Array.isArray(data) ? data : [])
    } catch (e) { showToast((e as Error).message, true) }
    finally { setLoading(false) }
  }, [])

  const cargarUnidades = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<UnidadMedida[]>('parametrizacion/unidades-medida')
      setUnidades(Array.isArray(data) ? data : [])
    } catch (e) { showToast((e as Error).message, true) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (tab === 'config')       cargarConfig()
    if (tab === 'tipos_id')     cargarTipos()
    if (tab === 'metodos_pago') cargarMetodos()
    if (tab === 'unidades')     cargarUnidades()
  }, [tab, cargarConfig, cargarTipos, cargarMetodos, cargarUnidades])

  // ── Acciones ──────────────────────────────────────────────────────────────

  const handleGuardarConfig = async () => {
    setSavingCfg(true)
    try {
      await apiFetch('parametrizacion/config', {
        method: 'PUT',
        body: JSON.stringify({
          moneda_id:                 Number(cfgForm.moneda_id),
          facturacion_prefijo:       cfgForm.facturacion_prefijo || null,
          facturacion_numero_inicio: Number(cfgForm.facturacion_numero_inicio) || 1,
          stock_minimo_global:       Number(cfgForm.stock_minimo_global) || 0,
        }),
      })
      showToast('Configuración guardada.')
      cargarConfig()
    } catch (e) { showToast((e as Error).message, true) }
    finally { setSavingCfg(false) }
  }

  const handleToggleTipo = async (id: number) => {
    try {
      const res = await apiFetch<{ message: string }>(`parametrizacion/tipos-identificacion/${id}/toggle`, { method: 'PUT' })
      showToast(res.message); cargarTipos()
    } catch (e) { showToast((e as Error).message, true) }
  }

  const handleToggleMetodo = async (id: number) => {
    try {
      const res = await apiFetch<{ message: string }>(`parametrizacion/metodos-pago/${id}/toggle`, { method: 'PUT' })
      showToast(res.message); cargarMetodos()
    } catch (e) { showToast((e as Error).message, true) }
  }

  const handleEliminarMetodo = async (id: number) => {
    if (!confirm('¿Eliminar este método de pago?')) return
    try {
      await apiFetch(`parametrizacion/metodos-pago/${id}`, { method: 'DELETE' })
      showToast('Método eliminado.'); cargarMetodos()
    } catch (e) { showToast((e as Error).message, true) }
  }

  const handleToggleUnidad = async (id: number) => {
    try {
      const res = await apiFetch<{ message: string }>(`parametrizacion/unidades-medida/${id}/toggle`, { method: 'PUT' })
      showToast(res.message); cargarUnidades()
    } catch (e) { showToast((e as Error).message, true) }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="pm-wrap">
      <style>{CSS}</style>

      {toast    && <div className="pm-toast">{toast}</div>}
      {toastErr && <div className="pm-toast pm-toast--err">{toastErr}</div>}

      <div className="pm-header">
        <div>
          <h2 className="pm-title">Parametrización</h2>
          <p className="pm-subtitle">Configura los datos base de tu empresa</p>
        </div>
        {tab === 'tipos_id'    && <button className="pm-btn pm-btn--primary" onClick={() => setModal({ tipo: 'tipo_id', item: null })}><span className="material-symbols-outlined">add</span>Nuevo tipo</button>}
        {tab === 'metodos_pago'&& <button className="pm-btn pm-btn--primary" onClick={() => setModal({ tipo: 'metodo',  item: null })}><span className="material-symbols-outlined">add</span>Nuevo método</button>}
        {tab === 'unidades'    && <button className="pm-btn pm-btn--primary" onClick={() => setModal({ tipo: 'unidad',  item: null })}><span className="material-symbols-outlined">add</span>Nueva unidad</button>}
      </div>

      {/* Tabs */}
      <div className="pm-tabs">
        {([
          { key: 'config',       icon: 'settings',   label: 'General' },
          { key: 'tipos_id',     icon: 'badge',       label: 'Tipos de ID' },
          { key: 'metodos_pago', icon: 'payments',    label: 'Métodos de pago' },
          { key: 'unidades',     icon: 'straighten',  label: 'Unidades de medida' },
        ] as const).map(t => (
          <button key={t.key} className={`pm-tab ${tab === t.key ? 'pm-tab--active' : ''}`} onClick={() => setTab(t.key)}>
            <span className="material-symbols-outlined">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Configuración general ── */}
      {tab === 'config' && (
        <div className="pm-section">
          {loading ? (
            <div className="pm-state"><div className="pm-spinner"/>Cargando…</div>
          ) : (<>

            {/* Moneda */}
            <div className="pm-config-bloque">
              <p className="pm-bloque-titulo">
                <span className="material-symbols-outlined">payments</span>
                Moneda de la empresa
              </p>
              <p className="pm-bloque-desc">Define la moneda principal para facturas, cotizaciones y reportes financieros.</p>
              <select className="pm-input pm-input--md" value={cfgForm.moneda_id}
                onChange={e => setCfgForm({ ...cfgForm, moneda_id: e.target.value })}>
                <option value="">— Selecciona una moneda —</option>
                {config?.monedas_disponibles.map(m => (
                  <option key={m.id} value={String(m.id)}>{m.simbolo} — {m.nombre} ({m.codigo_iso})</option>
                ))}
              </select>
            </div>

            {/* Facturación */}
            <div className="pm-config-bloque">
              <p className="pm-bloque-titulo">
                <span className="material-symbols-outlined">receipt_long</span>
                Resolución de facturación
              </p>
              <p className="pm-bloque-desc">
                Configura el prefijo y número inicial para la numeración de tus facturas.
                El número actual es <strong>{config?.facturacion_numero_actual ?? 1}</strong>.
              </p>
              <div className="pm-config-row">
                <div>
                  <label className="pm-label">Prefijo</label>
                  <input className="pm-input" value={cfgForm.facturacion_prefijo}
                    onChange={e => setCfgForm({ ...cfgForm, facturacion_prefijo: e.target.value })}
                    placeholder="Ej: FE, FAC" maxLength={10} />
                </div>
                <div>
                  <label className="pm-label">Número de inicio</label>
                  <input className="pm-input" type="number" min={1}
                    value={cfgForm.facturacion_numero_inicio}
                    onChange={e => setCfgForm({ ...cfgForm, facturacion_numero_inicio: e.target.value })}
                    placeholder="1" />
                </div>
              </div>
              <p className="pm-bloque-warning">⚠️ Cambiar el número de inicio reiniciará el contador de facturas.</p>
            </div>

            {/* ── Stock mínimo global — NUEVO ── */}
            <div className="pm-config-bloque">
              <p className="pm-bloque-titulo">
                <span className="material-symbols-outlined">inventory</span>
                Alerta de stock bajo
              </p>
              <p className="pm-bloque-desc">
                Cantidad mínima de stock general. Cuando un producto baje de este valor se marcará
                con alerta de stock bajo. Puedes personalizar este valor por producto
                desde el detalle del producto en Inventario.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ maxWidth: '180px' }}>
                  <label className="pm-label">Cantidad mínima global</label>
                  <input
                    className="pm-input"
                    type="number"
                    min={0}
                    value={cfgForm.stock_minimo_global}
                    onChange={e => setCfgForm({ ...cfgForm, stock_minimo_global: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div className="pm-stock-ejemplo">
                  <span className="material-symbols-outlined" style={{ color: '#eab308', fontSize: '1rem' }}>warning</span>
                  <span>
                    Los productos con stock ≤ <strong>{cfgForm.stock_minimo_global || '0'}</strong> unidades
                    mostrarán la alerta de stock bajo, salvo que tengan su propio valor configurado.
                  </span>
                </div>
              </div>
            </div>

            <div className="pm-config-footer">
              <button className="pm-btn pm-btn--primary" onClick={handleGuardarConfig} disabled={savingCfg}>
                {savingCfg ? 'Guardando…' : 'Guardar configuración'}
              </button>
            </div>
          </>)}
        </div>
      )}

      {/* ── Tab Tipos de identificación ── */}
      {tab === 'tipos_id' && (
        <div className="pm-section">
          <p className="pm-section-desc">Tipos de documento disponibles para los usuarios de esta empresa.</p>
          {loading ? (
            <div className="pm-state"><div className="pm-spinner"/>Cargando…</div>
          ) : tiposId.length === 0 ? (
            <div className="pm-state">
              <span className="material-symbols-outlined">badge</span>
              <p>No hay tipos de identificación. Crea el primero.</p>
            </div>
          ) : (
            <div className="pm-list">
              {tiposId.map(t => (
                <div key={t.id} className={`pm-card ${!isActivo(t.esta_activo) ? 'pm-card--inactivo' : ''}`}>
                  <div className="pm-card__badge">{t.abreviatura}</div>
                  <div className="pm-card__info">
                    <p className="pm-card__name">{t.nombre}</p>
                    <span className={`pm-chip ${isActivo(t.esta_activo) ? 'pm-chip--on' : 'pm-chip--off'}`}>
                      {isActivo(t.esta_activo) ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="pm-card__actions">
                    <button className="pm-icon-btn pm-icon-btn--edit" title="Editar" onClick={() => setModal({ tipo: 'tipo_id', item: t })}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className={`pm-icon-btn ${isActivo(t.esta_activo) ? 'pm-icon-btn--off' : 'pm-icon-btn--on'}`}
                      onClick={() => handleToggleTipo(t.id)}>
                      <span className="material-symbols-outlined">{isActivo(t.esta_activo) ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Métodos de pago ── */}
      {tab === 'metodos_pago' && (
        <div className="pm-section">
          <p className="pm-section-desc">Métodos de pago que podrás usar en facturas y registros de pago.</p>
          {loading ? (
            <div className="pm-state"><div className="pm-spinner"/>Cargando…</div>
          ) : metodos.length === 0 ? (
            <div className="pm-state">
              <span className="material-symbols-outlined">payments</span>
              <p>No hay métodos de pago. Crea el primero.</p>
            </div>
          ) : (
            <div className="pm-list">
              {metodos.map(m => (
                <div key={m.id} className={`pm-card ${!isActivo(m.esta_activo) ? 'pm-card--inactivo' : ''}`}>
                  <div className="pm-card__badge pm-card__badge--pay">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="pm-card__info">
                    <p className="pm-card__name">{m.nombre}</p>
                    {m.descripcion && <p className="pm-card__desc">{m.descripcion}</p>}
                    <span className={`pm-chip ${isActivo(m.esta_activo) ? 'pm-chip--on' : 'pm-chip--off'}`}>
                      {isActivo(m.esta_activo) ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="pm-card__actions">
                    <button className="pm-icon-btn pm-icon-btn--edit" title="Editar" onClick={() => setModal({ tipo: 'metodo', item: m })}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className={`pm-icon-btn ${isActivo(m.esta_activo) ? 'pm-icon-btn--off' : 'pm-icon-btn--on'}`}
                      onClick={() => handleToggleMetodo(m.id)}>
                      <span className="material-symbols-outlined">{isActivo(m.esta_activo) ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                    <button className="pm-icon-btn pm-icon-btn--delete" title="Eliminar" onClick={() => handleEliminarMetodo(m.id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Unidades de medida ── */}
      {tab === 'unidades' && (
        <div className="pm-section">
          <p className="pm-section-desc">Unidades disponibles para asignar a productos del inventario.</p>
          {loading ? (
            <div className="pm-state"><div className="pm-spinner"/>Cargando…</div>
          ) : unidades.length === 0 ? (
            <div className="pm-state">
              <span className="material-symbols-outlined">straighten</span>
              <p>No hay unidades de medida. Crea la primera.</p>
            </div>
          ) : (
            <div className="pm-list">
              {unidades.map(u => (
                <div key={u.id} className={`pm-card ${!isActivo(u.esta_activa) ? 'pm-card--inactivo' : ''}`}>
                  <div className="pm-card__badge" style={{ minWidth: 56, fontSize: '.72rem' }}>{u.abreviatura}</div>
                  <div className="pm-card__info">
                    <p className="pm-card__name">{u.nombre}</p>
                    <span className={`pm-chip ${isActivo(u.esta_activa) ? 'pm-chip--on' : 'pm-chip--off'}`}>
                      {isActivo(u.esta_activa) ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="pm-card__actions">
                    <button className="pm-icon-btn pm-icon-btn--edit" title="Editar" onClick={() => setModal({ tipo: 'unidad', item: u })}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className={`pm-icon-btn ${isActivo(u.esta_activa) ? 'pm-icon-btn--off' : 'pm-icon-btn--on'}`}
                      onClick={() => handleToggleUnidad(u.id)}>
                      <span className="material-symbols-outlined">{isActivo(u.esta_activa) ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modales ── */}
      {modal?.tipo === 'tipo_id' && (
        <TipoIdModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast(modal.item ? 'Tipo actualizado.' : 'Tipo creado.'); cargarTipos() }}
        />
      )}
      {modal?.tipo === 'metodo' && (
        <ItemModal
          titulo={modal.item ? 'Editar método de pago' : 'Nuevo método de pago'}
          item={modal.item} conDescripcion
          onClose={() => setModal(null)}
          onSaved={async (nombre, descripcion) => {
            if (modal.item) {
              await apiFetch(`parametrizacion/metodos-pago/${modal.item.id}`, { method: 'PUT', body: JSON.stringify({ nombre, descripcion }) })
            } else {
              await apiFetch('parametrizacion/metodos-pago', { method: 'POST', body: JSON.stringify({ nombre, descripcion }) })
            }
            setModal(null)
            showToast(modal.item ? 'Método actualizado.' : 'Método creado.')
            cargarMetodos()
          }}
        />
      )}
      {modal?.tipo === 'unidad' && (
        <UnidadModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast(modal.item ? 'Unidad actualizada.' : 'Unidad creada.'); cargarUnidades() }}
        />
      )}
    </div>
  )
}

const CSS = `
.pm-wrap { padding:0; max-width:820px; }
.pm-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; }
.pm-title    { font-size:1.4rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; letter-spacing:-.03em; }
.pm-subtitle { font-size:.85rem; color:#64748b; margin:0; }

.pm-tabs { display:flex; gap:.4rem; margin-bottom:1.25rem; border-bottom:1px solid #f1f5f9; padding-bottom:.5rem; flex-wrap:wrap; }
.pm-tab  { display:flex; align-items:center; gap:.4rem; padding:.45rem .9rem; border:none; border-radius:8px; background:transparent; color:#94a3b8; font-size:.85rem; font-weight:500; cursor:pointer; transition:background .15s,color .15s; font-family:inherit; }
.pm-tab .material-symbols-outlined { font-size:1.05rem; }
.pm-tab:hover { background:#f1f5f9; color:#334155; }
.pm-tab--active { background:#f1f5f9; color:#0f172a; font-weight:600; }

.pm-section { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.pm-section-desc { font-size:.85rem; color:#64748b; margin-bottom:1.25rem; line-height:1.6; }

.pm-config-bloque { padding:1.25rem 0; border-bottom:1px solid #f1f5f9; }
.pm-config-bloque:last-of-type { border-bottom:none; }
.pm-bloque-titulo { display:flex; align-items:center; gap:.4rem; font-size:.95rem; font-weight:700; color:#0f172a; margin:0 0 .3rem; }
.pm-bloque-titulo .material-symbols-outlined { font-size:1.1rem; color:var(--c-primary,#E3342F); }
.pm-bloque-desc { font-size:.83rem; color:#64748b; margin:0 0 .875rem; line-height:1.5; }
.pm-bloque-warning { font-size:.78rem; color:#d97706; margin-top:.5rem; }
.pm-config-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
@media(max-width:480px){ .pm-config-row { grid-template-columns:1fr; } }
.pm-config-footer { display:flex; justify-content:flex-end; margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid #f1f5f9; }
.pm-input--md { max-width:360px; }

.pm-stock-ejemplo { display:flex; align-items:flex-start; gap:.4rem; font-size:.82rem; color:#64748b; background:#fef9c3; border:1px solid #fde68a; border-radius:9px; padding:.6rem .875rem; flex:1; min-width:200px; line-height:1.5; }

.pm-list { display:flex; flex-direction:column; gap:.5rem; }
.pm-card { display:flex; align-items:center; gap:.875rem; padding:.875rem 1rem; background:#f8fafc; border:1px solid #f1f5f9; border-radius:11px; transition:box-shadow .15s,border-color .15s; }
.pm-card:hover { border-color:#e2e8f0; box-shadow:0 3px 10px rgba(0,0,0,.06); }
.pm-card--inactivo { opacity:.55; }
.pm-card__badge { min-width:48px; height:36px; background:var(--c-primary,#E3342F); border-radius:8px; display:grid; place-items:center; font-weight:800; font-size:.78rem; color:#fff; letter-spacing:.04em; flex-shrink:0; }
.pm-card__badge--pay { background:var(--c-secondary,#38C172); }
.pm-card__badge--pay .material-symbols-outlined { font-size:1.1rem; }
.pm-card__info  { flex:1; display:flex; align-items:center; gap:.6rem; flex-wrap:wrap; min-width:0; }
.pm-card__name  { font-weight:600; font-size:.9rem; color:#0f172a; margin:0; }
.pm-card__desc  { font-size:.78rem; color:#94a3b8; margin:0; width:100%; }
.pm-card__actions { display:flex; gap:.35rem; flex-shrink:0; }

.pm-chip { padding:.15rem .55rem; border-radius:99px; font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
.pm-chip--on  { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
.pm-chip--off { background:#f8fafc; color:#94a3b8; border:1px solid #e2e8f0; }

.pm-icon-btn { width:30px; height:30px; border:none; border-radius:7px; display:grid; place-items:center; cursor:pointer; transition:background .15s; }
.pm-icon-btn .material-symbols-outlined { font-size:1rem; }
.pm-icon-btn--edit   { background:#eff6ff; color:#3b82f6; }
.pm-icon-btn--edit:hover   { background:#dbeafe; }
.pm-icon-btn--off    { background:#fef2f2; color:#ef4444; }
.pm-icon-btn--off:hover    { background:#fee2e2; }
.pm-icon-btn--on     { background:#f0fdf4; color:#22c55e; }
.pm-icon-btn--on:hover     { background:#dcfce7; }
.pm-icon-btn--delete { background:#fef2f2; color:#ef4444; }
.pm-icon-btn--delete:hover { background:#fee2e2; }

.pm-btn { display:inline-flex; align-items:center; gap:.35rem; padding:.48rem 1rem; border-radius:8px; border:none; font-size:.83rem; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s,background .15s; }
.pm-btn .material-symbols-outlined { font-size:1rem; }
.pm-btn--primary { background:var(--c-primary,#E3342F); color:#fff; }
.pm-btn--primary:hover { opacity:.88; }
.pm-btn--ghost { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
.pm-btn--ghost:hover { background:#f1f5f9; }
.pm-btn:disabled { opacity:.5; cursor:not-allowed; }

.pm-label { display:block; font-size:.73rem; font-weight:600; color:#64748b; margin:.75rem 0 .3rem; text-transform:uppercase; letter-spacing:.04em; }
.pm-input { width:100%; box-sizing:border-box; padding:.6rem .875rem; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:9px; color:#0f172a; font-size:.88rem; font-family:inherit; outline:none; transition:border-color .15s; }
.pm-input:focus { border-color:var(--c-primary,#E3342F); background:#fff; }
.pm-error { color:#ef4444; font-size:.82rem; margin-top:.4rem; }

.pm-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(4px); display:grid; place-items:center; z-index:1000; animation:pmFade .15s ease; }
.pm-modal { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:1.75rem; width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,.15); animation:pmSlide .2s ease; }
@keyframes pmFade  { from{opacity:0} to{opacity:1} }
@keyframes pmSlide { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:none} }
.pm-modal__title  { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0 0 .1rem; }
.pm-modal__footer { display:flex; justify-content:flex-end; gap:.6rem; margin-top:1.25rem; }

.pm-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:3rem; color:#94a3b8; font-size:.9rem; }
.pm-state .material-symbols-outlined { font-size:2.5rem; opacity:.35; }
.pm-spinner { width:24px; height:24px; border:3px solid #f1f5f9; border-top-color:var(--c-primary,#E3342F); border-radius:50%; animation:pmSpin .7s linear infinite; }
@keyframes pmSpin { to{transform:rotate(360deg)} }

.pm-toast { position:fixed; bottom:1.5rem; right:1.5rem; background:#1e293b; color:#f1f5f9; padding:.7rem 1.2rem; border-radius:10px; font-size:.85rem; border-left:3px solid var(--c-secondary,#38C172); box-shadow:0 8px 24px rgba(0,0,0,.2); z-index:2000; animation:pmFade .2s ease; }
.pm-toast--err { border-left-color:#ef4444; }
`