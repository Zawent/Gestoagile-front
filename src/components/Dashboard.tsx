import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from './Useauth'
import { useBranding } from './useBranding'
import type { Branding } from './useBranding'
import { Personalizacion } from './Personalizacion'

// ─── Mock data (Panel Principal) ──────────────────────────────────────────────

const MOCK_CONTRACTS = [
  { id:'#CN-2024-084', client:'Tech Solutions S.A.', initials:'TS', color:'indigo',  date:'14 Oct, 2024', amount:'$4,250.00', status:'Firmado'  },
  { id:'#CN-2024-085', client:'Media Loft Group',    initials:'ML', color:'amber',   date:'12 Oct, 2024', amount:'$1,800.00', status:'Pendiente' },
  { id:'#CN-2024-082', client:'Bright Capital',      initials:'BC', color:'rose',    date:'08 Oct, 2024', amount:'$7,100.00', status:'Expirado'  },
  { id:'#CN-2024-087', client:'Green Energy Ltd.',   initials:'GE', color:'emerald', date:'05 Oct, 2024', amount:'$2,400.00', status:'Firmado'   },
]
const STATUS_STYLES: Record<string,{bg:string;text:string;border:string}> = {
  Firmado:  {bg:'rgba(172,197,95,0.12)', text:'#6a8f22', border:'rgba(172,197,95,0.3)'},
  Pendiente:{bg:'rgba(229,131,70,0.12)', text:'#c2611a', border:'rgba(229,131,70,0.3)'},
  Expirado: {bg:'rgba(148,163,184,0.12)',text:'#64748b', border:'rgba(148,163,184,0.3)'},
}
const INITIALS_COLORS: Record<string,{bg:string;text:string}> = {
  indigo: {bg:'#e0e7ff',text:'#4338ca'},
  amber:  {bg:'#fef3c7',text:'#d97706'},
  rose:   {bg:'#ffe4e6',text:'#e11d48'},
  emerald:{bg:'#d1fae5',text:'#059669'},
}

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavKey = 'empresa' | 'empresa/info' | 'empresa/usuarios' | 'empresa/facturacion' | 'empresa/personalizacion' | 'dashboard' | 'inventario' | 'contratos' | 'facturacion' | 'reportes'

