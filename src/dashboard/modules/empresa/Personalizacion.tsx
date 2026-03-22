import { useState, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandingColors {
  primary:    string
  secondary:  string
  tertiary:   string
  quaternary: string
}

interface PersonalizacionProps {
  /** Branding actual de la empresa (viene del hook useBranding del Dashboard) */
  currentLogo:   string
  currentNombre: string
  currentColors: BrandingColors
  slug:          string
  /** Callback para refrescar el branding en el Dashboard tras guardar */
  onBrandingUpdated: (colors: BrandingColors, logoUrl: string) => void
}

// ─── Color definitions ────────────────────────────────────────────────────────

const COLOR_FIELDS: { key: keyof BrandingColors; label: string; desc: string; icon: string }[] = [
  { key: 'primary',    label: 'Color Primario',    desc: 'Botones, acentos, links activos',      icon: 'palette' },
  { key: 'secondary',  label: 'Color Secundario',  desc: 'Gráficas, indicadores secundarios',    icon: 'water_drop' },
  { key: 'tertiary',   label: 'Color Terciario',   desc: 'Badges, etiquetas de éxito',           icon: 'eco' },
  { key: 'quaternary', label: 'Color del Sidebar', desc: 'Fondo del menú lateral y navegación',  icon: 'view_sidebar' },
]

const API_BASE = 'http://127.0.0.1:8000/api'

// ─── Component ────────────────────────────────────────────────────────────────

export const Personalizacion = ({
  currentLogo,
  currentNombre,
  currentColors,
  slug,
  onBrandingUpdated,
}: PersonalizacionProps) => {
  // ── Estado de colores ──────────────────────────────────────────────────────
  const [colors,       setColors]       = useState<BrandingColors>(currentColors)
  const [colorsDirty,  setColorsDirty]  = useState(false)
  const [colorsState,  setColorsState]  = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [colorsError,  setColorsError]  = useState('')

  // ── Estado del logo ────────────────────────────────────────────────────────
  const [logoPreview,  setLogoPreview]  = useState<string>(currentLogo)
  const [logoFile,     setLogoFile]     = useState<File | null>(null)
  const [logoDirty,    setLogoDirty]    = useState(false)
  const [logoState,    setLogoState]    = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [logoError,    setLogoError]    = useState('')
  const [dragOver,     setDragOver]     = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const token = localStorage.getItem('access_token') ?? ''

  const handleColorChange = (key: keyof BrandingColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
    setColorsDirty(true)
    setColorsState('idle')
  }

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
      setLogoFile(file)
      setLogoDirty(true)
      setLogoState('idle')
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  // ── Guardar colores → PUT /api/{slug}/branding/colors ─────────────────────

  const saveColors = async () => {
    setColorsState('saving')
    setColorsError('')
    try {
      const res = await fetch(`${API_BASE}/${slug}/branding/colors`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Accept':        'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          color_primario:   colors.primary,
          color_secundario: colors.secondary,
          color_terciario:  colors.tertiary,
          color_cuarto:     colors.quaternary,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Error al guardar colores')

      // Limpiar caché de branding para que el hook lo recargue
      sessionStorage.removeItem(`branding_${slug}`)
      setColorsState('success')
      setColorsDirty(false)
      onBrandingUpdated(colors, logoPreview)
      setTimeout(() => setColorsState('idle'), 2500)
    } catch (err: any) {
      setColorsError(err.message)
      setColorsState('error')
      setTimeout(() => setColorsState('idle'), 3500)
    }
  }

  // ── Guardar logo → POST /api/{slug}/branding/logo ─────────────────────────

  const saveLogo = async () => {
    if (!logoFile) return
    setLogoState('saving')
    setLogoError('')
    try {
      const fd = new FormData()
      fd.append('logo', logoFile)

      const res = await fetch(`${API_BASE}/${slug}/branding/logo`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        // NO poner Content-Type: el browser lo agrega con el boundary correcto
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Error al subir logo')

      sessionStorage.removeItem(`branding_${slug}`)
      setLogoState('success')
      setLogoDirty(false)
      setLogoFile(null)
      // Usar la URL real devuelta por el back
      const newLogoUrl = data.logo_url ?? logoPreview
      setLogoPreview(newLogoUrl)
      onBrandingUpdated(colors, newLogoUrl)
      setTimeout(() => setLogoState('idle'), 2500)
    } catch (err: any) {
      setLogoError(err.message)
      setLogoState('error')
      setTimeout(() => setLogoState('idle'), 3500)
    }
  }

  const resetColors = () => {
    setColors(currentColors)
    setColorsDirty(false)
    setColorsState('idle')
  }

  const resetLogo = () => {
    setLogoPreview(currentLogo)
    setLogoFile(null)
    setLogoDirty(false)
    setLogoState('idle')
  }

  // ── Preview de colores aplicados en tiempo real ────────────────────────────

  const previewVars = {
    '--pv-primary':    colors.primary,
    '--pv-secondary':  colors.secondary,
    '--pv-tertiary':   colors.tertiary,
    '--pv-quaternary': colors.quaternary,
  } as React.CSSProperties

  return (
    <div className="pz-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');

        .pz-root { display:flex; flex-direction:column; gap:2rem; animation:pzIn 0.3s ease; }
        @keyframes pzIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* Page header */
        .pz-page-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; }
        .pz-page-title { font-size:1.4rem; font-weight:700; color:#0f172a; letter-spacing:-0.03em; }
        .pz-page-sub { font-size:0.85rem; color:#64748b; margin-top:0.2rem; }

        /* Section cards */
        .pz-card { background:#fff; border-radius:20px; border:1px solid #f1f5f9; box-shadow:0 2px 8px rgba(0,0,0,0.04); overflow:hidden; }
        .pz-card__header { padding:1.4rem 1.75rem; border-bottom:1px solid #f8fafc; display:flex; align-items:center; gap:0.75rem; }
        .pz-card__header-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .pz-card__header-icon .material-symbols-outlined { font-size:20px; }
        .pz-card__header-text h3 { font-size:0.95rem; font-weight:700; color:#0f172a; }
        .pz-card__header-text p { font-size:0.78rem; color:#94a3b8; margin-top:1px; }
        .pz-card__body { padding:1.75rem; }

        /* ── Logo section ── */
        .pz-logo-layout { display:grid; grid-template-columns:200px 1fr; gap:2rem; align-items:start; }
        @media(max-width:680px){.pz-logo-layout{grid-template-columns:1fr}}

        .pz-logo-preview {
          display:flex; flex-direction:column; align-items:center; gap:0.75rem;
          padding:1.5rem; border:1.5px solid #f1f5f9; border-radius:16px;
          background:#fafbfc; position:relative;
        }
        .pz-logo-preview img { width:96px; height:96px; object-fit:contain; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
        .pz-logo-preview span { font-size:0.78rem; font-weight:600; color:#64748b; text-align:center; }

        .pz-logo-dirty-dot {
          position:absolute; top:10px; right:10px;
          width:8px; height:8px; border-radius:50%; background:#f59e0b;
          box-shadow:0 0 0 2px #fff;
        }

        .pz-drop-zone {
          border:2px dashed #e2e8f0; border-radius:16px; padding:2rem 1.5rem;
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem;
          cursor:pointer; transition:border-color 0.2s, background 0.2s;
          background:#fafbfc; text-align:center; position:relative;
        }
        .pz-drop-zone:hover, .pz-drop-zone--over { border-color:var(--c-primary, #e58346); background:color-mix(in srgb, var(--c-primary, #e58346) 4%, #fff); }
        .pz-drop-zone__icon { font-size:2rem; color:#cbd5e1; }
        .pz-drop-zone__title { font-size:0.875rem; font-weight:700; color:#334155; }
        .pz-drop-zone__sub { font-size:0.75rem; color:#94a3b8; }
        .pz-drop-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }

        /* ── Colors section ── */
        .pz-colors-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:1.25rem; }
        @media(max-width:680px){.pz-colors-grid{grid-template-columns:1fr}}

        .pz-color-field {
          display:flex; align-items:center; gap:1rem;
          padding:1rem 1.25rem; border:1.5px solid #f1f5f9; border-radius:14px;
          background:#fafbfc; transition:border-color 0.15s, box-shadow 0.15s;
          cursor:pointer; position:relative;
        }
        .pz-color-field:hover { border-color:#e2e8f0; }
        .pz-color-field:focus-within { border-color:var(--c-primary, #e58346); box-shadow:0 0 0 3px color-mix(in srgb, var(--c-primary, #e58346) 10%, transparent); }

        .pz-color-swatch {
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          box-shadow:0 2px 8px rgba(0,0,0,0.12); cursor:pointer;
          transition:transform 0.15s, box-shadow 0.15s; position:relative;
        }
        .pz-color-swatch:hover { transform:scale(1.08); box-shadow:0 4px 14px rgba(0,0,0,0.18); }
        .pz-color-swatch input[type="color"] {
          position:absolute; inset:0; opacity:0; cursor:pointer;
          width:100%; height:100%; border:none; padding:0;
        }

        .pz-color-info { flex:1; min-width:0; }
        .pz-color-label { font-size:0.82rem; font-weight:700; color:#0f172a; }
        .pz-color-desc  { font-size:0.72rem; color:#94a3b8; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .pz-color-hex {
          font-size:0.75rem; font-weight:700; color:#64748b; letter-spacing:0.04em;
          background:#f1f5f9; padding:0.25rem 0.6rem; border-radius:6px;
          text-transform:uppercase; font-family:monospace;
          border:1px solid #e2e8f0; flex-shrink:0;
        }

        /* ── Preview mini-dashboard ── */
        .pz-preview-wrap { margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid #f1f5f9; }
        .pz-preview-label { font-size:0.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:1rem; }

        .pz-mini-dash { border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; display:flex; height:110px; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
        .pz-mini-sidebar { width:80px; background:var(--pv-quaternary); display:flex; flex-direction:column; padding:0.75rem 0.5rem; gap:0.4rem; flex-shrink:0; }
        .pz-mini-logo { width:32px; height:32px; border-radius:8px; background:var(--pv-primary); margin-bottom:0.5rem; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .pz-mini-logo img { width:100%; height:100%; object-fit:contain; }
        .pz-mini-nav-item { height:8px; border-radius:4px; background:rgba(255,255,255,0.15); }
        .pz-mini-nav-item--active { background:var(--pv-primary) !important; opacity:0.9; }
        .pz-mini-main { flex:1; background:#f8f9fc; padding:0.75rem; display:flex; flex-direction:column; gap:0.5rem; }
        .pz-mini-header { height:10px; border-radius:4px; background:#e2e8f0; width:50%; }
        .pz-mini-cards { display:flex; gap:0.4rem; flex:1; }
        .pz-mini-card { flex:1; border-radius:6px; background:#fff; border:1px solid #f1f5f9; display:flex; flex-direction:column; padding:0.4rem; gap:0.3rem; }
        .pz-mini-card-dot { width:16px; height:16px; border-radius:4px; }
        .pz-mini-card-line { height:5px; border-radius:3px; background:#f1f5f9; }
        .pz-mini-card-line--accent { height:4px; border-radius:3px; width:60%; }

        /* ── Action bars ── */
        .pz-action-bar {
          display:flex; align-items:center; justify-content:flex-end; gap:0.75rem;
          padding-top:1.25rem; margin-top:1.25rem; border-top:1px solid #f8fafc;
        }

        .pz-btn {
          display:inline-flex; align-items:center; gap:0.4rem;
          padding:0.65rem 1.25rem; border-radius:11px; font-size:0.85rem; font-weight:700;
          cursor:pointer; border:none; transition:all 0.15s; font-family:'Plus Jakarta Sans',sans-serif;
        }
        .pz-btn .material-symbols-outlined { font-size:17px; }

        .pz-btn--ghost { background:transparent; color:#64748b; border:1.5px solid #e2e8f0; }
        .pz-btn--ghost:hover { background:#f8fafc; color:#334155; border-color:#cbd5e1; }
        .pz-btn--ghost:disabled { opacity:0.4; cursor:not-allowed; }

        .pz-btn--primary { background:var(--c-primary, #e58346); color:#fff; box-shadow:0 4px 14px color-mix(in srgb, var(--c-primary, #e58346) 30%, transparent); }
        .pz-btn--primary:hover:not(:disabled) { opacity:0.88; }
        .pz-btn--primary:disabled { opacity:0.5; cursor:not-allowed; box-shadow:none; }

        .pz-btn--success { background:#22c55e; color:#fff; }
        .pz-btn--error   { background:#ef4444; color:#fff; }

        .pz-btn-spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:btnSpin 0.7s linear infinite; flex-shrink:0; }
        @keyframes btnSpin { to{transform:rotate(360deg)} }

        /* Toast de feedback inline */
        .pz-feedback {
          display:flex; align-items:center; gap:0.5rem;
          font-size:0.8rem; font-weight:600; padding:0.5rem 0.875rem;
          border-radius:10px; animation:feedIn 0.25s ease;
        }
        @keyframes feedIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .pz-feedback--success { background:rgba(34,197,94,0.1); color:#16a34a; border:1px solid rgba(34,197,94,0.2); }
        .pz-feedback--error   { background:rgba(239,68,68,0.1); color:#dc2626; border:1px solid rgba(239,68,68,0.2); }
        .pz-feedback .material-symbols-outlined { font-size:16px; }

        /* Dirty badge */
        .pz-dirty-badge { display:inline-flex; align-items:center; gap:0.35rem; font-size:0.72rem; font-weight:600; color:#f59e0b; }
        .pz-dirty-badge::before { content:''; display:block; width:6px; height:6px; border-radius:50%; background:#f59e0b; }
      `}</style>

      {/* Page header */}
      <div className="pz-page-header">
        <div>
          <h1 className="pz-page-title">Personalización</h1>
          <p className="pz-page-sub">Ajusta la identidad visual de {currentNombre}</p>
        </div>
      </div>

      {/* ── SECCIÓN: LOGO ─────────────────────────────────────────────────── */}
      <div className="pz-card">
        <div className="pz-card__header">
          <div className="pz-card__header-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <span className="material-symbols-outlined" style={{ color: '#6366f1' }}>image</span>
          </div>
          <div className="pz-card__header-text">
            <h3>Logo de la empresa</h3>
            <p>PNG, JPG, SVG o WebP · Máx. 2 MB · Recomendado 256×256 px</p>
          </div>
        </div>
        <div className="pz-card__body">
          <div className="pz-logo-layout">

            {/* Preview actual */}
            <div className="pz-logo-preview">
              {logoDirty && <div className="pz-logo-dirty-dot" />}
              <img src={logoPreview} alt="Logo actual" />
              <span>{logoDirty ? 'Nuevo logo (sin guardar)' : 'Logo actual'}</span>
            </div>

            {/* Drop zone */}
            <div>
              <div
                className={`pz-drop-zone ${dragOver ? 'pz-drop-zone--over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined pz-drop-zone__icon">cloud_upload</span>
                <p className="pz-drop-zone__title">Arrastra tu logo aquí</p>
                <p className="pz-drop-zone__sub">o haz clic para seleccionar un archivo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="pz-action-bar">
                {logoDirty && <span className="pz-dirty-badge">Cambios sin guardar</span>}

                {logoState === 'success' && (
                  <div className="pz-feedback pz-feedback--success">
                    <span className="material-symbols-outlined">check_circle</span>
                    Logo actualizado correctamente
                  </div>
                )}
                {logoState === 'error' && (
                  <div className="pz-feedback pz-feedback--error">
                    <span className="material-symbols-outlined">error</span>
                    {logoError}
                  </div>
                )}

                {logoDirty && (
                  <button className="pz-btn pz-btn--ghost" onClick={resetLogo} disabled={logoState === 'saving'}>
                    <span className="material-symbols-outlined">undo</span>
                    Descartar
                  </button>
                )}

                <button
                  className={`pz-btn ${logoState === 'success' ? 'pz-btn--success' : logoState === 'error' ? 'pz-btn--error' : 'pz-btn--primary'}`}
                  onClick={saveLogo}
                  disabled={!logoDirty || logoState === 'saving'}
                >
                  {logoState === 'saving' ? (
                    <><div className="pz-btn-spinner" /> Subiendo…</>
                  ) : logoState === 'success' ? (
                    <><span className="material-symbols-outlined">check</span> Guardado</>
                  ) : (
                    <><span className="material-symbols-outlined">upload</span> Subir logo</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN: COLORES ──────────────────────────────────────────────── */}
      <div className="pz-card" style={previewVars}>
        <div className="pz-card__header">
          <div className="pz-card__header-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>palette</span>
          </div>
          <div className="pz-card__header-text">
            <h3>Paleta de colores</h3>
            <p>Haz clic en cualquier muestra para abrir el selector de color</p>
          </div>
        </div>
        <div className="pz-card__body">

          <div className="pz-colors-grid">
            {COLOR_FIELDS.map(({ key, label, desc, icon }) => (
              <div key={key} className="pz-color-field">
                <div className="pz-color-swatch" style={{ background: colors[key] }}>
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    title={`Cambiar ${label}`}
                  />
                </div>
                <div className="pz-color-info">
                  <p className="pz-color-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px', color: '#94a3b8' }}>{icon}</span>
                    {label}
                  </p>
                  <p className="pz-color-desc">{desc}</p>
                </div>
                <span className="pz-color-hex">{colors[key]}</span>
              </div>
            ))}
          </div>

          {/* Mini preview en tiempo real */}
          <div className="pz-preview-wrap">
            <p className="pz-preview-label">Vista previa en tiempo real</p>
            <div className="pz-mini-dash">
              {/* Mini sidebar */}
              <div className="pz-mini-sidebar">
                <div className="pz-mini-logo">
                  <img src={logoPreview} alt="" />
                </div>
                {[1,2,3,4].map(i => (
                  <div key={i} className={`pz-mini-nav-item ${i===1 ? 'pz-mini-nav-item--active' : ''}`} style={{ width: `${55 + i*8}%` }} />
                ))}
              </div>
              {/* Mini main */}
              <div className="pz-mini-main">
                <div className="pz-mini-header" />
                <div className="pz-mini-cards">
                  {[colors.tertiary, colors.primary, colors.secondary].map((c, i) => (
                    <div key={i} className="pz-mini-card">
                      <div className="pz-mini-card-dot" style={{ background: `color-mix(in srgb, ${c} 15%, transparent)` }}>
                        <div style={{ width: 8, height: 8, borderRadius: 3, background: c, margin: '4px auto 0' }} />
                      </div>
                      <div className="pz-mini-card-line" />
                      <div className="pz-mini-card-line pz-mini-card-line--accent" style={{ background: `color-mix(in srgb, ${c} 30%, transparent)` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action bar colores */}
          <div className="pz-action-bar">
            {colorsDirty && <span className="pz-dirty-badge">Cambios sin guardar</span>}

            {colorsState === 'success' && (
              <div className="pz-feedback pz-feedback--success">
                <span className="material-symbols-outlined">check_circle</span>
                Colores guardados correctamente
              </div>
            )}
            {colorsState === 'error' && (
              <div className="pz-feedback pz-feedback--error">
                <span className="material-symbols-outlined">error</span>
                {colorsError}
              </div>
            )}

            {colorsDirty && (
              <button className="pz-btn pz-btn--ghost" onClick={resetColors} disabled={colorsState === 'saving'}>
                <span className="material-symbols-outlined">undo</span>
                Descartar
              </button>
            )}

            <button
              className={`pz-btn ${colorsState === 'success' ? 'pz-btn--success' : colorsState === 'error' ? 'pz-btn--error' : 'pz-btn--primary'}`}
              style={ colorsState === 'idle' || colorsState === 'saving' ? { background: colors.primary } : {} }
              onClick={saveColors}
              disabled={!colorsDirty || colorsState === 'saving'}
            >
              {colorsState === 'saving' ? (
                <><div className="pz-btn-spinner" /> Guardando…</>
              ) : colorsState === 'success' ? (
                <><span className="material-symbols-outlined">check</span> Guardado</>
              ) : (
                <><span className="material-symbols-outlined">save</span> Guardar colores</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Personalizacion