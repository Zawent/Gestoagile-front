// src/pages/POS.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Producto {
  id:          string
  nombre:      string
  sku:         string | null
  precio_venta:number
  stock_total: number
  categoria?:  { id: string; nombre: string } | null
  unidad_medida?: { id: string; abreviatura: string } | null
}

interface ItemCarrito {
  producto:   Producto
  cantidad:   number
  subtotal:   number
}

interface MetodoPago {
  id:     string
  nombre: string
}

interface VentaResponse {
  id:          string
  numero:      string
  subtotal:    number
  descuento:   number
  total:       number
  estado:      string
  created_at:  string
  metodo_pago: { nombre: string } | null
  user:        { name: string; last_name: string }
  items: {
    id:              string
    cantidad:        number
    precio_unitario: number
    subtotal:        number
    producto: {
      nombre: string
      sku:    string | null
      unidad_medida?: { abreviatura: string } | null
    }
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoneda = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(n)

// ─── Tirilla de impresión ─────────────────────────────────────────────────────

function Tirilla({ venta, empresa, onClose }: {
  venta:   VentaResponse
  empresa: string
  onClose: () => void
}) {
  const handlePrint = () => window.print()

  return (
    <div className="pos-overlay" onClick={onClose}>
      <div className="pos-tirilla-wrap" onClick={e => e.stopPropagation()}>

        {/* Estilos solo de impresión */}
        <style>{`
          @media print {
            body > * { display: none !important; }
            .pos-tirilla-print { display: block !important; }
            @page { margin: 4mm; size: 80mm auto; }
          }
          .pos-tirilla-print { display: none; }
        `}</style>

        {/* Vista previa en pantalla */}
        <div className="pos-tirilla-preview">
          <div className="pos-tirilla-header">
            <p className="pos-tirilla-empresa">{empresa}</p>
            <p className="pos-tirilla-numero">{venta.numero}</p>
            <p className="pos-tirilla-fecha">
              {new Date(venta.created_at).toLocaleString('es-CO', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
            <p className="pos-tirilla-cajero">
              Cajero: {venta.user.name} {venta.user.last_name}
            </p>
          </div>

          <div className="pos-tirilla-divider">{'─'.repeat(32)}</div>

          <div className="pos-tirilla-items">
            {venta.items.map(item => (
              <div key={item.id} className="pos-tirilla-item">
                <p className="pos-tirilla-item-nombre">{item.producto.nombre}</p>
                <div className="pos-tirilla-item-row">
                  <span>
                    {fmt(item.cantidad)} {item.producto.unidad_medida?.abreviatura ?? 'und'}
                    {' × '}{fmtMoneda(item.precio_unitario)}
                  </span>
                  <span>{fmtMoneda(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pos-tirilla-divider">{'─'.repeat(32)}</div>

          <div className="pos-tirilla-totales">
            {venta.descuento > 0 && (<>
              <div className="pos-tirilla-total-row">
                <span>Subtotal</span><span>{fmtMoneda(venta.subtotal)}</span>
              </div>
              <div className="pos-tirilla-total-row pos-tirilla-descuento">
                <span>Descuento</span><span>-{fmtMoneda(venta.descuento)}</span>
              </div>
            </>)}
            <div className="pos-tirilla-total-row pos-tirilla-total-final">
              <span>TOTAL</span><span>{fmtMoneda(venta.total)}</span>
            </div>
            {venta.metodo_pago && (
              <div className="pos-tirilla-total-row">
                <span>Pago</span><span>{venta.metodo_pago.nombre}</span>
              </div>
            )}
          </div>

          <div className="pos-tirilla-divider">{'─'.repeat(32)}</div>
          <p className="pos-tirilla-pie">¡Gracias por su compra!</p>
        </div>

        <div className="pos-tirilla-actions">
          <button className="pos-btn pos-btn--ghost" onClick={onClose}>Cerrar</button>
          <button className="pos-btn pos-btn--primary" onClick={handlePrint}>
            <span className="material-symbols-outlined">print</span>
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── POS ──────────────────────────────────────────────────────────────────────

export default function POS() {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const searchRef  = useRef<HTMLInputElement>(null)

  const [busqueda,      setBusqueda]      = useState('')
  const [productos,     setProductos]     = useState<Producto[]>([])
  const [buscando,      setBuscando]      = useState(false)
  const [carrito,       setCarrito]       = useState<ItemCarrito[]>([])
  const [descuento,     setDescuento]     = useState('')
  const [metodoPagoId,  setMetodoPagoId]  = useState('')
  const [metodosPago,   setMetodosPago]   = useState<MetodoPago[]>([])
  const [procesando,    setProcesando]    = useState(false)
  const [error,         setError]         = useState('')
  const [ventaActual,   setVentaActual]   = useState<VentaResponse | null>(null)
  const [nombreEmpresa, setNombreEmpresa] = useState('')

  // Buscar productos con debounce
  const buscarProductos = useCallback(async (q: string) => {
    setBuscando(true)
    try {
      const data = await apiFetch<Producto[]>(`ventas/productos-pos?q=${encodeURIComponent(q)}`)
      setProductos(Array.isArray(data) ? data : [])
    } catch { setProductos([]) }
    finally { setBuscando(false) }
  }, [])

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => buscarProductos(busqueda), 250)
    return () => clearTimeout(timer)
  }, [busqueda, buscarProductos])

  // Cargar métodos de pago y nombre de empresa al montar
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [metodos, branding] = await Promise.all([
          apiFetch<MetodoPago[]>('parametrizacion/metodos-pago'),
          apiFetch<{ nombre: string }>(`../${slug}/branding`).catch(() => ({ nombre: '' })),
        ])
        setMetodosPago(Array.isArray(metodos) ? metodos : [])
        setNombreEmpresa(
          localStorage.getItem('empresa_nombre') ?? ''
        )
        if (metodos.length > 0) setMetodoPagoId(String(metodos[0].id))
      } catch { /* silent */ }
    }
    cargarInicial()
    buscarProductos('')
    // Enfocar el buscador al abrir
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [])

  // ── Carrito ────────────────────────────────────────────────────────────────

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.stock_total <= 0) return
    setCarrito(prev => {
      const existente = prev.find(i => i.producto.id === producto.id)
      if (existente) {
        const nuevaCantidad = existente.cantidad + 1
        if (nuevaCantidad > producto.stock_total) return prev
        return prev.map(i => i.producto.id === producto.id
          ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.producto.precio_venta }
          : i
        )
      }
      return [...prev, {
        producto,
        cantidad: 1,
        subtotal: producto.precio_venta,
      }]
    })
  }

  const cambiarCantidad = (productoId: string, valor: string) => {
    const n = parseFloat(valor)
    if (isNaN(n) || n <= 0) { eliminarDelCarrito(productoId); return }
    setCarrito(prev => prev.map(i => {
      if (i.producto.id !== productoId) return i
      const cantidad = Math.min(n, i.producto.stock_total)
      return { ...i, cantidad, subtotal: cantidad * i.producto.precio_venta }
    }))
  }

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(i => i.producto.id !== productoId))
  }