interface NavItem {
  key:      NavKey
  icon:     string
  label:    string
  children?: { key: NavKey; icon: string; label: string; tag?: string }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'empresa', icon: 'business', label: 'Empresa',
    children: [
      { key: 'empresa/info',           icon: 'info',            label: 'Información general' },
      { key: 'empresa/usuarios',        icon: 'group',           label: 'Usuarios y roles' },
      { key: 'empresa/facturacion',     icon: 'credit_card',     label: 'Facturación y plan' },
      { key: 'empresa/personalizacion', icon: 'palette',         label: 'Personalización', tag: 'Nuevo' },
    ],
  },
  { key: 'dashboard',   icon: 'grid_view',   label: 'Panel Principal' },
  { key: 'inventario',  icon: 'inventory_2',  label: 'Inventario' },
  { key: 'contratos',   icon: 'description',  label: 'Contratos' },
  { key: 'facturacion', icon: 'receipt_long', label: 'Facturación' },
  { key: 'reportes',    icon: 'bar_chart',    label: 'Reportes' },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#f8f9fc'}}>
    <style>{`@keyframes skPulse{0%,100%{opacity:.45}50%{opacity:.9}}.sk{background:#e2e8f0;border-radius:10px;animation:skPulse 1.5s ease-in-out infinite;}`}</style>
    <div style={{width:272,background:'#0f1f4a',padding:'1.75rem 1.25rem',display:'flex',flexDirection:'column',gap:'.75rem',flexShrink:0}}>
      <div className="sk" style={{width:140,height:32,background:'rgba(255,255,255,0.1)'}}/>
      <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>
        {[1,2,3,4,5,6,7].map(i=><div key={i} className="sk" style={{height:42,background:'rgba(255,255,255,0.06)'}}/>)}
      </div>
    </div>
    <div style={{flex:1,display:'flex',flexDirection:'column'}}>
      <div style={{height:68,background:'#fff',borderBottom:'1px solid #f1f5f9',padding:'0 2rem',display:'flex',alignItems:'center',gap:'1rem'}}>
        <div className="sk" style={{width:320,height:38}}/><div className="sk" style={{width:140,height:32,marginLeft:'auto'}}/>
      </div>
      <div style={{padding:'2rem',display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        <div className="sk" style={{width:200,height:28}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.25rem'}}>
          {[1,2,3,4].map(i=><div key={i} className="sk" style={{height:130,borderRadius:18}}/>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'1.25rem'}}>
          <div className="sk" style={{height:280,borderRadius:18}}/><div className="sk" style={{height:280,borderRadius:18}}/>
        </div>
      </div>
    </div>
  </div>
)

// ─── Placeholder pages ────────────────────────────────────────────────────────

const PlaceholderPage = ({ title, icon }: { title: string; icon: string }) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:'1rem',color:'#94a3b8',paddingTop:'4rem',animation:'pzIn .3s ease'}}>
    <style>{`@keyframes pzIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <span className="material-symbols-outlined" style={{fontSize:52,opacity:.35}}>{icon}</span>
    <p style={{fontWeight:700,fontSize:'1.1rem',color:'#334155'}}>{title}</p>
    <p style={{fontSize:'.85rem'}}>Esta sección estará disponible próximamente.</p>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const Dashboard = () => {
  const { slug } = useParams<{ slug: string }>()
  const { userName, logout } = useAuth()
  const { branding: initialBranding, loading: brandingLoading } = useBranding(slug)

  // Branding local — se actualiza sin refetch cuando el usuario guarda cambios
  const [branding, setBranding] = useState<Branding | null>(null)

  useEffect(() => {
    if (!brandingLoading && initialBranding) setBranding(initialBranding)
  }, [brandingLoading, initialBranding])

  const [activeNav,    setActiveNav]    = useState<NavKey>('dashboard')
  const [empresaOpen,  setEmpresaOpen]  = useState(false)
  const [logoutState,  setLogoutState]  = useState<'idle'|'loading'>('idle')

  const empresaRef = useRef<HTMLDivElement>(null)

  // Cerrar desplegable al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (empresaRef.current && !empresaRef.current.contains(e.target as Node)) {
        setEmpresaOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (brandingLoading || !branding) return <DashboardSkeleton />

  const handleLogout = async () => {
    setLogoutState('loading')
    await logout(slug)
  }

  const handleNavClick = (key: NavKey, hasChildren?: boolean) => {
    if (hasChildren) {
      setEmpresaOpen(prev => !prev)
      return
    }
    setActiveNav(key)
    if (!key.startsWith('empresa')) setEmpresaOpen(false)
  }

  const handleBrandingUpdated = (
    newColors: Branding['colors'],
    newLogoUrl: string
  ) => {
    setBranding(prev => prev ? { ...prev, logo: newLogoUrl, colors: newColors } : prev)
  }

  const { primary, secondary, tertiary, quaternary } = branding.colors

  const cssVars = {
    '--c-primary':      primary,
    '--c-secondary':    secondary,
    '--c-tertiary':     tertiary,
    '--c-sidebar':      quaternary,
    '--c-primary-10':   `color-mix(in srgb, ${primary} 10%, transparent)`,
    '--c-primary-20':   `color-mix(in srgb, ${primary} 20%, transparent)`,
    '--c-primary-30':   `color-mix(in srgb, ${primary} 30%, transparent)`,
  } as React.CSSProperties

  const isEmpresaActive = activeNav.startsWith('empresa')

  return (
    <div style={cssVars} className="db-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .db-root { display:flex; height:100vh; overflow:hidden; font-family:'Plus Jakarta Sans',sans-serif; background:#f8f9fc; color:#1e293b; animation:dbFadeIn .3s ease; }
        @keyframes dbFadeIn{from{opacity:0}to{opacity:1}}

        /* ══ SIDEBAR ══ */
        .db-sidebar { width:272px; background:var(--c-sidebar); display:flex; flex-direction:column; flex-shrink:0; }
        .db-sidebar__brand { padding:1.75rem 1.5rem 1.25rem; display:flex; align-items:center; gap:.875rem; border-bottom:1px solid rgba(255,255,255,.06); }
        .db-sidebar__brand-icon { background:var(--c-primary); padding:.45rem; border-radius:12px; box-shadow:0 4px 14px var(--c-primary-30); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .db-sidebar__brand-icon img { width:28px; height:28px; object-fit:contain; border-radius:6px; }
        .db-sidebar__brand-name { color:#fff; font-size:1.15rem; font-weight:700; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .db-sidebar__nav { flex:1; padding:1.25rem 1rem; display:flex; flex-direction:column; gap:.15rem; overflow-y:auto; }
        .db-sidebar__nav::-webkit-scrollbar{display:none;}

        /* ── Nav items base ── */
        .db-nav-item { display:flex; align-items:center; gap:.875rem; padding:.8rem 1rem; border-radius:12px; cursor:pointer; color:rgba(255,255,255,.45); font-size:.875rem; font-weight:500; transition:background .15s, color .15s; border:none; background:transparent; width:100%; text-align:left; }
        .db-nav-item .material-symbols-outlined { font-size:21px; flex-shrink:0; }
        .db-nav-item:hover { background:rgba(255,255,255,.07); color:rgba(255,255,255,.85); }
        .db-nav-item--active { background:rgba(255,255,255,.11) !important; color:#fff !important; font-weight:600; }
        .db-nav-item--active .db-nav-item__icon { color:var(--c-primary); }
        .db-nav-item--empresa-open { background:rgba(255,255,255,.07); color:rgba(255,255,255,.85); }

        .db-nav-item__chevron { margin-left:auto; font-size:17px !important; transition:transform .2s; opacity:.6; }
        .db-nav-item__chevron--open { transform:rotate(180deg); }

        /* ── Empresa submenu ── */
        .db-submenu {
          overflow:hidden; max-height:0;
          transition:max-height .28s cubic-bezier(.4,0,.2,1), opacity .2s ease;
          opacity:0;
        }
        .db-submenu--open { max-height:300px; opacity:1; }

        .db-submenu-inner { display:flex; flex-direction:column; gap:.1rem; padding:.25rem 0 .5rem .75rem; }

        .db-sub-item {
          display:flex; align-items:center; gap:.7rem;
          padding:.65rem .875rem; border-radius:10px;
          cursor:pointer; color:rgba(255,255,255,.38); font-size:.825rem; font-weight:500;
          transition:background .15s, color .15s; border:none; background:transparent; width:100%; text-align:left;
        }
        .db-sub-item .material-symbols-outlined { font-size:17px; flex-shrink:0; }
        .db-sub-item:hover { background:rgba(255,255,255,.06); color:rgba(255,255,255,.75); }
        .db-sub-item--active { background:rgba(255,255,255,.09) !important; color:#fff !important; font-weight:600; }
        .db-sub-item--active .material-symbols-outlined { color:var(--c-primary); }

        .db-sub-item__tag { margin-left:auto; font-size:.6rem; font-weight:800; padding:.15rem .45rem; border-radius:99px; background:var(--c-primary); color:#fff; letter-spacing:.04em; text-transform:uppercase; }

        /* ── Sidebar footer ── */
        .db-sidebar__footer { padding:1rem; border-top:1px solid rgba(255,255,255,.06); }
        .db-user-card { display:flex; align-items:center; gap:.75rem; padding:.875rem; background:rgba(255,255,255,.07); border-radius:14px; }
        .db-user-card__avatar { width:36px; height:36px; border-radius:50%; border:2px solid color-mix(in srgb, var(--c-primary) 50%, transparent); flex-shrink:0; background:#1e293b; display:flex; align-items:center; justify-content:center; }
        .db-user-card__name { color:#fff; font-size:.85rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px; }
        .db-user-card__role { color:rgba(255,255,255,.4); font-size:.72rem; }
        .db-logout-btn { margin-left:auto; background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); display:flex; align-items:center; transition:color .15s, background .15s; flex-shrink:0; padding:.3rem; border-radius:8px; }
        .db-logout-btn:hover:not(:disabled) { color:#f87171; background:rgba(248,113,113,.1); }
        .db-logout-btn:disabled { opacity:.5; cursor:not-allowed; }
        .db-logout-btn .material-symbols-outlined { font-size:19px; }
        .db-logout-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.2); border-top-color:rgba(255,255,255,.7); border-radius:50%; animation:spin .7s linear infinite; }
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ══ MAIN ══ */
        .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .db-header { height:68px; background:#fff; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; padding:0 2rem; gap:1.25rem; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .db-header__search { flex:1; max-width:400px; position:relative; }
        .db-header__search .material-symbols-outlined { position:absolute; left:.875rem; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:19px; pointer-events:none; }
        .db-header__search input { width:100%; padding:.65rem 1rem .65rem 2.6rem; background:#f8fafc; border:1.5px solid #f1f5f9; border-radius:11px; font-family:'Plus Jakarta Sans',sans-serif; font-size:.85rem; color:#1e293b; outline:none; transition:border-color .15s, box-shadow .15s; }
        .db-header__search input::placeholder{color:#94a3b8;}
        .db-header__search input:focus { border-color:var(--c-primary); box-shadow:0 0 0 3px var(--c-primary-10); }
        .db-header__actions { display:flex; align-items:center; gap:.625rem; margin-left:auto; }
        .db-header__workspace { display:flex; align-items:center; gap:.45rem; background:#f8fafc; border:1px solid #f1f5f9; padding:.45rem .8rem; border-radius:10px; font-size:.8rem; font-weight:600; color:#334155; cursor:pointer; transition:background .15s; }
        .db-header__workspace:hover{background:#f1f5f9;}
        .db-header__workspace .dot { width:7px; height:7px; border-radius:50%; background:var(--c-tertiary); flex-shrink:0; }
        .db-header__workspace .material-symbols-outlined{font-size:15px;color:#94a3b8;}
        .db-header__icon-btn { width:38px; height:38px; border-radius:10px; border:none; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748b; transition:background .15s, color .15s; position:relative; }
        .db-header__icon-btn:hover{background:#f1f5f9;color:var(--c-primary);}
        .db-header__icon-btn .material-symbols-outlined{font-size:21px;}
        .db-notif-dot { position:absolute; top:7px; right:7px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:2px solid #fff; }

        /* ══ CONTENT ══ */
        .db-content { flex:1; overflow-y:auto; padding:1.75rem 2rem 3rem; display:flex; flex-direction:column; gap:1.75rem; }
        .db-content::-webkit-scrollbar{width:4px;}
        .db-content::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}

        .db-page-title{font-size:1.4rem;font-weight:700;color:#0f172a;letter-spacing:-.03em;}
        .db-page-sub{font-size:.85rem;color:#64748b;margin-top:.2rem;}

        /* KPI */
        .db-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;}
        @media(max-width:1200px){.db-kpi-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:680px){.db-kpi-grid{grid-template-columns:1fr}}
        .db-kpi-card{background:#fff;border-radius:18px;padding:1.4rem;border:1px solid #f1f5f9;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:box-shadow .15s,transform .15s;}
        .db-kpi-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08);transform:translateY(-2px);}
        .db-kpi-card__top{display:flex;justify-content:space-between;align-items:flex-start;}
        .db-kpi-card__label{font-size:.75rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;}
        .db-kpi-card__value{font-size:1.9rem;font-weight:700;color:#0f172a;letter-spacing:-.04em;line-height:1;}
        .db-kpi-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .db-kpi-icon .material-symbols-outlined{font-size:22px;}
        .db-kpi-footer{margin-top:1.1rem;display:flex;align-items:center;gap:.5rem;}
        .db-kpi-badge{font-size:.73rem;font-weight:700;padding:.18rem .5rem;border-radius:99px;}
        .db-mini-bars{display:flex;align-items:flex-end;gap:3px;height:26px;flex:1;}
        .db-mini-bar{flex:1;border-radius:3px 3px 0 0;}
        .db-mini-progress{flex:1;height:5px;background:#f1f5f9;border-radius:99px;overflow:hidden;}
        .db-mini-progress__fill{height:100%;border-radius:99px;}

        /* Two col */
        .db-two-col{display:grid;grid-template-columns:1fr 360px;gap:1.25rem;}
        @media(max-width:1100px){.db-two-col{grid-template-columns:1fr}}

        /* Cards */
        .db-card{background:#fff;border-radius:18px;border:1px solid #f1f5f9;box-shadow:0 2px 8px rgba(0,0,0,.04);overflow:hidden;}
        .db-card__header{padding:1.25rem 1.5rem;border-bottom:1px solid #f8fafc;display:flex;justify-content:space-between;align-items:center;}
        .db-card__title{font-size:.95rem;font-weight:700;color:#0f172a;}
        .db-card__sub{font-size:.775rem;color:#94a3b8;margin-top:1px;}
        .db-card__action{font-size:.78rem;font-weight:600;color:#64748b;background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:.375rem .8rem;cursor:pointer;transition:background .15s;}
        .db-card__action:hover{background:#f1f5f9;}

        /* Table */
        .db-table{width:100%;border-collapse:collapse;}
        .db-table th{padding:.8rem 1.5rem;text-align:left;font-size:.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.09em;background:#fafbfc;}
        .db-table td{padding:.9rem 1.5rem;font-size:.85rem;border-top:1px solid #f8fafc;}
        .db-table tr:hover td{background:#fafbfc;}
        .db-table__client{display:flex;align-items:center;gap:.7rem;}
        .db-table__initials{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;text-transform:uppercase;flex-shrink:0;}
        .db-table__name{font-weight:700;color:#0f172a;}
        .db-table__id{color:#94a3b8;font-weight:600;}
        .db-table__date{color:#64748b;}
        .db-table__amount{font-weight:700;color:#0f172a;}
        .db-status-badge{display:inline-flex;align-items:center;padding:.22rem .7rem;border-radius:99px;font-size:.7rem;font-weight:700;border:1px solid;}

        /* Billing */
        .db-billing-body{padding:1.25rem;}
        .db-donut-wrap{display:flex;justify-content:center;margin:1.25rem 0;}
        .db-donut{position:relative;width:148px;height:148px;}
        .db-donut svg{transform:rotate(-90deg);width:100%;height:100%;}
        .db-donut__center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .db-donut__pct{font-size:1.65rem;font-weight:700;color:#0f172a;letter-spacing:-.04em;line-height:1;}
        .db-donut__label{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.07em;margin-top:2px;}
        .db-billing-items{display:flex;flex-direction:column;gap:.7rem;margin-top:.75rem;}
        .db-billing-item{display:flex;align-items:center;justify-content:space-between;padding:.8rem .9rem;background:#f8fafc;border:1px solid #f1f5f9;border-radius:11px;}
        .db-billing-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
        .db-billing-item__left{display:flex;align-items:center;gap:.6rem;}
        .db-billing-item__name{font-size:.82rem;font-weight:700;color:#0f172a;}
        .db-billing-item__amount{font-size:.82rem;font-weight:700;color:#0f172a;}

        /* Chart */
        .db-chart-header{padding:1.25rem 1.5rem .75rem;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.875rem;}
        .db-chart-legend{display:flex;align-items:center;gap:1rem;}
        .db-chart-legend-item{display:flex;align-items:center;gap:.35rem;font-size:.75rem;font-weight:600;color:#64748b;}
        .db-chart-legend-dot{width:7px;height:7px;border-radius:50%;}
        .db-chart-select{background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:.3rem .7rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:600;color:#334155;outline:none;cursor:pointer;}
        .db-chart-body{padding:0 1.5rem 2.5rem;height:220px;display:flex;align-items:flex-end;gap:.875rem;position:relative;}
        .db-chart-body::before{content:'';position:absolute;inset:0 1.5rem 2.5rem;background:repeating-linear-gradient(to bottom,transparent,transparent calc(25% - 1px),#f1f5f9 calc(25% - 1px),#f1f5f9 25%);pointer-events:none;}
        .db-chart-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;position:relative;z-index:1;}
        .db-chart-bar{width:100%;border-radius:5px 5px 0 0;transition:opacity .15s;}
        .db-chart-bar:hover{opacity:.72;}
        .db-chart-month{position:absolute;bottom:-1.65rem;left:50%;transform:translateX(-50%);font-size:.65rem;font-weight:700;color:#94a3b8;letter-spacing:.04em;white-space:nowrap;}
      `}</style>

      {/* ══ SIDEBAR ══ */}
      <aside className="db-sidebar">
        <div className="db-sidebar__brand">
          <div className="db-sidebar__brand-icon">
            <img src={branding.logo} alt={branding.nombre} />
          </div>
          <span className="db-sidebar__brand-name">{branding.nombre}</span>
        </div>

        <nav className="db-sidebar__nav">
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const isOpen   = empresaOpen
              const isActive = isEmpresaActive
              return (
                <div key={item.key} ref={empresaRef}>
                  {/* Empresa parent button */}
                  <button
                    className={`db-nav-item ${isActive ? 'db-nav-item--active' : ''} ${isOpen && !isActive ? 'db-nav-item--empresa-open' : ''}`}
                    onClick={() => handleNavClick(item.key, true)}
                  >
                    <span className="material-symbols-outlined db-nav-item__icon">{item.icon}</span>
                    {item.label}
                    <span className={`material-symbols-outlined db-nav-item__chevron ${isOpen ? 'db-nav-item__chevron--open' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Submenu */}
                  <div className={`db-submenu ${isOpen ? 'db-submenu--open' : ''}`}>
                    <div className="db-submenu-inner">
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          className={`db-sub-item ${activeNav === child.key ? 'db-sub-item--active' : ''}`}
                          onClick={() => { setActiveNav(child.key); }}
                        >
                          <span className="material-symbols-outlined">{child.icon}</span>
                          {child.label}
                          {child.tag && <span className="db-sub-item__tag">{child.tag}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <button
                key={item.key}
                className={`db-nav-item ${activeNav === item.key ? 'db-nav-item--active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                <span className="material-symbols-outlined db-nav-item__icon">{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="db-sidebar__footer">
          <div className="db-user-card">
            <div className="db-user-card__avatar" style={{ background: `color-mix(in srgb, ${primary} 30%, #1e293b)` }}>
              <span style={{ color:'#fff', fontSize:'.8rem', fontWeight:800 }}>
                {userName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ overflow:'hidden' }}>
              <p className="db-user-card__name">{userName || 'Usuario'}</p>
              <p className="db-user-card__role">Administrador</p>
            </div>
            <button className="db-logout-btn" onClick={handleLogout}
              disabled={logoutState === 'loading'} title="Cerrar sesión">
              {logoutState === 'loading'
                ? <div className="db-logout-spinner" />
                : <span className="material-symbols-outlined">logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="db-main">
        <header className="db-header">
          <div className="db-header__search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Buscar clientes, facturas o contratos…" />
          </div>
          <div className="db-header__actions">
            <div className="db-header__workspace">
              <span className="dot" /> Workspace Alpha
              <span className="material-symbols-outlined">unfold_more</span>
            </div>
            <button className="db-header__icon-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="db-notif-dot" />
            </button>
            <button className="db-header__icon-btn">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* ── CONTENT ROUTER ── */}
        <div className="db-content">

          {/* ── Personalización ── */}
          {activeNav === 'empresa/personalizacion' && (
            <Personalizacion
              currentLogo={branding.logo}
              currentNombre={branding.nombre}
              currentColors={branding.colors}
              slug={slug ?? ''}
              onBrandingUpdated={handleBrandingUpdated}
            />
          )}

          {/* ── Placeholders de las otras páginas ── */}
          {activeNav === 'empresa/info' && <PlaceholderPage title="Información general" icon="info" />}
          {activeNav === 'empresa/usuarios' && <PlaceholderPage title="Usuarios y roles" icon="group" />}
          {activeNav === 'empresa/facturacion' && <PlaceholderPage title="Facturación y plan" icon="credit_card" />}
          {activeNav === 'inventario'  && <PlaceholderPage title="Inventario"  icon="inventory_2" />}
          {activeNav === 'contratos'   && <PlaceholderPage title="Contratos"   icon="description" />}
          {activeNav === 'facturacion' && <PlaceholderPage title="Facturación" icon="receipt_long" />}
          {activeNav === 'reportes'    && <PlaceholderPage title="Reportes"    icon="bar_chart" />}

          {/* ── Panel Principal ── */}
          {activeNav === 'dashboard' && (<>
            <div>
              <h1 className="db-page-title">Panel Principal</h1>
              <p className="db-page-sub">Resumen de actividad — {branding.nombre}</p>
            </div>

            {/* KPI Cards */}
            <div className="db-kpi-grid">
              <div className="db-kpi-card">
                <div className="db-kpi-card__top">
                  <div><p className="db-kpi-card__label">Contratos Activos</p><p className="db-kpi-card__value">1,240</p></div>
                  <div className="db-kpi-icon" style={{background:`color-mix(in srgb,${tertiary} 12%,transparent)`}}>
                    <span className="material-symbols-outlined" style={{color:tertiary}}>description</span>
                  </div>
                </div>
                <div className="db-kpi-footer">
                  <span className="db-kpi-badge" style={{background:`color-mix(in srgb,${tertiary} 12%,transparent)`,color:tertiary}}>+12%</span>
                  <div className="db-mini-bars">
                    {[40,60,50,90].map((h,i)=><div key={i} className="db-mini-bar" style={{height:`${h}%`,background:i===3?tertiary:`color-mix(in srgb,${tertiary} 25%,transparent)`}}/>)}
                  </div>
                </div>
              </div>

              <div className="db-kpi-card">
                <div className="db-kpi-card__top">
                  <div><p className="db-kpi-card__label">Facturas Pendientes</p><p className="db-kpi-card__value">48</p></div>
                  <div className="db-kpi-icon" style={{background:`color-mix(in srgb,${primary} 12%,transparent)`}}>
                    <span className="material-symbols-outlined" style={{color:primary}}>pending_actions</span>
                  </div>
                </div>
                <div className="db-kpi-footer" style={{flexDirection:'column',alignItems:'stretch',gap:'.35rem'}}>
                  <div className="db-mini-progress"><div className="db-mini-progress__fill" style={{width:'68%',background:primary}}/></div>
                  <span style={{fontSize:'.72rem',fontWeight:700,color:primary}}>68% requieren atención</span>
                </div>
              </div>

              <div className="db-kpi-card">
                <div className="db-kpi-card__top">
                  <div><p className="db-kpi-card__label">Ingresos Mensuales</p><p className="db-kpi-card__value">$12,500</p></div>
                  <div className="db-kpi-icon" style={{background:`color-mix(in srgb,${secondary} 12%,transparent)`}}>
                    <span className="material-symbols-outlined" style={{color:secondary}}>payments</span>
                  </div>
                </div>
                <div className="db-kpi-footer">
                  <div className="db-mini-bars">
                    {[30,70,50,100,60,80].map((h,i)=><div key={i} className="db-mini-bar" style={{height:`${h}%`,background:i===3?secondary:`color-mix(in srgb,${secondary} 35%,transparent)`}}/>)}
                  </div>
                </div>
              </div>

              <div className="db-kpi-card">
                <div className="db-kpi-card__top">
                  <div><p className="db-kpi-card__label">Tasa de Retención</p><p className="db-kpi-card__value">98%</p></div>
                  <div style={{position:'relative',width:48,height:48}}>
                    <svg viewBox="0 0 48 48" style={{width:'100%',height:'100%',transform:'rotate(-90deg)'}}>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4.5"/>
                      <circle cx="24" cy="24" r="20" fill="none" stroke={tertiary} strokeWidth="4.5"
                        strokeDasharray={`${2*Math.PI*20}`} strokeDashoffset={`${2*Math.PI*20*.02}`} strokeLinecap="round"/>
                    </svg>
                    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:'.6rem',fontWeight:800,color:tertiary}}>98%</span>
                    </div>
                  </div>
                </div>
                <p style={{marginTop:'1.1rem',fontSize:'.73rem',color:'#94a3b8',fontWeight:500}}>+2.4% que el mes pasado</p>
              </div>
            </div>

            {/* Table + Billing */}
            <div className="db-two-col">
              <div className="db-card">
                <div className="db-card__header">
                  <div><p className="db-card__title">Gestión de Contratos</p><p className="db-card__sub">Listado de actividades recientes</p></div>
                  <button className="db-card__action">Ver todos</button>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="db-table">
                    <thead><tr><th>Cliente</th><th>ID</th><th>Fecha</th><th>Monto</th><th style={{textAlign:'center'}}>Estado</th></tr></thead>
                    <tbody>
                      {MOCK_CONTRACTS.map(row=>{
                        const ic=INITIALS_COLORS[row.color]; const st=STATUS_STYLES[row.status]
                        return (
                          <tr key={row.id}>
                            <td><div className="db-table__client"><div className="db-table__initials" style={{background:ic.bg,color:ic.text}}>{row.initials}</div><span className="db-table__name">{row.client}</span></div></td>
                            <td><span className="db-table__id">{row.id}</span></td>
                            <td><span className="db-table__date">{row.date}</span></td>
                            <td><span className="db-table__amount">{row.amount}</span></td>
                            <td style={{textAlign:'center'}}><span className="db-status-badge" style={{background:st.bg,color:st.text,borderColor:st.border}}>{row.status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="db-card">
                <div className="db-card__header"><div><p className="db-card__title">Estado de Facturación</p></div></div>
                <div className="db-billing-body">
                  <div className="db-donut-wrap">
                    <div className="db-donut">
                      <svg viewBox="0 0 148 148">
                        <circle cx="74" cy="74" r="58" fill="none" stroke="#f1f5f9" strokeWidth="18"/>
                        <circle cx="74" cy="74" r="58" fill="none" stroke={secondary} strokeWidth="18"
                          strokeDasharray={`${2*Math.PI*58}`} strokeDashoffset={`${2*Math.PI*58*.25}`} strokeLinecap="round"/>
                      </svg>
                      <div className="db-donut__center"><span className="db-donut__pct">75%</span><span className="db-donut__label">Cerradas</span></div>
                    </div>
                  </div>
                  <div className="db-billing-items">
                    <div className="db-billing-item">
                      <div className="db-billing-item__left"><div className="db-billing-dot" style={{background:secondary}}/><span className="db-billing-item__name">Facturas Cerradas</span></div>
                      <span className="db-billing-item__amount">$45,200</span>
                    </div>
                    <div className="db-billing-item">
                      <div className="db-billing-item__left"><div className="db-billing-dot" style={{background:primary}}/><span className="db-billing-item__name">Facturas Abiertas</span></div>
                      <span className="db-billing-item__amount">$12,800</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="db-card">
              <div className="db-chart-header">
                <div><p className="db-card__title">Flujo de Caja</p><p className="db-card__sub">Tendencia mensual de ingresos y egresos</p></div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div className="db-chart-legend">
                    <div className="db-chart-legend-item"><div className="db-chart-legend-dot" style={{background:secondary}}/> Ingresos</div>
                    <div className="db-chart-legend-item"><div className="db-chart-legend-dot" style={{background:`color-mix(in srgb,${primary} 45%,transparent)`}}/> Egresos</div>
                  </div>
                  <select className="db-chart-select"><option>Últimos 8 meses</option><option>Últimos 12 meses</option></select>
                </div>
              </div>
              <div className="db-chart-body">
                {[{month:'ENE',income:60,expense:38},{month:'FEB',income:73,expense:53},{month:'MAR',income:55,expense:33},{month:'ABR',income:80,expense:46},{month:'MAY',income:93,expense:27},{month:'JUN',income:87,expense:60},{month:'JUL',income:73,expense:40},{month:'AGO',income:67,expense:33}].map(col=>(
                  <div key={col.month} className="db-chart-col">
                    <div className="db-chart-bar" style={{height:`${col.expense}%`,background:`color-mix(in srgb,${primary} 35%,transparent)`}}/>
                    <div className="db-chart-bar" style={{height:`${col.income}%`,background:secondary}}/>
                    <span className="db-chart-month">{col.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </>)}

        </div>
      </main>
    </div>
  )
}

export default Dashboard