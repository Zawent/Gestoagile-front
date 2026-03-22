import { useState, useEffect, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Rol {
    id: number;
    nombre: string;
    descripcion: string | null;
    created_at: string;
}

interface Usuario {
    id: number;
    name: string;
    last_name: string | null;
    email: string;
    telefono: string | null;
    esta_activo: boolean;
    rol: { id: number; nombre: string } | null;
}

interface PermisoCatalogo {
    id: number;
    clave: string;
    nombre: string;
    modulo: string;
}

// ─── Helper API ───────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL ?? "/api";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("access_token");
    const slug  = localStorage.getItem("empresa_slug");
    const res = await fetch(`${BASE}/${slug}/${path}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
            ...(options.headers as Record<string, string>),
        },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { message?: string }).message ?? "Error desconocido");
    return data as T;
}

// ─── Modal Crear/Editar Rol con permisos ──────────────────────────────────────
interface RolModalProps {
    rol: Rol | null;
    onClose: () => void;
    onSaved: () => void;
}

function RolModal({ rol, onClose, onSaved }: RolModalProps) {
    const [nombre,      setNombre]      = useState(rol?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(rol?.descripcion ?? "");
    const [catalogo,    setCatalogo]    = useState<PermisoCatalogo[]>([]);
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const [loadingPermisos, setLoadingPermisos] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    useEffect(() => {
        // Cargar catálogo de permisos y (si editando) permisos actuales del rol
        const fetchData = async () => {
            setLoadingPermisos(true);
            try {
                const catalogoData = await apiFetch<{ permisos: PermisoCatalogo[] }>("permisos");
                setCatalogo(catalogoData.permisos);

                if (rol) {
                    // Obtener permisos actuales del rol via endpoint
                    const rolData = await apiFetch<{ permisos: string[] }>(`roles/${rol.id}/permisos`);
                    setSeleccionados(rolData.permisos ?? []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPermisos(false);
            }
        };
        fetchData();
    }, [rol]);

    const togglePermiso = (clave: string) => {
        setSeleccionados(prev =>
            prev.includes(clave) ? prev.filter(c => c !== clave) : [...prev, clave]
        );
    };

    const toggleModulo = (claves: string[]) => {
        const todasSeleccionadas = claves.every(c => seleccionados.includes(c));
        if (todasSeleccionadas) {
            setSeleccionados(prev => prev.filter(c => !claves.includes(c)));
        } else {
            setSeleccionados(prev => [...new Set([...prev, ...claves])]);
        }
    };

    const handleSubmit = async () => {
        setError("");
        if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
        setLoading(true);
        try {
            let rolId: number;
            if (rol) {
                await apiFetch(`roles/${rol.id}`, {
                    method: "PUT",
                    body: JSON.stringify({ nombre, descripcion }),
                });
                rolId = rol.id;
            } else {
                const nuevo = await apiFetch<{ id: number }>(`roles`, {
                    method: "POST",
                    body: JSON.stringify({ nombre, descripcion }),
                });
                rolId = nuevo.id;
            }

            // Guardar permisos del rol
            await apiFetch(`roles/${rolId}/permisos`, {
                method: "PUT",
                body: JSON.stringify({ permisos: seleccionados }),
            });

            onSaved();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Agrupar catálogo por módulo
    const porModulo = catalogo.reduce((acc, p) => {
        if (!acc[p.modulo]) acc[p.modulo] = [];
        acc[p.modulo].push(p);
        return acc;
    }, {} as Record<string, PermisoCatalogo[]>);

    return (
        <div className="rp-overlay" onClick={onClose}>
            <div className="rp-modal rp-modal--wide" onClick={e => e.stopPropagation()}>
                <h3 className="rp-modal__title">{rol ? "Editar rol" : "Nuevo rol"}</h3>

                <label className="rp-label">Nombre</label>
                <input className="rp-input" value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: Cajero, Supervisor…" />

                <label className="rp-label">Descripción</label>
                <input className="rp-input" value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Breve descripción del rol" />

                {/* ── Permisos ── */}
                <div className="rp-permisos-header">
                    <p className="rp-permisos-title">Permisos del rol</p>
                    <div style={{display:'flex',gap:'.5rem'}}>
                        <button type="button" className="rp-btn rp-btn--xs rp-btn--ghost"
                            onClick={() => setSeleccionados(catalogo.map(p => p.clave))}>
                            Todos
                        </button>
                        <button type="button" className="rp-btn rp-btn--xs rp-btn--ghost"
                            onClick={() => setSeleccionados([])}>
                            Ninguno
                        </button>
                    </div>
                </div>

                {loadingPermisos ? (
                    <div className="rp-state" style={{padding:'1.5rem'}}>
                        <div className="rp-spinner"/>Cargando permisos…
                    </div>
                ) : (
                    <div className="rp-permisos-body">
                        {Object.entries(porModulo).map(([modulo, perms]) => {
                            const clavesModulo = perms.map(p => p.clave);
                            const todasOn = clavesModulo.every(c => seleccionados.includes(c));
                            const algunaOn = clavesModulo.some(c => seleccionados.includes(c));

                            return (
                                <div key={modulo}>
                                    {/* Header de módulo con toggle masivo */}
                                    <div className="rp-modulo-header" onClick={() => toggleModulo(clavesModulo)}>
                                        <span className={`rp-modulo-check ${todasOn ? 'rp-modulo-check--on' : algunaOn ? 'rp-modulo-check--partial' : ''}`}>
                                            {todasOn ? '✓' : algunaOn ? '−' : ''}
                                        </span>
                                        <span className="rp-modulo-label">{modulo}</span>
                                        <span className="rp-modulo-count">
                                            {clavesModulo.filter(c => seleccionados.includes(c)).length}/{clavesModulo.length}
                                        </span>
                                    </div>
                                    {/* Permisos del módulo */}
                                    {perms.map(p => (
                                        <label key={p.clave} className={`rp-permiso-row ${seleccionados.includes(p.clave) ? 'rp-permiso-row--on' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="rp-checkbox"
                                                checked={seleccionados.includes(p.clave)}
                                                onChange={() => togglePermiso(p.clave)}
                                            />
                                            <span className="rp-permiso-nombre">{p.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}

                {error && <p className="rp-error">{error}</p>}

                <div className="rp-modal__footer">
                    <span style={{fontSize:'.78rem',color:'#94a3b8',marginRight:'auto'}}>
                        {seleccionados.length} permiso{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
                    </span>
                    <button className="rp-btn rp-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button className="rp-btn rp-btn--primary" onClick={handleSubmit} disabled={loading || loadingPermisos}>
                        {loading ? "Guardando…" : rol ? "Guardar cambios" : "Crear rol"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Asignar Rol ────────────────────────────────────────────────────────
interface AsignarRolModalProps {
    usuario: Usuario;
    roles: Rol[];
    onClose: () => void;
    onSaved: () => void;
}

function AsignarRolModal({ usuario, roles, onClose, onSaved }: AsignarRolModalProps) {
    const [rolId,   setRolId]   = useState(String(usuario.rol?.id ?? ""));
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    const handleSubmit = async () => {
        setError("");
        if (!rolId) { setError("Selecciona un rol."); return; }
        setLoading(true);
        try {
            await apiFetch(`users/${usuario.id}/rol`, {
                method: "PUT",
                body: JSON.stringify({ rol_id: Number(rolId) }),
            });
            onSaved();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rp-overlay" onClick={onClose}>
            <div className="rp-modal" onClick={e => e.stopPropagation()}>
                <h3 className="rp-modal__title">Asignar rol</h3>
                <p className="rp-modal__subtitle">
                    {usuario.name} {usuario.last_name}
                    <span className="rp-email">{usuario.email}</span>
                </p>

                <label className="rp-label">Rol</label>
                <select className="rp-input" value={rolId} onChange={e => setRolId(e.target.value)}>
                    <option value="">— Selecciona un rol —</option>
                    {roles.map(r => <option key={r.id} value={String(r.id)}>{r.nombre}</option>)}
                </select>

                {error && <p className="rp-error">{error}</p>}

                <div className="rp-modal__footer">
                    <button className="rp-btn rp-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button className="rp-btn rp-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando…" : "Asignar rol"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function RolesPanel() {
    const [tab,    setTab]    = useState<"roles" | "usuarios">("roles");
    const [roles,    setRoles]    = useState<Rol[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingRoles,    setLoadingRoles]    = useState(true);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);

    const [modalRol,     setModalRol]     = useState<Rol | null | undefined>(undefined);
    const [modalUsuario, setModalUsuario] = useState<Usuario | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rol | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError,   setDeleteError]   = useState("");
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const cargarRoles = useCallback(async () => {
        setLoadingRoles(true);
        try {
            const data = await apiFetch<Rol[]>("roles");
            setRoles(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingRoles(false); }
    }, []);

    const cargarUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        try {
            const data = await apiFetch<Usuario[]>("users");
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoadingUsuarios(false); }
    }, []);

    useEffect(() => { cargarRoles(); }, [cargarRoles]);
    useEffect(() => { if (tab === "usuarios") cargarUsuarios(); }, [tab, cargarUsuarios]);

    const confirmarEliminar = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        setDeleteError("");
        try {
            await apiFetch(`roles/${deleteTarget.id}`, { method: "DELETE" });
            setDeleteTarget(null);
            showToast("Rol eliminado correctamente.");
            cargarRoles();
        } catch (e) {
            setDeleteError((e as Error).message);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="rp-wrap">
            <style>{CSS}</style>

            <div className="rp-header">
                <div>
                    <h2 className="rp-title">Control de Roles</h2>
                    <p className="rp-subtitle">Gestiona los roles y sus permisos</p>
                </div>
                {tab === "roles" && (
                    <button className="rp-btn rp-btn--primary" onClick={() => setModalRol(null)}>
                        <span className="material-symbols-outlined">add</span>
                        Nuevo rol
                    </button>
                )}
            </div>

            <div className="rp-tabs">
                {(["roles", "usuarios"] as const).map(t => (
                    <button key={t} className={`rp-tab ${tab === t ? "rp-tab--active" : ""}`} onClick={() => setTab(t)}>
                        <span className="material-symbols-outlined">{t === "roles" ? "shield" : "group"}</span>
                        {t === "roles" ? "Roles" : "Usuarios"}
                    </button>
                ))}
            </div>

            {toast && <div className="rp-toast">{toast}</div>}

            {/* ── Tab Roles ── */}
            {tab === "roles" && (
                <div className="rp-section">
                    {loadingRoles ? (
                        <div className="rp-state"><div className="rp-spinner"/>Cargando roles…</div>
                    ) : roles.length === 0 ? (
                        <div className="rp-state">
                            <span className="material-symbols-outlined">shield_question</span>
                            <p>No hay roles creados. Crea el primero.</p>
                        </div>
                    ) : (
                        <div className="rp-list">
                            {roles.map(rol => (
                                <div key={rol.id} className="rp-card">
                                    <div className="rp-card__info">
                                        <span className="rp-badge">{rol.nombre.charAt(0).toUpperCase()}</span>
                                        <div>
                                            <p className="rp-card__name">{rol.nombre}</p>
                                            <p className="rp-card__desc">{rol.descripcion ?? "Sin descripción"}</p>
                                        </div>
                                    </div>
                                    <div className="rp-card__actions">
                                        <button className="rp-icon-btn rp-icon-btn--edit" title="Editar permisos" onClick={() => setModalRol(rol)}>
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button className="rp-icon-btn rp-icon-btn--delete" title="Eliminar" onClick={() => { setDeleteTarget(rol); setDeleteError(""); }}>
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab Usuarios ── */}
            {tab === "usuarios" && (
                <div className="rp-section">
                    {loadingUsuarios ? (
                        <div className="rp-state"><div className="rp-spinner"/>Cargando usuarios…</div>
                    ) : usuarios.length === 0 ? (
                        <div className="rp-state">
                            <span className="material-symbols-outlined">group_off</span>
                            <p>No hay usuarios en esta empresa.</p>
                        </div>
                    ) : (
                        <div className="rp-list">
                            {usuarios.map(u => (
                                <div key={u.id} className="rp-card">
                                    <div className="rp-card__info">
                                        <span className="rp-avatar">{u.name.charAt(0).toUpperCase()}</span>
                                        <div>
                                            <p className="rp-card__name">{u.name} {u.last_name}</p>
                                            <p className="rp-card__desc">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="rp-card__right">
                                        <span className="rp-rol-chip">{u.rol?.nombre ?? "Sin rol"}</span>
                                        <button className="rp-btn rp-btn--sm rp-btn--outline" onClick={() => setModalUsuario(u)}>
                                            <span className="material-symbols-outlined">manage_accounts</span>
                                            Cambiar rol
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Modal rol con permisos ── */}
            {modalRol !== undefined && (
                <RolModal
                    rol={modalRol}
                    onClose={() => setModalRol(undefined)}
                    onSaved={() => {
                        setModalRol(undefined);
                        showToast(modalRol === null ? "Rol creado con permisos." : "Rol actualizado.");
                        cargarRoles();
                    }}
                />
            )}

            {/* ── Modal asignar rol ── */}
            {modalUsuario && (
                <AsignarRolModal
                    usuario={modalUsuario}
                    roles={roles}
                    onClose={() => setModalUsuario(null)}
                    onSaved={() => { setModalUsuario(null); showToast("Rol asignado."); cargarUsuarios(); }}
                />
            )}

            {/* ── Modal confirmar eliminación ── */}
            {deleteTarget && (
                <div className="rp-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="rp-modal rp-modal--danger" onClick={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined rp-modal__warn-icon">warning</span>
                        <h3 className="rp-modal__title">¿Eliminar rol?</h3>
                        <p className="rp-modal__subtitle">
                            Estás a punto de eliminar <strong>"{deleteTarget.nombre}"</strong>. No se puede deshacer.
                        </p>
                        {deleteError && <p className="rp-error">{deleteError}</p>}
                        <div className="rp-modal__footer rp-modal__footer--center">
                            <button className="rp-btn rp-btn--ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                            <button className="rp-btn rp-btn--danger" onClick={confirmarEliminar} disabled={deleteLoading}>
                                {deleteLoading ? "Eliminando…" : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.rp-wrap { padding:0; max-width:860px; }
.rp-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; }
.rp-title    { font-size:1.4rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; letter-spacing:-.03em; }
.rp-subtitle { font-size:.85rem; color:#64748b; margin:0; }

.rp-tabs { display:flex; gap:.4rem; margin-bottom:1.25rem; border-bottom:1px solid #f1f5f9; padding-bottom:.5rem; }
.rp-tab  { display:flex; align-items:center; gap:.4rem; padding:.45rem .9rem; border:none; border-radius:8px; background:transparent; color:#94a3b8; font-size:.85rem; font-weight:500; cursor:pointer; transition:background .15s,color .15s; font-family:inherit; }
.rp-tab .material-symbols-outlined { font-size:1.05rem; }
.rp-tab:hover { background:#f1f5f9; color:#334155; }
.rp-tab--active { background:#f1f5f9; color:#0f172a; font-weight:600; }

.rp-list { display:flex; flex-direction:column; gap:.5rem; }
.rp-card { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.875rem 1.1rem; background:#fff; border:1px solid #f1f5f9; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.04); transition:box-shadow .15s,border-color .15s; }
.rp-card:hover { border-color:#e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,.07); }
.rp-card__info  { display:flex; align-items:center; gap:.8rem; flex:1; min-width:0; }
.rp-card__name  { font-weight:600; font-size:.9rem; color:#0f172a; margin:0 0 .1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rp-card__desc  { font-size:.78rem; color:#94a3b8; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rp-card__actions { display:flex; gap:.4rem; flex-shrink:0; }
.rp-card__right   { display:flex; align-items:center; gap:.75rem; flex-shrink:0; }

.rp-badge  { width:36px; height:36px; background:var(--c-primary,#E3342F); border-radius:9px; display:grid; place-items:center; font-weight:700; font-size:.9rem; color:#fff; flex-shrink:0; }
.rp-avatar { width:36px; height:36px; background:var(--c-secondary,#38C172); border-radius:50%; display:grid; place-items:center; font-weight:700; font-size:.9rem; color:#fff; flex-shrink:0; }
.rp-rol-chip { padding:.2rem .65rem; border-radius:99px; font-size:.73rem; font-weight:600; background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; white-space:nowrap; }

.rp-icon-btn { width:32px; height:32px; border:none; border-radius:8px; display:grid; place-items:center; cursor:pointer; transition:background .15s; }
.rp-icon-btn .material-symbols-outlined { font-size:1rem; }
.rp-icon-btn--edit   { background:#eff6ff; color:#3b82f6; }
.rp-icon-btn--edit:hover   { background:#dbeafe; }
.rp-icon-btn--delete { background:#fef2f2; color:#ef4444; }
.rp-icon-btn--delete:hover { background:#fee2e2; }

.rp-btn { display:inline-flex; align-items:center; gap:.35rem; padding:.48rem 1rem; border-radius:8px; border:none; font-size:.83rem; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s,background .15s; }
.rp-btn .material-symbols-outlined { font-size:1rem; }
.rp-btn--primary { background:var(--c-primary,#E3342F); color:#fff; }
.rp-btn--primary:hover { opacity:.88; }
.rp-btn--ghost   { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
.rp-btn--ghost:hover { background:#f1f5f9; }
.rp-btn--outline { background:#fff; color:#475569; border:1px solid #e2e8f0; }
.rp-btn--outline:hover { background:#f8fafc; }
.rp-btn--danger  { background:#ef4444; color:#fff; }
.rp-btn--danger:hover { background:#dc2626; }
.rp-btn--sm  { padding:.3rem .7rem; font-size:.78rem; }
.rp-btn--xs  { padding:.2rem .55rem; font-size:.72rem; }
.rp-btn:disabled { opacity:.5; cursor:not-allowed; }

.rp-label { display:block; font-size:.75rem; font-weight:600; color:#64748b; margin:.9rem 0 .3rem; text-transform:uppercase; letter-spacing:.05em; }
.rp-input { width:100%; box-sizing:border-box; padding:.6rem .875rem; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:9px; color:#0f172a; font-size:.88rem; font-family:inherit; outline:none; transition:border-color .15s; }
.rp-input:focus { border-color:var(--c-primary,#E3342F); background:#fff; }
.rp-error { color:#ef4444; font-size:.82rem; margin-top:.5rem; }

.rp-overlay { position:fixed; inset:0; background:rgba(15,23,42,.4); backdrop-filter:blur(4px); display:grid; place-items:center; z-index:1000; animation:rp-fadein .15s ease; }
.rp-modal { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:1.75rem; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,.15); animation:rp-slidein .2s ease; max-height:90vh; overflow-y:auto; }
.rp-modal--wide { max-width:660px; }
.rp-modal--danger { text-align:center; }
@keyframes rp-slidein { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:none} }
.rp-modal__warn-icon { font-size:2.5rem; color:#f59e0b; display:block; margin-bottom:.5rem; }
.rp-modal__title { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; }
.rp-modal__subtitle { font-size:.85rem; color:#64748b; margin:0 0 .5rem; display:flex; flex-direction:column; gap:.15rem; }
.rp-email { font-size:.78rem; color:#94a3b8; }
.rp-modal__footer { display:flex; justify-content:flex-end; gap:.6rem; margin-top:1.25rem; align-items:center; }
.rp-modal__footer--center { justify-content:center; }

/* Editor de permisos */
.rp-permisos-header { display:flex; align-items:center; justify-content:space-between; margin:1.25rem 0 .5rem; }
.rp-permisos-title  { font-size:.88rem; font-weight:700; color:#0f172a; }
.rp-permisos-body   { border:1px solid #f1f5f9; border-radius:10px; overflow:hidden; max-height:320px; overflow-y:auto; }

.rp-modulo-header { display:flex; align-items:center; gap:.6rem; padding:.5rem .875rem; background:#f8fafc; border-bottom:1px solid #f1f5f9; cursor:pointer; user-select:none; }
.rp-modulo-header:hover { background:#f1f5f9; }
.rp-modulo-label  { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#64748b; flex:1; }
.rp-modulo-count  { font-size:.7rem; color:#94a3b8; font-weight:600; }
.rp-modulo-check  { width:16px; height:16px; border-radius:4px; border:1.5px solid #cbd5e1; display:grid; place-items:center; font-size:.7rem; font-weight:700; color:#fff; flex-shrink:0; }
.rp-modulo-check--on      { background:var(--c-primary,#E3342F); border-color:var(--c-primary,#E3342F); }
.rp-modulo-check--partial { background:#94a3b8; border-color:#94a3b8; }

.rp-permiso-row { display:flex; align-items:center; gap:.65rem; padding:.42rem .875rem; border-bottom:1px solid #f8fafc; cursor:pointer; transition:background .1s; }
.rp-permiso-row:last-child { border-bottom:none; }
.rp-permiso-row:hover { background:#f8fafc; }
.rp-permiso-row--on { background:#f0fdf4; }
.rp-permiso-nombre { font-size:.8rem; color:#334155; }
.rp-checkbox { width:14px; height:14px; accent-color:var(--c-primary,#E3342F); cursor:pointer; flex-shrink:0; }

.rp-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:3rem; color:#94a3b8; font-size:.9rem; }
.rp-state .material-symbols-outlined { font-size:2.5rem; opacity:.35; }
.rp-spinner { width:26px; height:26px; border:3px solid #f1f5f9; border-top-color:var(--c-primary,#E3342F); border-radius:50%; animation:rp-spin .7s linear infinite; }
@keyframes rp-spin { to{transform:rotate(360deg)} }
.rp-toast { position:fixed; bottom:1.5rem; right:1.5rem; background:#1e293b; color:#f1f5f9; padding:.7rem 1.2rem; border-radius:10px; font-size:.85rem; font-family:inherit; border-left:3px solid var(--c-secondary,#38C172); box-shadow:0 8px 24px rgba(0,0,0,.2); z-index:2000; animation:rp-fadein .2s ease; }
@keyframes rp-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
`;