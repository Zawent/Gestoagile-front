// src/dashboard/modules/inventario/InventarioPanel.tsx
import { useState } from 'react'
import { apiFetch } from '../../../api/client'
import { usePermisos } from '../../../hooks/usePermisos'

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export interface Categoria {
  id:                 string
  nombre:             string
  descripcion:        string | null
  categoria_padre_id: string | null
  esta_activa:        boolean
  total_productos:    number
}

export interface Bodega {
  id:           string
  nombre:       string
  descripcion:  string | null
  es_principal: boolean
  esta_activa:  boolean
  total_items:  number
}

export interface UnidadMedida {
  id:          string
  nombre:      string
  abreviatura: string
}

export interface StockBodega {
  id:           string
  nombre:       string
  es_principal: boolean
  pivot: { stock_actual: number }
}

export interface Producto {
  id:                  string
  nombre:              string
  sku:                 string | null
  descripcion:         string | null
  precio_venta:        number
  costo_compra:        number
  stock_minimo:        number        // mínimo individual (0 = usa el global)
  stock_minimo_global: number        // mínimo global de la empresa
  esta_activo:         boolean
  stock_total:         number
  stock_bajo:          boolean
  puede_eliminar?:     boolean
  categoria?:          { id: string; nombre: string } | null
  unidad_medida?:      { id: string; nombre: string; abreviatura: string } | null
  bodegas:             StockBodega[]
}

export interface InventarioData {
  categorias: Categoria[]
  bodegas:    Bodega[]
  unidades:   UnidadMedida[]
  productos:  Producto[]
}

interface Movimiento {
  id:              string
  tipo:            'entrada' | 'salida' | 'transferencia'
  cantidad:        number
  nota:            string | null
  created_at:      string
  bodega_origen?:  { id: string; nombre: string } | null
  bodega_destino?: { id: string; nombre: string } | null
  user?:           { id: number; name: string; last_name: string } | null
}