  const limpiarCarrito = () => {
    setCarrito([])
    setDescuento('')
    setError('')
    setTimeout(() => searchRef.current?.focus(), 100)
  }

  // ── Totales ────────────────────────────────────────────────────────────────

  const subtotal     = carrito.reduce((s, i) => s + i.subtotal, 0)
  const descuentoNum = parseFloat(descuento) || 0
  const total        = Math.max(0, subtotal - descuentoNum)

  // ── Cobrar ─────────────────────────────────────────────────────────────────

  const handleCobrar = async () => {
    if (carrito.length === 0) { setError('El carrito está vacío.'); return }
    setError('')
    setProcesando(true)
    try {
      const venta = await apiFetch<VentaResponse>('ventas', {
        method: 'POST',
        body: JSON.stringify({
          items: carrito.map(i => ({
            producto_id: i.producto.id,
            cantidad:    i.cantidad,
          })),
          descuento:      descuentoNum || null,
          metodo_pago_id: metodoPagoId || null,
        }),
      })
      setVentaActual(venta)
      limpiarCarrito()
      // Refrescar productos para stock actualizado
      buscarProductos(busqueda)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setProcesando(false)
    }
  }

  // ── Enter en el buscador → agrega el primer resultado ──────────────────────
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && productos.length > 0) {
      agregarAlCarrito(productos[0])
      setBusqueda('')
    }
  }

  return (
    <div className="pos-root">
      <style>{CSS}</style>

      {/* ══ HEADER ══ */}
      <header className="pos-header">
        <button className="pos-back-btn" onClick={() => navigate(`/${slug}/dashboard`)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Dashboard
        </button>
        <div className="pos-header-center">
          <span className="material-symbols-outlined" style={{ color: 'var(--c-primary,#3b82f6)' }}>point_of_sale</span>
          <span className="pos-header-title">Punto de Venta</span>
          {nombreEmpresa && <span className="pos-header-empresa">{nombreEmpresa}</span>}
        </div>
        <div style={{ width: 120 }} />
      </header>

      <div className="pos-body">

        {/* ══ IZQUIERDA — Catálogo ══ */}
        <section className="pos-catalogo">

          {/* Buscador — compatible con lector de código de barras */}
          <div className="pos-search-wrap">
            <span className="material-symbols-outlined pos-search-icon">search</span>
            <input
              ref={searchRef}
              className="pos-search"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar por nombre o SKU… (Enter para agregar el primero)"
              autoComplete="off"
            />
            {busqueda && (
              <button className="pos-search-clear" onClick={() => { setBusqueda(''); searchRef.current?.focus() }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Grid de productos */}
          {buscando ? (
            <div className="pos-state"><div className="pos-spinner" />Buscando…</div>
          ) : productos.length === 0 ? (
            <div className="pos-state">
              <span className="material-symbols-outlined">inventory_2</span>
              <p>{busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay productos activos.'}</p>
            </div>
          ) : (
            <div className="pos-grid">
              {productos.map(p => {
                const enCarrito   = carrito.find(i => i.producto.id === p.id)
                const sinStock    = p.stock_total <= 0
                return (
                  <button
                    key={p.id}
                    className={`pos-prod ${sinStock ? 'pos-prod--sin-stock' : ''} ${enCarrito ? 'pos-prod--en-carrito' : ''}`}
                    onClick={() => !sinStock && agregarAlCarrito(p)}
                    disabled={sinStock}
                  >
                    <div className="pos-prod-icon">
                      <span className="material-symbols-outlined">
                        {sinStock ? 'remove_shopping_cart' : 'shopping_bag'}
                      </span>
                    </div>
                    <p className="pos-prod-nombre">{p.nombre}</p>
                    {p.sku && <p className="pos-prod-sku">{p.sku}</p>}
                    <p className="pos-prod-precio">{fmtMoneda(p.precio_venta)}</p>
                    <p className={`pos-prod-stock ${sinStock ? 'pos-prod-stock--cero' : ''}`}>
                      {sinStock ? 'Sin stock' : `${fmt(p.stock_total)} ${p.unidad_medida?.abreviatura ?? 'und'}`}
                    </p>
                    {enCarrito && (
                      <div className="pos-prod-badge">{fmt(enCarrito.cantidad)}</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* ══ DERECHA — Carrito ══ */}
        <aside className="pos-carrito">
          <div className="pos-carrito-header">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>Carrito</span>
            {carrito.length > 0 && (
              <button className="pos-carrito-clear" onClick={limpiarCarrito} title="Vaciar carrito">
                <span className="material-symbols-outlined">delete_sweep</span>
              </button>
            )}
          </div>

          {carrito.length === 0 ? (
            <div className="pos-carrito-vacio">
              <span className="material-symbols-outlined">shopping_cart</span>
              <p>El carrito está vacío</p>
              <p style={{ fontSize: '.78rem' }}>Busca y agrega productos</p>
            </div>
          ) : (
            <div className="pos-carrito-items">
              {carrito.map(item => (
                <div key={item.producto.id} className="pos-carrito-item">
                  <div className="pos-carrito-item-info">
                    <p className="pos-carrito-item-nombre">{item.producto.nombre}</p>
                    <p className="pos-carrito-item-precio">{fmtMoneda(item.producto.precio_venta)} c/u</p>
                  </div>
                  <div className="pos-carrito-item-controles">
                    <button className="pos-qty-btn"
                      onClick={() => cambiarCantidad(item.producto.id, String(item.cantidad - 1))}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <input
                      className="pos-qty-input"
                      type="number"
                      min="0.001"
                      step="1"
                      value={item.cantidad}
                      onChange={e => cambiarCantidad(item.producto.id, e.target.value)}
                    />
                    <button className="pos-qty-btn"
                      onClick={() => cambiarCantidad(item.producto.id, String(item.cantidad + 1))}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                    <button className="pos-qty-btn pos-qty-btn--del"
                      onClick={() => eliminarDelCarrito(item.producto.id)}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <p className="pos-carrito-item-sub">{fmtMoneda(item.subtotal)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Totales y cobro */}
          <div className="pos-carrito-footer">
            {/* Descuento */}
            <div className="pos-descuento-wrap">
              <label className="pos-label">Descuento</label>
              <input
                className="pos-input"
                type="number"
                min="0"
                value={descuento}
                onChange={e => setDescuento(e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom: '.75rem' }}>
              <label className="pos-label">Método de pago</label>
              <select className="pos-input" value={metodoPagoId} onChange={e => setMetodoPagoId(e.target.value)}>
                <option value="">Sin especificar</option>
                {metodosPago.map(m => (
                  <option key={m.id} value={String(m.id)}>{m.nombre}</option>
                ))}
              </select>
            </div>

            {/* Resumen */}
            <div className="pos-resumen">
              {descuentoNum > 0 && (
                <div className="pos-resumen-row">
                  <span>Subtotal</span>
                  <span>{fmtMoneda(subtotal)}</span>
                </div>
              )}
              {descuentoNum > 0 && (
                <div className="pos-resumen-row pos-resumen-descuento">
                  <span>Descuento</span>
                  <span>-{fmtMoneda(descuentoNum)}</span>
                </div>
              )}
              <div className="pos-resumen-row pos-resumen-total">
                <span>TOTAL</span>
                <span>{fmtMoneda(total)}</span>
              </div>
            </div>

            {error && <p className="pos-error">{error}</p>}

            <button
              className="pos-cobrar-btn"
              onClick={handleCobrar}
              disabled={procesando || carrito.length === 0}
            >
              {procesando
                ? <><div className="pos-spinner-sm" />Procesando…</>
                : <><span className="material-symbols-outlined">payments</span>Cobrar {fmtMoneda(total)}</>
              }
            </button>
          </div>
        </aside>
      </div>

      {/* ══ TIRILLA ══ */}
      {ventaActual && (
        <Tirilla
          venta={ventaActual}
          empresa={nombreEmpresa}
          onClose={() => setVentaActual(null)}
        />
      )}
    </div>
  )
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');

  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

  .pos-root {
    display:flex; flex-direction:column; height:100vh; overflow:hidden;
    font-family:'Plus Jakarta Sans',sans-serif; background:#f1f5f9; color:#1e293b;
  }

  /* Header */
  .pos-header {
    height:60px; background:#fff; border-bottom:1px solid #e2e8f0;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 1.5rem; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,.05);
  }
  .pos-back-btn {
    display:flex; align-items:center; gap:.3rem; background:none; border:none;
    color:#64748b; font-size:.85rem; font-weight:600; cursor:pointer;
    font-family:inherit; padding:.4rem .7rem; border-radius:8px; transition:background .15s;
  }
  .pos-back-btn:hover { background:#f1f5f9; color:#334155; }
  .pos-back-btn .material-symbols-outlined { font-size:1.1rem; }
  .pos-header-center { display:flex; align-items:center; gap:.5rem; }
  .pos-header-center .material-symbols-outlined { font-size:1.3rem; }
  .pos-header-title { font-size:1rem; font-weight:700; color:#0f172a; }
  .pos-header-empresa {
    font-size:.78rem; color:#64748b; background:#f8fafc;
    border:1px solid #e2e8f0; padding:.2rem .6rem; border-radius:99px;
  }

  /* Body */
  .pos-body { flex:1; display:grid; grid-template-columns:1fr 360px; overflow:hidden; gap:0; }

  /* Catálogo */
  .pos-catalogo { display:flex; flex-direction:column; overflow:hidden; padding:1.25rem; gap:1rem; }

  .pos-search-wrap { position:relative; }
  .pos-search-icon { position:absolute; left:.875rem; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem; pointer-events:none; }
  .pos-search {
    width:100%; padding:.7rem 2.5rem .7rem 2.75rem; background:#fff;
    border:1.5px solid #e2e8f0; border-radius:12px; font-family:inherit;
    font-size:.9rem; color:#0f172a; outline:none; transition:border-color .15s,box-shadow .15s;
  }
  .pos-search:focus { border-color:var(--c-primary,#3b82f6); box-shadow:0 0 0 3px color-mix(in srgb,var(--c-primary,#3b82f6) 12%,transparent); }
  .pos-search::placeholder { color:#94a3b8; }
  .pos-search-clear {
    position:absolute; right:.75rem; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:#94a3b8; display:flex;
    align-items:center; padding:.15rem; border-radius:4px;
  }
  .pos-search-clear:hover { color:#334155; }
  .pos-search-clear .material-symbols-outlined { font-size:1rem; }

  /* Grid productos */
  .pos-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr));
    gap:.75rem; overflow-y:auto; padding-bottom:.5rem;
  }
  .pos-grid::-webkit-scrollbar { width:4px; }
  .pos-grid::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }

  .pos-prod {
    background:#fff; border:1.5px solid #e2e8f0; border-radius:14px;
    padding:.875rem .75rem; display:flex; flex-direction:column; align-items:center;
    gap:.3rem; cursor:pointer; transition:all .15s; text-align:center;
    position:relative; font-family:inherit;
  }
  .pos-prod:hover:not(:disabled) { border-color:var(--c-primary,#3b82f6); box-shadow:0 4px 16px rgba(0,0,0,.08); transform:translateY(-1px); }
  .pos-prod:active:not(:disabled) { transform:scale(.97); }
  .pos-prod--sin-stock { opacity:.45; cursor:not-allowed; }
  .pos-prod--en-carrito { border-color:var(--c-primary,#3b82f6); background:color-mix(in srgb,var(--c-primary,#3b82f6) 5%,#fff); }
  .pos-prod-icon .material-symbols-outlined { font-size:1.75rem; color:var(--c-primary,#3b82f6); opacity:.6; }
  .pos-prod-nombre { font-weight:700; font-size:.82rem; color:#0f172a; line-height:1.3; }
  .pos-prod-sku { font-size:.7rem; color:#94a3b8; font-weight:600; }
  .pos-prod-precio { font-size:.9rem; font-weight:700; color:#0f172a; }
  .pos-prod-stock { font-size:.72rem; color:#64748b; }
  .pos-prod-stock--cero { color:#ef4444; font-weight:600; }
  .pos-prod-badge {
    position:absolute; top:-6px; right:-6px; background:var(--c-primary,#3b82f6);
    color:#fff; font-size:.65rem; font-weight:800; min-width:20px; height:20px;
    border-radius:99px; display:flex; align-items:center; justify-content:center;
    padding:0 5px; border:2px solid #fff;
  }

  /* Carrito */
  .pos-carrito {
    background:#fff; border-left:1px solid #e2e8f0;
    display:flex; flex-direction:column; overflow:hidden;
  }
  .pos-carrito-header {
    padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9;
    display:flex; align-items:center; gap:.5rem;
    font-weight:700; font-size:.95rem; color:#0f172a; flex-shrink:0;
  }
  .pos-carrito-header .material-symbols-outlined { font-size:1.2rem; color:var(--c-primary,#3b82f6); }
  .pos-carrito-clear {
    margin-left:auto; background:none; border:none; cursor:pointer;
    color:#94a3b8; display:flex; align-items:center; border-radius:6px;
    padding:.2rem; transition:color .15s,background .15s;
  }
  .pos-carrito-clear:hover { color:#ef4444; background:#fef2f2; }
  .pos-carrito-clear .material-symbols-outlined { font-size:1.1rem; }

  .pos-carrito-vacio {
    flex:1; display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:.5rem; color:#94a3b8; padding:2rem;
  }
  .pos-carrito-vacio .material-symbols-outlined { font-size:2.5rem; opacity:.3; }
  .pos-carrito-vacio p { font-size:.85rem; }

  .pos-carrito-items { flex:1; overflow-y:auto; padding:.75rem; display:flex; flex-direction:column; gap:.5rem; }
  .pos-carrito-items::-webkit-scrollbar { width:3px; }
  .pos-carrito-items::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }

  .pos-carrito-item {
    display:grid; grid-template-columns:1fr auto auto;
    align-items:center; gap:.5rem; padding:.6rem .75rem;
    background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px;
  }
  .pos-carrito-item-nombre { font-weight:600; font-size:.83rem; color:#0f172a; }
  .pos-carrito-item-precio { font-size:.72rem; color:#94a3b8; margin-top:.1rem; }
  .pos-carrito-item-sub { font-weight:700; font-size:.85rem; color:#0f172a; white-space:nowrap; }

  .pos-carrito-item-controles { display:flex; align-items:center; gap:.2rem; }
  .pos-qty-btn {
    width:26px; height:26px; border:1px solid #e2e8f0; border-radius:6px;
    background:#fff; display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background .15s; flex-shrink:0;
  }
  .pos-qty-btn .material-symbols-outlined { font-size:.85rem; color:#64748b; }
  .pos-qty-btn:hover { background:#f1f5f9; }
  .pos-qty-btn--del:hover { background:#fef2f2; }
  .pos-qty-btn--del .material-symbols-outlined { color:#ef4444; }
  .pos-qty-input {
    width:44px; height:26px; border:1px solid #e2e8f0; border-radius:6px;
    text-align:center; font-family:inherit; font-size:.82rem; font-weight:700;
    color:#0f172a; outline:none; background:#fff;
  }
  .pos-qty-input:focus { border-color:var(--c-primary,#3b82f6); }

  /* Footer carrito */
  .pos-carrito-footer { padding:1rem 1.25rem; border-top:1px solid #f1f5f9; flex-shrink:0; }

  .pos-label { display:block; font-size:.7rem; font-weight:600; color:#64748b; margin-bottom:.25rem; text-transform:uppercase; letter-spacing:.04em; }
  .pos-input {
    width:100%; box-sizing:border-box; padding:.5rem .75rem; background:#f8fafc;
    border:1.5px solid #e2e8f0; border-radius:8px; font-family:inherit;
    font-size:.85rem; color:#0f172a; outline:none; transition:border-color .15s;
    margin-bottom:.75rem;
  }
  .pos-input:focus { border-color:var(--c-primary,#3b82f6); background:#fff; }

  .pos-descuento-wrap { margin-bottom:0; }

  .pos-resumen { background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px; padding:.75rem; margin-bottom:.875rem; }
  .pos-resumen-row { display:flex; justify-content:space-between; font-size:.85rem; color:#64748b; margin-bottom:.2rem; }
  .pos-resumen-row:last-child { margin-bottom:0; }
  .pos-resumen-descuento { color:#dc2626; }
  .pos-resumen-total { font-weight:700; font-size:1.05rem; color:#0f172a; padding-top:.4rem; border-top:1px solid #e2e8f0; margin-top:.4rem; }

  .pos-error { color:#ef4444; font-size:.8rem; margin-bottom:.5rem; }

  .pos-cobrar-btn {
    width:100%; padding:.8rem; background:var(--c-primary,#3b82f6); color:#fff;
    border:none; border-radius:11px; font-family:inherit; font-size:.95rem;
    font-weight:700; cursor:pointer; display:flex; align-items:center;
    justify-content:center; gap:.4rem; transition:opacity .15s;
  }
  .pos-cobrar-btn .material-symbols-outlined { font-size:1.1rem; }
  .pos-cobrar-btn:hover:not(:disabled) { opacity:.9; }
  .pos-cobrar-btn:disabled { opacity:.5; cursor:not-allowed; }

  /* States */
  .pos-state {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:.75rem; padding:3rem; color:#94a3b8; font-size:.9rem; text-align:center;
  }
  .pos-state .material-symbols-outlined { font-size:2.5rem; opacity:.3; }
  .pos-spinner { width:22px; height:22px; border:3px solid #f1f5f9; border-top-color:var(--c-primary,#3b82f6); border-radius:50%; animation:posSpin .7s linear infinite; }
  .pos-spinner-sm { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:posSpin .7s linear infinite; }
  @keyframes posSpin { to { transform:rotate(360deg) } }

  /* Tirilla */
  .pos-overlay {
    position:fixed; inset:0; background:rgba(15,23,42,.5);
    backdrop-filter:blur(4px); display:grid; place-items:center;
    z-index:1000; padding:1rem; animation:posIn .15s ease;
  }
  @keyframes posIn { from{opacity:0} to{opacity:1} }
  .pos-tirilla-wrap {
    background:#fff; border-radius:16px; overflow:hidden;
    box-shadow:0 24px 64px rgba(0,0,0,.2);
    display:flex; flex-direction:column; max-height:90vh; width:100%; max-width:380px;
    animation:posSlide .2s ease;
  }
  @keyframes posSlide { from{opacity:0;transform:translateY(10px) scale(.98)} to{opacity:1;transform:none} }

  .pos-tirilla-preview {
    padding:1.5rem; overflow-y:auto; font-family:'Courier New',monospace;
    font-size:.82rem; flex:1; background:#fff;
  }
  .pos-tirilla-header { text-align:center; margin-bottom:.75rem; }
  .pos-tirilla-empresa { font-size:1rem; font-weight:700; margin-bottom:.2rem; font-family:'Plus Jakarta Sans',sans-serif; }
  .pos-tirilla-numero { font-size:.85rem; font-weight:700; color:#334155; }
  .pos-tirilla-fecha, .pos-tirilla-cajero { font-size:.75rem; color:#64748b; margin-top:.15rem; }

  .pos-tirilla-divider { color:#cbd5e1; text-align:center; margin:.6rem 0; letter-spacing:-.5px; font-size:.8rem; }

  .pos-tirilla-items { display:flex; flex-direction:column; gap:.4rem; }
  .pos-tirilla-item-nombre { font-weight:600; color:#0f172a; }
  .pos-tirilla-item-row { display:flex; justify-content:space-between; color:#475569; font-size:.78rem; }

  .pos-tirilla-totales { display:flex; flex-direction:column; gap:.3rem; }
  .pos-tirilla-total-row { display:flex; justify-content:space-between; }
  .pos-tirilla-descuento { color:#dc2626; }
  .pos-tirilla-total-final { font-weight:700; font-size:1rem; color:#0f172a; padding:.25rem 0; border-top:1px solid #e2e8f0; margin-top:.2rem; }

  .pos-tirilla-pie { text-align:center; margin-top:.75rem; color:#64748b; font-style:italic; }

  .pos-tirilla-actions {
    padding:1rem 1.25rem; border-top:1px solid #f1f5f9;
    display:flex; gap:.6rem; justify-content:flex-end; flex-shrink:0;
  }
  .pos-btn { display:inline-flex; align-items:center; gap:.35rem; padding:.5rem 1rem; border-radius:8px; border:none; font-size:.85rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
  .pos-btn .material-symbols-outlined { font-size:1rem; }
  .pos-btn--primary { background:var(--c-primary,#3b82f6); color:#fff; }
  .pos-btn--primary:hover { opacity:.88; }
  .pos-btn--ghost { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
  .pos-btn--ghost:hover { background:#f1f5f9; }

  /* Responsive */
  @media(max-width:768px) {
    .pos-body { grid-template-columns:1fr; grid-template-rows:1fr auto; }
    .pos-carrito { border-left:none; border-top:1px solid #e2e8f0; max-height:40vh; }
    .pos-grid { grid-template-columns:repeat(auto-fill, minmax(120px,1fr)); }
  }
`