interface Props {
  tab:        'productos' | 'categorias' | 'bodegas'
  datos:      InventarioData | null
  loading:    boolean
  onMutacion: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(n)

const fmtMoneda = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const tipoLabel: Record<string, { label: string; color: string; bg: string }> = {
  entrada:       { label: 'Entrada',       color: '#166534', bg: '#f0fdf4' },
  salida:        { label: 'Salida',        color: '#991b1b', bg: '#fef2f2' },
  transferencia: { label: 'Transferencia', color: '#1e40af', bg: '#eff6ff' },
}

// ─── Select de categorías agrupado ────────────────────────────────────────────

function CategoriaSelect({ categorias, value, onChange }: {
  categorias: Categoria[]; value: string; onChange: (v: string) => void
}) {
  const padres = categorias.filter(c => !c.categoria_padre_id && c.esta_activa)
  return (
    <select className="inv-input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Sin categoría</option>
      {padres.map(padre => {
        const hijos = categorias.filter(c => c.categoria_padre_id === padre.id && c.esta_activa)
        return (
          <optgroup key={padre.id} label={padre.nombre}>
            <option value={String(padre.id)}>{padre.nombre}</option>
            {hijos.map(hijo => (
              <option key={hijo.id} value={String(hijo.id)}>{'  ↳ '}{hijo.nombre}</option>
            ))}
          </optgroup>
        )
      })}
    </select>
  )
}

// ─── Modal: Categoría ─────────────────────────────────────────────────────────

function CategoriaModal({ item, padres, onClose, onSaved }: {
  item: Categoria | null; padres: Categoria[]
  onClose: () => void; onSaved: (msg: string) => void
}) {
  const [nombre,      setNombre]      = useState(item?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '')
  const [padreId,     setPadreId]     = useState(item?.categoria_padre_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setLoading(true)
    try {
      const body = { nombre, descripcion: descripcion.trim() || null, categoria_padre_id: padreId || null }
      if (item) {
        await apiFetch(`inventario/categorias/${item.id}`, { method: 'PUT', body: JSON.stringify(body) })
        onSaved('Categoría actualizada.')
      } else {
        await apiFetch('inventario/categorias', { method: 'POST', body: JSON.stringify(body) })
        onSaved('Categoría creada.')
      }
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={e => e.stopPropagation()}>
        <h3 className="inv-modal__title">{item ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <label className="inv-label">Nombre</label>
        <input className="inv-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Bebidas" autoFocus />
        <label className="inv-label">Descripción (opcional)</label>
        <input className="inv-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción breve" />
        <label className="inv-label">Categoría padre (opcional)</label>
        <select className="inv-input" value={padreId} onChange={e => setPadreId(e.target.value)}>
          <option value="">— Es una categoría principal —</option>
          {padres.filter(p => p.id !== item?.id).map(p => (
            <option key={p.id} value={String(p.id)}>{p.nombre}</option>
          ))}
        </select>
        <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.3rem' }}>Solo se permite un nivel de anidamiento.</p>
        {error && <p className="inv-error">{error}</p>}
        <div className="inv-modal__footer">
          <button className="inv-btn inv-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="inv-btn inv-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Bodega ────────────────────────────────────────────────────────────

function BodegaModal({ item, onClose, onSaved }: {
  item: Bodega | null; onClose: () => void; onSaved: (msg: string) => void
}) {
  const [nombre,      setNombre]      = useState(item?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setLoading(true)
    try {
      if (item) {
        await apiFetch(`inventario/bodegas/${item.id}`, { method: 'PUT', body: JSON.stringify({ nombre, descripcion }) })
        onSaved('Bodega actualizada.')
      } else {
        await apiFetch('inventario/bodegas', { method: 'POST', body: JSON.stringify({ nombre, descripcion }) })
        onSaved('Bodega creada.')
      }
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={e => e.stopPropagation()}>
        <h3 className="inv-modal__title">{item ? 'Editar bodega' : 'Nueva bodega'}</h3>
        <label className="inv-label">Nombre</label>
        <input className="inv-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Bodega Norte" autoFocus />
        <label className="inv-label">Descripción (opcional)</label>
        <input className="inv-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ubicación o descripción" />
        {error && <p className="inv-error">{error}</p>}
        <div className="inv-modal__footer">
          <button className="inv-btn inv-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="inv-btn inv-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Producto ──────────────────────────────────────────────────────────

function ProductoModal({ item, categorias, unidades, onClose, onSaved }: {
  item: Producto | null; categorias: Categoria[]; unidades: UnidadMedida[]
  onClose: () => void; onSaved: (msg: string) => void
}) {
  const [nombre,      setNombre]      = useState(item?.nombre ?? '')
  const [sku,         setSku]         = useState(item?.sku ?? '')
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '')
  const [categoriaId, setCategoriaId] = useState(item?.categoria?.id ?? '')
  const [unidadId,    setUnidadId]    = useState(item?.unidad_medida?.id ?? '')
  const [precio,      setPrecio]      = useState(String(item?.precio_venta ?? ''))
  const [costo,       setCosto]       = useState(String(item?.costo_compra ?? ''))
  const [stockMinimo, setStockMinimo] = useState(String(item?.stock_minimo ?? '0'))
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Para mostrar el global como referencia en el hint
  const globalRef = item?.stock_minimo_global ?? 0

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!precio || isNaN(Number(precio))) { setError('El precio de venta es obligatorio.'); return }
    setLoading(true)
    try {
      const body = {
        nombre, descripcion: descripcion.trim() || null,
        sku: sku.trim() || null,
        categoria_id:     categoriaId || null,
        unidad_medida_id: unidadId    || null,
        precio_venta:  Number(precio),
        costo_compra:  Number(costo) || 0,
        stock_minimo:  Number(stockMinimo) || 0,
      }
      if (item) {
        await apiFetch(`inventario/productos/${item.id}`, { method: 'PUT', body: JSON.stringify(body) })
        onSaved('Producto actualizado.')
      } else {
        await apiFetch('inventario/productos', { method: 'POST', body: JSON.stringify(body) })
        onSaved('Producto creado.')
      }
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal inv-modal--lg" onClick={e => e.stopPropagation()}>
        <h3 className="inv-modal__title">{item ? 'Editar producto' : 'Nuevo producto'}</h3>

        <div className="inv-form-grid">
          <div className="inv-form-col">
            <label className="inv-label">Nombre *</label>
            <input className="inv-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del producto" autoFocus />
          </div>
          <div className="inv-form-col">
            <label className="inv-label">SKU / Código</label>
            <input className="inv-input" value={sku} onChange={e => setSku(e.target.value)} placeholder="Ej: COC-500ML" />
          </div>
          <div className="inv-form-col">
            <label className="inv-label">Precio de venta *</label>
            <input className="inv-input" type="number" min="0" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0" />
          </div>
          <div className="inv-form-col">
            <label className="inv-label">Costo de compra</label>
            <input className="inv-input" type="number" min="0" value={costo} onChange={e => setCosto(e.target.value)} placeholder="0" />
          </div>
          <div className="inv-form-col">
            <label className="inv-label">Categoría</label>
            <CategoriaSelect categorias={categorias} value={categoriaId} onChange={setCategoriaId} />
          </div>
          <div className="inv-form-col">
            <label className="inv-label">Unidad de medida</label>
            <select className="inv-input" value={unidadId} onChange={e => setUnidadId(e.target.value)}>
              <option value="">Sin unidad</option>
              {unidades.map(u => (
                <option key={u.id} value={String(u.id)}>{u.nombre} ({u.abreviatura})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock mínimo individual */}
        <div className="inv-stock-minimo-box">
          <div style={{ minWidth: '160px' }}>
            <label className="inv-label" style={{ marginTop: 0 }}>Stock mínimo individual</label>
            <input
              className="inv-input"
              type="number" min="0" step="1"
              value={stockMinimo}
              onChange={e => setStockMinimo(e.target.value)}
              placeholder="0"
            />
          </div>
          <p className="inv-stock-minimo-hint">
            {Number(stockMinimo) > 0
              ? <>Alerta cuando stock ≤ <strong>{stockMinimo}</strong> <span style={{ color: '#1e40af' }}>(individual — anula el global)</span></>
              : <>Usará el valor global configurado en Parametrización{globalRef > 0 ? <> (<strong>{globalRef}</strong>)</> : ''}. Pon 0 para usar el global.</>
            }
          </p>
        </div>

        <label className="inv-label">Descripción</label>
        <textarea className="inv-input inv-textarea" value={descripcion}
          onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del producto (opcional)" rows={2} />

        {error && <p className="inv-error">{error}</p>}
        <div className="inv-modal__footer">
          <button className="inv-btn inv-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="inv-btn inv-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Ajuste de stock ───────────────────────────────────────────────────

function AjusteModal({ producto, bodegas, onClose, onSaved }: {
  producto: Producto; bodegas: Bodega[]; onClose: () => void; onSaved: (msg: string) => void
}) {
  const [tipo,      setTipo]      = useState<'entrada' | 'salida' | 'transferencia'>('entrada')
  const [cantidad,  setCantidad]  = useState('')
  const [nota,      setNota]      = useState('')
  const [origenId,  setOrigenId]  = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const bodegasActivas = bodegas.filter(b => b.esta_activa)

  const handleSubmit = async () => {
    setError('')
    if (!cantidad || isNaN(Number(cantidad)) || Number(cantidad) <= 0) { setError('La cantidad debe ser mayor a 0.'); return }
    if (tipo === 'entrada' && !destinoId) { setError('Selecciona la bodega de destino.'); return }
    if (tipo === 'salida'  && !origenId)  { setError('Selecciona la bodega de origen.'); return }
    if (tipo === 'transferencia' && (!origenId || !destinoId)) { setError('Selecciona bodega de origen y destino.'); return }
    if (tipo === 'transferencia' && origenId === destinoId) { setError('Las bodegas no pueden ser la misma.'); return }
    setLoading(true)
    try {
      await apiFetch('inventario/ajustes', {
        method: 'POST',
        body: JSON.stringify({
          producto_id: producto.id, tipo, cantidad: Number(cantidad),
          nota: nota.trim() || null,
          bodega_origen_id:  origenId  || null,
          bodega_destino_id: destinoId || null,
        }),
      })
      onSaved('Movimiento registrado.')
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="inv-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="inv-modal" onClick={e => e.stopPropagation()}>
        <h3 className="inv-modal__title">Registrar movimiento de stock</h3>
        <p style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '.75rem' }}>{producto.nombre}</p>
        <label className="inv-label">Tipo de movimiento</label>
        <div className="inv-tipo-btns">
          {(['entrada', 'salida', 'transferencia'] as const).map(t => (
            <button key={t} className={`inv-tipo-btn ${tipo === t ? 'inv-tipo-btn--active' : ''}`} onClick={() => setTipo(t)}>
              <span className="material-symbols-outlined">
                {t === 'entrada' ? 'add_circle' : t === 'salida' ? 'remove_circle' : 'swap_horiz'}
              </span>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {(tipo === 'salida' || tipo === 'transferencia') && (<>
          <label className="inv-label">Bodega de origen</label>
          <select className="inv-input" value={origenId} onChange={e => setOrigenId(e.target.value)}>
            <option value="">Seleccionar bodega</option>
            {bodegasActivas.map(b => {
              const s = producto.bodegas.find(pb => pb.id === b.id)?.pivot.stock_actual ?? 0
              return <option key={b.id} value={String(b.id)}>{b.nombre} (stock: {fmt(s)})</option>
            })}
          </select>
        </>)}
        {(tipo === 'entrada' || tipo === 'transferencia') && (<>
          <label className="inv-label">Bodega de destino</label>
          <select className="inv-input" value={destinoId} onChange={e => setDestinoId(e.target.value)}>
            <option value="">Seleccionar bodega</option>
            {bodegasActivas.map(b => <option key={b.id} value={String(b.id)}>{b.nombre}</option>)}
          </select>
        </>)}
        <label className="inv-label">Cantidad</label>
        <input className="inv-input" type="number" min="0.001" step="0.001" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0" />
        <label className="inv-label">Nota / Razón (opcional)</label>
        <input className="inv-input" value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: Corrección de conteo físico" />
        {error && <p className="inv-error">{error}</p>}
        <div className="inv-modal__footer">
          <button className="inv-btn inv-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="inv-btn inv-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registrando…' : 'Registrar movimiento'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Detalle de Producto ───────────────────────────────────────────────

function DetalleModal({ productoId, bodegas, onClose, onSaved, onEditar, puede }: {
  productoId: string; bodegas: Bodega[]
  onClose: () => void; onSaved: (msg: string) => void
  onEditar: (p: Producto) => void; puede: (k: string) => boolean
}) {
  const [data,       setData]       = useState<{ producto: Producto; movimientos: Movimiento[] } | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [ajusteOpen, setAjusteOpen] = useState(false)
  const [error,      setError]      = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ producto: Producto; movimientos: Movimiento[] }>(`inventario/productos/${productoId}`)
      setData(res)
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  useState(() => { cargar() })

  const handleEliminar = async () => {
    if (!data?.producto.puede_eliminar) return
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    try {
      await apiFetch(`inventario/productos/${productoId}`, { method: 'DELETE' })
      onSaved('Producto eliminado.')
      onClose()
    } catch (e) { setError((e as Error).message) }
  }

  const handleToggle = async () => {
    if (!data) return
    try {
      const res = await apiFetch<{ message: string }>(`inventario/productos/${productoId}/toggle`, { method: 'PUT' })
      onSaved(res.message); cargar()
    } catch (e) { setError((e as Error).message) }
  }

  // El mínimo efectivo: individual si > 0, si no el global
  const minimoEfectivo = data
    ? (data.producto.stock_minimo > 0 ? data.producto.stock_minimo : (data.producto.stock_minimo_global ?? 0))
    : 0

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal inv-modal--xl" onClick={e => e.stopPropagation()}>
        {loading || !data ? (
          <div className="inv-state"><div className="inv-spinner" />Cargando…</div>
        ) : (<>
          <div className="inv-detalle-header">
            <div>
              <h3 className="inv-modal__title">{data.producto.nombre}</h3>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.3rem', flexWrap: 'wrap' }}>
                {data.producto.sku && <span className="inv-chip inv-chip--sku">SKU: {data.producto.sku}</span>}
                {data.producto.categoria && <span className="inv-chip inv-chip--cat">{data.producto.categoria.nombre}</span>}
                <span className={`inv-chip ${data.producto.esta_activo ? 'inv-chip--on' : 'inv-chip--off'}`}>
                  {data.producto.esta_activo ? 'Activo' : 'Inactivo'}
                </span>
                {data.producto.stock_bajo && <span className="inv-chip inv-chip--warn">⚠ Stock bajo</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
              {puede('inventario.productos.editar') && (
                <button className="inv-btn inv-btn--ghost inv-btn--sm" onClick={() => { onEditar(data.producto); onClose() }}>
                  <span className="material-symbols-outlined">edit</span>Editar
                </button>
              )}
              {puede('inventario.productos.editar') && (
                <button className="inv-btn inv-btn--ghost inv-btn--sm" onClick={handleToggle}>
                  <span className="material-symbols-outlined">{data.producto.esta_activo ? 'pause' : 'play_arrow'}</span>
                  {data.producto.esta_activo ? 'Desactivar' : 'Activar'}
                </button>
              )}
              {puede('inventario.productos.eliminar') && data.producto.puede_eliminar && (
                <button className="inv-btn inv-btn--danger inv-btn--sm" onClick={handleEliminar}>
                  <span className="material-symbols-outlined">delete</span>Eliminar
                </button>
              )}
            </div>
          </div>

          {/* 4 cards: precio venta, costo, stock total, stock mínimo efectivo */}
          <div className="inv-precios-row">
            <div className="inv-precio-card">
              <span className="inv-precio-label">Precio de venta</span>
              <span className="inv-precio-val">{fmtMoneda(data.producto.precio_venta)}</span>
            </div>
            <div className="inv-precio-card">
              <span className="inv-precio-label">Costo de compra</span>
              <span className="inv-precio-val inv-precio-val--dim">{fmtMoneda(data.producto.costo_compra)}</span>
            </div>
            <div className="inv-precio-card">
              <span className="inv-precio-label">Stock total</span>
              <span className={`inv-precio-val ${data.producto.stock_bajo ? 'inv-precio-val--warn' : ''}`}>
                {fmt(data.producto.stock_total)} {data.producto.unidad_medida?.abreviatura ?? 'und'}
              </span>
            </div>
            <div className="inv-precio-card">
              <span className="inv-precio-label">Stock mínimo</span>
              <span className="inv-precio-val" style={{ fontSize: '.9rem' }}>
                {fmt(minimoEfectivo)}{' '}
                <span style={{ fontSize: '.6rem', fontWeight: 600, color: data.producto.stock_minimo > 0 ? '#1e40af' : '#94a3b8' }}>
                  {data.producto.stock_minimo > 0 ? 'individual' : 'global'}
                </span>
              </span>
            </div>
          </div>

          <h4 className="inv-section-title">Stock por bodega</h4>
          <div className="inv-bodegas-list">
            {data.producto.bodegas.map(b => {
              const bajo = minimoEfectivo > 0 && b.pivot.stock_actual <= minimoEfectivo
              return (
                <div key={b.id} className={`inv-bodega-row ${bajo ? 'inv-bodega-row--bajo' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                      {b.es_principal ? 'storefront' : 'warehouse'}
                    </span>
                    <span className="inv-bodega-nombre">{b.nombre}</span>
                    {bajo && <span className="inv-chip inv-chip--warn" style={{ fontSize: '.65rem' }}>Bajo mínimo</span>}
                  </div>
                  <div className="inv-stock-info">
                    <span className="inv-stock-num">{fmt(b.pivot.stock_actual)}</span>
                    <span className="inv-stock-label">actual</span>
                  </div>
                </div>
              )
            })}
          </div>

          {puede('inventario.stock.ajustar') && (
            <button className="inv-btn inv-btn--primary" style={{ marginTop: '.75rem' }} onClick={() => setAjusteOpen(true)}>
              <span className="material-symbols-outlined">add_circle</span>
              Registrar movimiento de stock
            </button>
          )}

          <h4 className="inv-section-title" style={{ marginTop: '1.25rem' }}>Últimos movimientos</h4>
          {data.movimientos.length === 0 ? (
            <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>No hay movimientos registrados.</p>
          ) : (
            <div className="inv-historial">
              {data.movimientos.map(m => {
                const t = tipoLabel[m.tipo] ?? { label: m.tipo, color: '#64748b', bg: '#f8fafc' }
                return (
                  <div key={m.id} className="inv-mov-row">
                    <span className="inv-mov-badge" style={{ background: t.bg, color: t.color }}>{t.label}</span>
                    <span className="inv-mov-qty">{m.tipo === 'salida' ? '-' : '+'}{fmt(m.cantidad)}</span>
                    <span className="inv-mov-bodega">
                      {m.bodega_origen && <span>{m.bodega_origen.nombre}</span>}
                      {m.bodega_origen && m.bodega_destino && <span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>arrow_forward</span>}
                      {m.bodega_destino && <span>{m.bodega_destino.nombre}</span>}
                    </span>
                    {m.nota && <span className="inv-mov-nota">{m.nota}</span>}
                    <span className="inv-mov-user">{m.user ? `${m.user.name} ${m.user.last_name}` : '—'}</span>
                    <span className="inv-mov-fecha">
                      {new Date(m.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {error && <p className="inv-error" style={{ marginTop: '.5rem' }}>{error}</p>}

          {ajusteOpen && (
            <AjusteModal
              producto={data.producto} bodegas={bodegas}
              onClose={() => setAjusteOpen(false)}
              onSaved={msg => { setAjusteOpen(false); onSaved(msg); cargar() }}
            />
          )}
        </>)}
        <div className="inv-modal__footer" style={{ marginTop: '1.25rem' }}>
          <button className="inv-btn inv-btn--ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function InventarioPanel({ tab, datos, loading, onMutacion }: Props) {
  const { puede } = usePermisos()

  const [toast,    setToast]    = useState('')
  const [toastErr, setToastErr] = useState('')
  const [filtroQ,         setFiltroQ]         = useState('')
  const [filtroCat,       setFiltroCat]       = useState('')
  const [filtroBodega,    setFiltroBodega]    = useState('')
  const [filtroStockBajo, setFiltroStockBajo] = useState(false)
  const [catModal,    setCatModal]    = useState<Categoria | null | undefined>(undefined)
  const [bodegaModal, setBodegaModal] = useState<Bodega | null | undefined>(undefined)
  const [prodModal,   setProdModal]   = useState<Producto | null | undefined>(undefined)
  const [detalleId,   setDetalleId]   = useState<string | null>(null)

  const showToast = (msg: string, err = false) => {
    if (err) { setToastErr(msg); setTimeout(() => setToastErr(''), 3500) }
    else     { setToast(msg);    setTimeout(() => setToast(''),    3500) }
  }

  const mutacionExitosa = (msg: string) => { showToast(msg); onMutacion() }

  const categorias     = datos?.categorias ?? []
  const bodegas        = datos?.bodegas    ?? []
  const unidades       = datos?.unidades   ?? []
  const productos      = datos?.productos  ?? []
  const categoriasRaiz = categorias.filter(c => !c.categoria_padre_id && c.esta_activa)

  const productosFiltrados = productos.filter(p => {
    if (filtroQ && !p.nombre.toLowerCase().includes(filtroQ.toLowerCase()) &&
        !p.sku?.toLowerCase().includes(filtroQ.toLowerCase())) return false
    if (filtroCat && p.categoria?.id !== filtroCat) return false
    if (filtroBodega && !p.bodegas.some(b => b.id === filtroBodega)) return false
    if (filtroStockBajo && !p.stock_bajo) return false
    return true
  })

  const handleToggleCategoria = async (cat: Categoria) => {
    try {
      const res = await apiFetch<{ message: string }>(`inventario/categorias/${cat.id}/toggle`, { method: 'PUT' })
      mutacionExitosa(res.message)
    } catch (e) { showToast((e as Error).message, true) }
  }

  const handleDeleteCategoria = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    try {
      await apiFetch(`inventario/categorias/${cat.id}`, { method: 'DELETE' })
      mutacionExitosa('Categoría eliminada.')
    } catch (e) { showToast((e as Error).message, true) }
  }

  const handleToggleBodega = async (b: Bodega) => {
    try {
      const res = await apiFetch<{ message: string }>(`inventario/bodegas/${b.id}/toggle`, { method: 'PUT' })
      mutacionExitosa(res.message)
    } catch (e) { showToast((e as Error).message, true) }
  }

  const headerInfo = {
    productos:  { titulo: 'Productos',  subtitulo: 'Gestiona tu catálogo de productos' },
    categorias: { titulo: 'Categorías', subtitulo: 'Organiza tus productos por categorías' },
    bodegas:    { titulo: 'Bodegas',    subtitulo: 'Gestiona tus ubicaciones de almacenamiento' },
  }[tab]

  return (
    <div className="inv-wrap">
      <style>{CSS}</style>

      {toast    && <div className="inv-toast">{toast}</div>}
      {toastErr && <div className="inv-toast inv-toast--err">{toastErr}</div>}

      <div className="inv-header">
        <div>
          <h2 className="inv-title">{headerInfo.titulo}</h2>
          <p className="inv-subtitle">{headerInfo.subtitulo}</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {tab === 'productos'  && puede('inventario.productos.crear')       && <button className="inv-btn inv-btn--primary" onClick={() => setProdModal(null)}><span className="material-symbols-outlined">add</span>Nuevo producto</button>}
          {tab === 'categorias' && puede('inventario.categorias.gestionar')  && <button className="inv-btn inv-btn--primary" onClick={() => setCatModal(null)}><span className="material-symbols-outlined">add</span>Nueva categoría</button>}
          {tab === 'bodegas'    && puede('inventario.bodegas.gestionar')     && <button className="inv-btn inv-btn--primary" onClick={() => setBodegaModal(null)}><span className="material-symbols-outlined">add</span>Nueva bodega</button>}
        </div>
      </div>

      {loading ? (
        <div className="inv-state"><div className="inv-spinner" />Cargando inventario…</div>
      ) : (<>

        {/* ═══ PRODUCTOS ═══ */}
        {tab === 'productos' && (
          <div className="inv-section">
            <div className="inv-filtros">
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <span className="material-symbols-outlined inv-search-icon">search</span>
                <input className="inv-input inv-search" value={filtroQ} onChange={e => setFiltroQ(e.target.value)} placeholder="Buscar por nombre o SKU…" />
              </div>
              <select className="inv-input inv-select" value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categoriasRaiz.map(padre => {
                  const hijos = categorias.filter(c => c.categoria_padre_id === padre.id)
                  return (
                    <optgroup key={padre.id} label={padre.nombre}>
                      <option value={padre.id}>{padre.nombre}</option>
                      {hijos.map(h => <option key={h.id} value={h.id}>{'  ↳ '}{h.nombre}</option>)}
                    </optgroup>
                  )
                })}
              </select>
              <select className="inv-input inv-select" value={filtroBodega} onChange={e => setFiltroBodega(e.target.value)}>
                <option value="">Todas las bodegas</option>
                {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
              <button className={`inv-btn ${filtroStockBajo ? 'inv-btn--warn' : 'inv-btn--ghost'}`}
                onClick={() => setFiltroStockBajo(v => !v)}>
                <span className="material-symbols-outlined">warning</span>Stock bajo
              </button>
            </div>
            {productosFiltrados.length === 0 ? (
              <div className="inv-state">
                <span className="material-symbols-outlined">inventory_2</span>
                <p>{productos.length === 0 ? 'No hay productos. Crea el primero.' : 'Ningún producto coincide con los filtros.'}</p>
              </div>
            ) : (
              <div className="inv-prod-grid">
                {productosFiltrados.map(p => (
                  <div key={p.id}
                    className={`inv-prod-card ${!p.esta_activo ? 'inv-prod-card--inactivo' : ''} ${p.stock_bajo ? 'inv-prod-card--bajo' : ''}`}
                    onClick={() => setDetalleId(p.id)} style={{ cursor: 'pointer' }}>
                    <div className="inv-prod-card__top">
                      <div>
                        <p className="inv-prod-nombre">{p.nombre}</p>
                        {p.sku && <p className="inv-prod-sku">SKU: {p.sku}</p>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.2rem' }}>
                        {p.stock_bajo && <span className="material-symbols-outlined inv-warn-icon">warning</span>}
                        <span className={`inv-chip ${p.esta_activo ? 'inv-chip--on' : 'inv-chip--off'}`} style={{ fontSize: '.65rem' }}>
                          {p.esta_activo ? 'Activo' : 'Inactivo'}
                        </span>
                        {p.stock_minimo > 0 && (
                          <span className="inv-chip" style={{ fontSize: '.6rem', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                            mín. {fmt(p.stock_minimo)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="inv-prod-card__bottom">
                      <div>
                        <p className="inv-prod-precio">{fmtMoneda(p.precio_venta)}</p>
                        {p.categoria && <p className="inv-prod-cat">{p.categoria.nombre}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className={`inv-prod-stock ${p.stock_bajo ? 'inv-prod-stock--bajo' : ''}`}>
                          {fmt(p.stock_total)} {p.unidad_medida?.abreviatura ?? 'und'}
                        </p>
                        <p style={{ fontSize: '.7rem', color: '#94a3b8' }}>stock total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ CATEGORÍAS ═══ */}
        {tab === 'categorias' && (
          <div className="inv-section">
            {categorias.length === 0 ? (
              <div className="inv-state"><span className="material-symbols-outlined">category</span><p>No hay categorías. Crea la primera.</p></div>
            ) : (
              <div className="inv-list">
                {categoriasRaiz.map(padre => {
                  const hijos = categorias.filter(c => c.categoria_padre_id === padre.id)
                  return (
                    <div key={padre.id}>
                      <div className={`inv-row inv-row--padre ${!padre.esta_activa ? 'inv-row--inactivo' : ''}`}>
                        <div className="inv-row__icon"><span className="material-symbols-outlined">folder</span></div>
                        <div className="inv-row__info">
                          <p className="inv-row__name" style={{ fontWeight: 700 }}>{padre.nombre}</p>
                          {padre.descripcion && <p className="inv-row__sub">{padre.descripcion}</p>}
                        </div>
                        <span className="inv-row__count">{padre.total_productos + hijos.reduce((a, h) => a + h.total_productos, 0)} productos</span>
                        <span className={`inv-chip ${padre.esta_activa ? 'inv-chip--on' : 'inv-chip--off'}`}>{padre.esta_activa ? 'Activa' : 'Inactiva'}</span>
                        {puede('inventario.categorias.gestionar') && (
                          <div className="inv-row__actions">
                            <button className="inv-icon-btn inv-icon-btn--edit" onClick={() => setCatModal(padre)}><span className="material-symbols-outlined">edit</span></button>
                            <button className={`inv-icon-btn ${padre.esta_activa ? 'inv-icon-btn--off' : 'inv-icon-btn--on'}`} onClick={() => handleToggleCategoria(padre)}>
                              <span className="material-symbols-outlined">{padre.esta_activa ? 'toggle_on' : 'toggle_off'}</span>
                            </button>
                            {padre.total_productos === 0 && hijos.length === 0 && (
                              <button className="inv-icon-btn inv-icon-btn--del" onClick={() => handleDeleteCategoria(padre)}><span className="material-symbols-outlined">delete</span></button>
                            )}
                          </div>
                        )}
                      </div>
                      {hijos.map(hijo => (
                        <div key={hijo.id} className={`inv-row inv-row--hijo ${!hijo.esta_activa ? 'inv-row--inactivo' : ''}`}>
                          <div className="inv-row__indent" />
                          <div className="inv-row__icon inv-row__icon--sm"><span className="material-symbols-outlined">subdirectory_arrow_right</span></div>
                          <div className="inv-row__info">
                            <p className="inv-row__name">{hijo.nombre}</p>
                            {hijo.descripcion && <p className="inv-row__sub">{hijo.descripcion}</p>}
                          </div>
                          <span className="inv-row__count">{hijo.total_productos} productos</span>
                          <span className={`inv-chip ${hijo.esta_activa ? 'inv-chip--on' : 'inv-chip--off'}`}>{hijo.esta_activa ? 'Activa' : 'Inactiva'}</span>
                          {puede('inventario.categorias.gestionar') && (
                            <div className="inv-row__actions">
                              <button className="inv-icon-btn inv-icon-btn--edit" onClick={() => setCatModal(hijo)}><span className="material-symbols-outlined">edit</span></button>
                              <button className={`inv-icon-btn ${hijo.esta_activa ? 'inv-icon-btn--off' : 'inv-icon-btn--on'}`} onClick={() => handleToggleCategoria(hijo)}>
                                <span className="material-symbols-outlined">{hijo.esta_activa ? 'toggle_on' : 'toggle_off'}</span>
                              </button>
                              {hijo.total_productos === 0 && (
                                <button className="inv-icon-btn inv-icon-btn--del" onClick={() => handleDeleteCategoria(hijo)}><span className="material-symbols-outlined">delete</span></button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ BODEGAS ═══ */}
        {tab === 'bodegas' && (
          <div className="inv-section">
            {bodegas.length === 0 ? (
              <div className="inv-state"><span className="material-symbols-outlined">warehouse</span><p>No hay bodegas configuradas.</p></div>
            ) : (
              <div className="inv-list">
                {bodegas.map(b => (
                  <div key={b.id} className={`inv-row ${!b.esta_activa ? 'inv-row--inactivo' : ''}`}>
                    <div className="inv-row__icon"><span className="material-symbols-outlined">{b.es_principal ? 'storefront' : 'warehouse'}</span></div>
                    <div className="inv-row__info">
                      <p className="inv-row__name">
                        {b.nombre}
                        {b.es_principal && <span className="inv-chip inv-chip--cat" style={{ marginLeft: '.4rem', fontSize: '.65rem' }}>Principal</span>}
                      </p>
                      {b.descripcion && <p className="inv-row__sub">{b.descripcion}</p>}
                    </div>
                    <span className="inv-row__count">{b.total_items} ítems en stock</span>
                    <span className={`inv-chip ${b.esta_activa ? 'inv-chip--on' : 'inv-chip--off'}`}>{b.esta_activa ? 'Activa' : 'Inactiva'}</span>
                    {puede('inventario.bodegas.gestionar') && (
                      <div className="inv-row__actions">
                        <button className="inv-icon-btn inv-icon-btn--edit" onClick={() => setBodegaModal(b)}><span className="material-symbols-outlined">edit</span></button>
                        {!b.es_principal && (
                          <button className={`inv-icon-btn ${b.esta_activa ? 'inv-icon-btn--off' : 'inv-icon-btn--on'}`} onClick={() => handleToggleBodega(b)}>
                            <span className="material-symbols-outlined">{b.esta_activa ? 'toggle_on' : 'toggle_off'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>)}

      {catModal !== undefined && <CategoriaModal item={catModal} padres={categoriasRaiz} onClose={() => setCatModal(undefined)} onSaved={msg => { setCatModal(undefined); mutacionExitosa(msg) }} />}
      {bodegaModal !== undefined && <BodegaModal item={bodegaModal} onClose={() => setBodegaModal(undefined)} onSaved={msg => { setBodegaModal(undefined); mutacionExitosa(msg) }} />}
      {prodModal !== undefined && <ProductoModal item={prodModal} categorias={categorias} unidades={unidades} onClose={() => setProdModal(undefined)} onSaved={msg => { setProdModal(undefined); mutacionExitosa(msg) }} />}
      {detalleId && <DetalleModal productoId={detalleId} bodegas={bodegas} onClose={() => setDetalleId(null)} onSaved={msg => { showToast(msg); onMutacion() }} onEditar={p => { setDetalleId(null); setProdModal(p) }} puede={puede} />}
    </div>
  )
}

const CSS = `
.inv-wrap { padding:0; }
.inv-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
.inv-title    { font-size:1.4rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; letter-spacing:-.03em; }
.inv-subtitle { font-size:.85rem; color:#64748b; margin:0; }
.inv-section  { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,.04); }

.inv-filtros { display:flex; gap:.6rem; margin-bottom:1.25rem; flex-wrap:wrap; align-items:center; }
.inv-search-icon { position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1rem; pointer-events:none; }
.inv-search { padding-left:2.25rem!important; }
.inv-select { max-width:200px; }

.inv-prod-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:.875rem; }
.inv-prod-card { background:#f8fafc; border:1.5px solid #f1f5f9; border-radius:14px; padding:1rem; transition:box-shadow .15s,border-color .15s,transform .15s; }
.inv-prod-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.08); border-color:#e2e8f0; transform:translateY(-1px); }
.inv-prod-card--inactivo { opacity:.55; }
.inv-prod-card--bajo { border-color:rgba(234,179,8,.4); background:rgba(254,252,232,.5); }
.inv-prod-card__top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.75rem; }
.inv-prod-card__bottom { display:flex; justify-content:space-between; align-items:flex-end; }
.inv-prod-nombre { font-weight:700; font-size:.9rem; color:#0f172a; margin:0 0 .15rem; }
.inv-prod-sku    { font-size:.72rem; color:#94a3b8; margin:0; font-weight:600; }
.inv-prod-precio { font-weight:700; color:#0f172a; font-size:.9rem; margin:0 0 .1rem; }
.inv-prod-cat    { font-size:.72rem; color:#64748b; margin:0; }
.inv-prod-stock  { font-size:.95rem; font-weight:700; color:#0f172a; margin:0; }
.inv-prod-stock--bajo { color:#ca8a04; }
.inv-warn-icon { color:#eab308; font-size:1.1rem!important; }

.inv-list { display:flex; flex-direction:column; gap:.4rem; }
.inv-row  { display:flex; align-items:center; gap:.875rem; padding:.875rem 1rem; background:#f8fafc; border:1px solid #f1f5f9; border-radius:11px; transition:box-shadow .15s; }
.inv-row:hover { border-color:#e2e8f0; box-shadow:0 3px 10px rgba(0,0,0,.06); }
.inv-row--inactivo { opacity:.5; }
.inv-row--padre { background:#fff; border-color:#e2e8f0; }
.inv-row--hijo  { background:#f8fafc; margin-left:1.25rem; border-left:2px solid #e2e8f0; border-radius:0 11px 11px 0; }
.inv-row__indent { width:.25rem; flex-shrink:0; }
.inv-row__icon { width:36px; height:36px; background:var(--c-primary-10,rgba(0,0,0,.06)); border-radius:9px; display:grid; place-items:center; flex-shrink:0; }
.inv-row__icon .material-symbols-outlined { font-size:1.1rem; color:var(--c-primary,#64748b); }
.inv-row__icon--sm { width:28px; height:28px; background:transparent; }
.inv-row__icon--sm .material-symbols-outlined { font-size:.95rem; color:#94a3b8; }
.inv-row__info { flex:1; min-width:0; }
.inv-row__name { font-weight:600; font-size:.9rem; color:#0f172a; margin:0; }
.inv-row__sub  { font-size:.78rem; color:#94a3b8; margin:.1rem 0 0; }
.inv-row__count { font-size:.78rem; font-weight:600; color:#64748b; white-space:nowrap; }
.inv-row__actions { display:flex; gap:.35rem; flex-shrink:0; }

.inv-chip { display:inline-flex; align-items:center; padding:.15rem .55rem; border-radius:99px; font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
.inv-chip--on   { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
.inv-chip--off  { background:#f8fafc; color:#94a3b8; border:1px solid #e2e8f0; }
.inv-chip--warn { background:#fef9c3; color:#854d0e; border:1px solid #fde68a; }
.inv-chip--sku  { background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; }
.inv-chip--cat  { background:var(--c-primary-10,#f1f5f9); color:var(--c-primary,#64748b); border:1px solid var(--c-primary-20,#e2e8f0); }

.inv-btn { display:inline-flex; align-items:center; gap:.35rem; padding:.48rem 1rem; border-radius:8px; border:none; font-size:.83rem; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s,background .15s; }
.inv-btn .material-symbols-outlined { font-size:1rem; }
.inv-btn--primary { background:var(--c-primary,#3b82f6); color:#fff; }
.inv-btn--primary:hover { opacity:.88; }
.inv-btn--ghost   { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
.inv-btn--ghost:hover { background:#f1f5f9; }
.inv-btn--danger  { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
.inv-btn--danger:hover { background:#fee2e2; }
.inv-btn--warn    { background:#fef9c3; color:#854d0e; border:1px solid #fde68a; }
.inv-btn--sm      { padding:.3rem .7rem; font-size:.78rem; }
.inv-btn:disabled { opacity:.5; cursor:not-allowed; }

.inv-icon-btn { width:30px; height:30px; border:none; border-radius:7px; display:grid; place-items:center; cursor:pointer; transition:background .15s; }
.inv-icon-btn .material-symbols-outlined { font-size:1rem; }
.inv-icon-btn--edit { background:#eff6ff; color:#3b82f6; }
.inv-icon-btn--edit:hover { background:#dbeafe; }
.inv-icon-btn--off { background:#fef2f2; color:#ef4444; }
.inv-icon-btn--off:hover { background:#fee2e2; }
.inv-icon-btn--on  { background:#f0fdf4; color:#22c55e; }
.inv-icon-btn--on:hover  { background:#dcfce7; }
.inv-icon-btn--del { background:#fef2f2; color:#ef4444; }
.inv-icon-btn--del:hover { background:#fee2e2; }

.inv-label { display:block; font-size:.73rem; font-weight:600; color:#64748b; margin:.9rem 0 .3rem; text-transform:uppercase; letter-spacing:.05em; }
.inv-input { width:100%; box-sizing:border-box; padding:.6rem .875rem; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:9px; color:#0f172a; font-size:.88rem; font-family:inherit; outline:none; transition:border-color .15s; }
.inv-input:focus { border-color:var(--c-primary,#3b82f6); background:#fff; }
.inv-textarea { resize:vertical; min-height:60px; }
.inv-error { color:#ef4444; font-size:.82rem; margin-top:.4rem; }
.inv-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:.3rem 1rem; }
.inv-form-col  { display:flex; flex-direction:column; }

/* Stock mínimo individual en el modal */
.inv-stock-minimo-box { display:flex; align-items:flex-start; gap:1rem; background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px; padding:.875rem 1rem; margin-top:.75rem; flex-wrap:wrap; }
.inv-stock-minimo-hint { flex:1; font-size:.78rem; color:#64748b; line-height:1.5; padding-top:1.75rem; min-width:160px; }

.inv-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(4px); display:grid; place-items:center; z-index:1000; animation:invFade .15s ease; padding:1rem; }
.inv-modal    { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:1.75rem; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,.15); animation:invSlide .2s ease; max-height:90vh; overflow-y:auto; }
.inv-modal--lg { max-width:600px; }
.inv-modal--xl { max-width:740px; }
@keyframes invFade  { from{opacity:0} to{opacity:1} }
@keyframes invSlide { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:none} }
.inv-modal__title  { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0 0 .75rem; }
.inv-modal__footer { display:flex; justify-content:flex-end; gap:.6rem; margin-top:1.25rem; }

.inv-detalle-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
.inv-precios-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.6rem; margin-bottom:1.25rem; }
.inv-precio-card { background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px; padding:.75rem; text-align:center; }
.inv-precio-label { display:block; font-size:.7rem; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:.25rem; }
.inv-precio-val      { font-size:1rem; font-weight:700; color:#0f172a; }
.inv-precio-val--dim { color:#64748b; }
.inv-precio-val--warn{ color:#ca8a04; }
.inv-section-title { font-size:.85rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.06em; margin:.75rem 0 .5rem; }

.inv-bodegas-list { display:flex; flex-direction:column; gap:.4rem; margin-bottom:.75rem; }
.inv-bodega-row { display:flex; align-items:center; justify-content:space-between; padding:.7rem .875rem; background:#f8fafc; border:1px solid #f1f5f9; border-radius:9px; }
.inv-bodega-row--bajo { border-color:rgba(234,179,8,.4); background:rgba(254,252,232,.5); }
.inv-bodega-nombre { font-size:.88rem; font-weight:600; color:#0f172a; }
.inv-stock-info { text-align:center; }
.inv-stock-num  { display:block; font-size:1rem; font-weight:700; color:#0f172a; line-height:1.2; }
.inv-stock-num--min { color:#64748b; font-size:.9rem; }
.inv-stock-label { font-size:.65rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:.04em; }

.inv-historial { display:flex; flex-direction:column; gap:.35rem; max-height:200px; overflow-y:auto; }
.inv-historial::-webkit-scrollbar { width:3px; }
.inv-historial::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
.inv-mov-row { display:flex; align-items:center; gap:.6rem; padding:.5rem .7rem; background:#f8fafc; border-radius:8px; font-size:.8rem; flex-wrap:wrap; }
.inv-mov-badge { padding:.15rem .55rem; border-radius:99px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; flex-shrink:0; }
.inv-mov-qty   { font-weight:700; color:#0f172a; min-width:50px; }
.inv-mov-bodega { display:flex; align-items:center; gap:.25rem; color:#64748b; flex:1; }
.inv-mov-nota  { color:#94a3b8; font-style:italic; flex:1; }
.inv-mov-user  { color:#64748b; font-weight:600; }
.inv-mov-fecha { color:#94a3b8; white-space:nowrap; margin-left:auto; }

.inv-tipo-btns { display:flex; gap:.5rem; margin:.25rem 0 .5rem; }
.inv-tipo-btn  { flex:1; display:flex; flex-direction:column; align-items:center; gap:.25rem; padding:.65rem; border:1.5px solid #e2e8f0; border-radius:10px; background:#f8fafc; color:#64748b; font-size:.78rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
.inv-tipo-btn .material-symbols-outlined { font-size:1.3rem; }
.inv-tipo-btn--active { border-color:var(--c-primary,#3b82f6); background:var(--c-primary-10,#eff6ff); color:var(--c-primary,#1d4ed8); }

.inv-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:3rem; color:#94a3b8; font-size:.9rem; text-align:center; }
.inv-state .material-symbols-outlined { font-size:2.5rem; opacity:.35; }
.inv-spinner { width:24px; height:24px; border:3px solid #f1f5f9; border-top-color:var(--c-primary,#3b82f6); border-radius:50%; animation:invSpin .7s linear infinite; }
@keyframes invSpin { to{transform:rotate(360deg)} }

.inv-toast { position:fixed; bottom:1.5rem; right:1.5rem; background:#1e293b; color:#f1f5f9; padding:.7rem 1.2rem; border-radius:10px; font-size:.85rem; border-left:3px solid var(--c-secondary,#38C172); box-shadow:0 8px 24px rgba(0,0,0,.2); z-index:2000; animation:invFade .2s ease; }
.inv-toast--err { border-left-color:#ef4444; }
`