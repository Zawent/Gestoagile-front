import { useState, useEffect, useCallback } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────
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

// ─── Helper API ────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL ?? "/api";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("access_token"); // ✅ corregido
    const slug = localStorage.getItem("empresa_slug");

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

// ─── Modal Rol ─────────────────────────────────────────────────────────────────
interface RolModalProps {
    rol: Rol | null;
    onClose: () => void;
    onSaved: () => void;
}

function RolModal({ rol, onClose, onSaved }: RolModalProps) {
    const [nombre, setNombre] = useState(rol?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(rol?.descripcion ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
        setLoading(true);
        try {
            if (rol) {
                await apiFetch(`roles/${rol.id}`, { method: "PUT", body: JSON.stringify({ nombre, descripcion }) });
            } else {
                await apiFetch("roles", { method: "POST", body: JSON.stringify({ nombre, descripcion }) });
            }
            onSaved();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rp-overlay" onClick={onClose}>
            <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="rp-modal__title">{rol ? "Editar rol" : "Nuevo rol"}</h3>

                <label className="rp-label">Nombre</label>
                <input className="rp-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cajero, Supervisor…" />

                <label className="rp-label">Descripción</label>
                <input className="rp-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Breve descripción del rol" />

                {error && <p className="rp-error">{error}</p>}

                <div className="rp-modal__footer">
                    <button className="rp-btn rp-btn--ghost" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button className="rp-btn rp-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando…" : rol ? "Guardar cambios" : "Crear rol"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Asignar Rol ─────────────────────────────────────────────────────────
interface AsignarRolModalProps {
    usuario: Usuario;
    roles: Rol[];
    onClose: () => void;
    onSaved: () => void;
}

function AsignarRolModal({ usuario, roles, onClose, onSaved }: AsignarRolModalProps) {
    const [rolId, setRolId] = useState<number | "">(usuario.rol?.id ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        if (rolId === "") { setError("Selecciona un rol."); return; }
        setLoading(true);
        try {
            await apiFetch(`users/${usuario.id}/rol`, { method: "PUT", body: JSON.stringify({ rol_id: rolId }) });
            onSaved();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rp-overlay" onClick={onClose}>
            <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="rp-modal__title">Asignar rol</h3>
                <p className="rp-modal__subtitle">
                    {usuario.name} {usuario.last_name}
                    <span className="rp-email">{usuario.email}</span>
                </p>

                <label className="rp-label">Rol</label>
                <select className="rp-input" value={rolId} onChange={(e) => setRolId(Number(e.target.value))}>
                    <option value="">— Selecciona un rol —</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
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

// ─── Componente principal ──────────────────────────────────────────────────────
export default function RolesPanel() {
    const [tab, setTab] = useState<"roles" | "usuarios">("roles");
    const [roles, setRoles] = useState<Rol[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);

    const [modalRol, setModalRol] = useState<Rol | null | undefined>(undefined);
    const [modalUsuario, setModalUsuario] = useState<Usuario | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rol | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const cargarRoles = useCallback(async () => {
        setLoadingRoles(true);
        try {
            const data = await apiFetch<Rol[]>("roles");
            console.log('cargarRoles response:', data, Array.isArray(data)); // <-- agrega esto
            setRoles(Array.isArray(data) ? data : []); // <-- fix defensivo
        }
        catch (e) { console.error('cargarRoles error:', e); }
        finally { setLoadingRoles(false); }
    }, []);

    const cargarUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        try {
            const data = await apiFetch<Usuario[]>("users");
            console.log('cargarUsuarios response:', data, Array.isArray(data));
            setUsuarios(Array.isArray(data) ? data : []); // <-- fix defensivo
        }
        catch (e) { console.error('cargarUsuarios error:', e); }
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
                    <p className="rp-subtitle">Gestiona los roles de tu empresa y asígnalos a los usuarios</p>
                </div>
                {tab === "roles" && (
                    <button className="rp-btn rp-btn--primary" onClick={() => setModalRol(null)}>
                        <span className="material-symbols-outlined">add</span>
                        Nuevo rol
                    </button>
                )}
            </div>

            <div className="rp-tabs">
                {(["roles", "usuarios"] as const).map((t) => (
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
                        <div className="rp-state"><div className="rp-spinner" />Cargando roles…</div>
                    ) : roles.length === 0 ? (
                        <div className="rp-state">
                            <span className="material-symbols-outlined">shield_question</span>
                            <p>No hay roles creados. Crea el primero.</p>
                        </div>
                    ) : (
                        <div className="rp-list">
                            {roles.map((rol) => (
                                <div key={rol.id} className="rp-card">
                                    <div className="rp-card__info">
                                        <span className="rp-badge">{rol.nombre.charAt(0).toUpperCase()}</span>
                                        <div>
                                            <p className="rp-card__name">{rol.nombre}</p>
                                            <p className="rp-card__desc">{rol.descripcion ?? "Sin descripción"}</p>
                                        </div>
                                    </div>
                                    <div className="rp-card__actions">
                                        <button className="rp-icon-btn rp-icon-btn--edit" title="Editar" onClick={() => setModalRol(rol)}>
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
                        <div className="rp-state"><div className="rp-spinner" />Cargando usuarios…</div>
                    ) : usuarios.length === 0 ? (
                        <div className="rp-state">
                            <span className="material-symbols-outlined">group_off</span>
                            <p>No hay usuarios en esta empresa.</p>
                        </div>
                    ) : (
                        <div className="rp-list">
                            {usuarios.map((u) => (
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

            {/* ── Modal crear/editar rol ── */}
            {modalRol !== undefined && (
                <RolModal
                    rol={modalRol}
                    onClose={() => setModalRol(undefined)}
                    onSaved={() => {
                        setModalRol(undefined);
                        showToast(modalRol === null ? "Rol creado." : "Rol actualizado.");
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
                    onSaved={() => {
                        setModalUsuario(null);
                        showToast("Rol asignado correctamente.");
                        cargarUsuarios();
                    }}
                />
            )}

            {/* ── Modal confirmar eliminación ── */}
            {deleteTarget && (
                <div className="rp-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="rp-modal rp-modal--danger" onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined rp-modal__warn-icon">warning</span>
                        <h3 className="rp-modal__title">¿Eliminar rol?</h3>
                        <p className="rp-modal__subtitle">
                            Estás a punto de eliminar <strong>"{deleteTarget.nombre}"</strong>. Esta acción no se puede deshacer.
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

// ─── CSS — adaptado al fondo claro del Dashboard ──────────────────────────────
const CSS = `
.rp-wrap { padding: 0; max-width: 860px; }

/* Header */
.rp-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; }
.rp-title  { font-size:1.4rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; letter-spacing:-.03em; }
.rp-subtitle { font-size:.85rem; color:#64748b; margin:0; }

/* Tabs */
.rp-tabs { display:flex; gap:.4rem; margin-bottom:1.25rem; border-bottom:1px solid #f1f5f9; padding-bottom:.5rem; }
.rp-tab  { display:flex; align-items:center; gap:.4rem; padding:.45rem .9rem; border:none; border-radius:8px; background:transparent; color:#94a3b8; font-size:.85rem; font-weight:500; cursor:pointer; transition:background .15s,color .15s; font-family:inherit; }
.rp-tab .material-symbols-outlined { font-size:1.05rem; }
.rp-tab:hover { background:#f1f5f9; color:#334155; }
.rp-tab--active { background:#f1f5f9; color:#0f172a; font-weight:600; }

/* Cards */
.rp-list { display:flex; flex-direction:column; gap:.5rem; }
.rp-card {
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
  padding:.875rem 1.1rem;
  background:#fff;
  border:1px solid #f1f5f9;
  border-radius:12px;
  box-shadow:0 1px 3px rgba(0,0,0,.04);
  transition:box-shadow .15s, border-color .15s;
}
.rp-card:hover { border-color:#e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,.07); }
.rp-card__info { display:flex; align-items:center; gap:.8rem; flex:1; min-width:0; }
.rp-card__name { font-weight:600; font-size:.9rem; color:#0f172a; margin:0 0 .1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rp-card__desc { font-size:.78rem; color:#94a3b8; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rp-card__actions { display:flex; gap:.4rem; flex-shrink:0; }
.rp-card__right  { display:flex; align-items:center; gap:.75rem; flex-shrink:0; }

.rp-badge  { width:36px; height:36px; background:var(--c-primary,#E3342F); border-radius:9px; display:grid; place-items:center; font-weight:700; font-size:.9rem; color:#fff; flex-shrink:0; }
.rp-avatar { width:36px; height:36px; background:var(--c-secondary,#38C172); border-radius:50%; display:grid; place-items:center; font-weight:700; font-size:.9rem; color:#fff; flex-shrink:0; }

.rp-rol-chip {
  padding:.2rem .65rem; border-radius:99px;
  font-size:.73rem; font-weight:600;
  background:#f1f5f9; color:#475569;
  border:1px solid #e2e8f0;
  white-space:nowrap;
}

/* Icon buttons */
.rp-icon-btn { width:32px; height:32px; border:none; border-radius:8px; display:grid; place-items:center; cursor:pointer; transition:background .15s; }
.rp-icon-btn .material-symbols-outlined { font-size:1rem; }
.rp-icon-btn--edit   { background:#eff6ff; color:#3b82f6; }
.rp-icon-btn--edit:hover   { background:#dbeafe; }
.rp-icon-btn--delete { background:#fef2f2; color:#ef4444; }
.rp-icon-btn--delete:hover { background:#fee2e2; }

/* Buttons */
.rp-btn {
  display:inline-flex; align-items:center; gap:.35rem;
  padding:.48rem 1rem; border-radius:8px; border:none;
  font-size:.83rem; font-weight:600; cursor:pointer;
  font-family:inherit;
  transition:opacity .15s, background .15s, box-shadow .15s;
}
.rp-btn .material-symbols-outlined { font-size:1rem; }
.rp-btn--primary { background:var(--c-primary,#E3342F); color:#fff; box-shadow:0 2px 8px color-mix(in srgb,var(--c-primary,#E3342F) 25%,transparent); }
.rp-btn--primary:hover { opacity:.88; }
.rp-btn--ghost { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
.rp-btn--ghost:hover { background:#f1f5f9; }
.rp-btn--outline { background:#fff; color:#475569; border:1px solid #e2e8f0; }
.rp-btn--outline:hover { background:#f8fafc; border-color:#cbd5e1; }
.rp-btn--danger { background:#ef4444; color:#fff; }
.rp-btn--danger:hover { background:#dc2626; }
.rp-btn--sm { padding:.3rem .7rem; font-size:.78rem; }
.rp-btn:disabled { opacity:.5; cursor:not-allowed; }

/* Form elements */
.rp-label {
  display:block; font-size:.75rem; font-weight:600;
  color:#64748b; margin:.9rem 0 .3rem;
  text-transform:uppercase; letter-spacing:.05em;
}
.rp-input {
  width:100%; box-sizing:border-box;
  padding:.6rem .875rem;
  background:#f8fafc;
  border:1.5px solid #e2e8f0;
  border-radius:9px;
  color:#0f172a;
  font-size:.88rem;
  font-family:inherit;
  outline:none;
  transition:border-color .15s, box-shadow .15s;
}
.rp-input::placeholder { color:#94a3b8; }
.rp-input:focus { border-color:var(--c-primary,#E3342F); background:#fff; box-shadow:0 0 0 3px color-mix(in srgb,var(--c-primary,#E3342F) 10%,transparent); }
.rp-error { color:#ef4444; font-size:.82rem; margin-top:.5rem; }

/* Modal */
.rp-overlay {
  position:fixed; inset:0;
  background:rgba(15,23,42,.4);
  backdrop-filter:blur(4px);
  display:grid; place-items:center;
  z-index:1000;
  animation:rp-fadein .15s ease;
}
.rp-modal {
  background:#fff;
  border:1px solid #f1f5f9;
  border-radius:16px;
  padding:1.75rem;
  width:100%; max-width:420px;
  box-shadow:0 20px 60px rgba(0,0,0,.15);
  animation:rp-slidein .2s ease;
}
@keyframes rp-slidein { from { opacity:0; transform:translateY(8px) scale(.98); } to { opacity:1; transform:none; } }
.rp-modal--danger { text-align:center; }
.rp-modal__warn-icon { font-size:2.5rem; color:#f59e0b; display:block; margin-bottom:.5rem; }
.rp-modal__title { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0 0 .2rem; }
.rp-modal__subtitle {
  font-size:.85rem; color:#64748b; margin:0 0 .5rem;
  display:flex; flex-direction:column; gap:.15rem;
}
.rp-email { font-size:.78rem; color:#94a3b8; }
.rp-modal__footer { display:flex; justify-content:flex-end; gap:.6rem; margin-top:1.4rem; }
.rp-modal__footer--center { justify-content:center; }

/* States */
.rp-section {}
.rp-state {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:.75rem; padding:3rem;
  color:#94a3b8; font-size:.9rem;
}
.rp-state .material-symbols-outlined { font-size:2.5rem; opacity:.35; }
.rp-spinner {
  width:26px; height:26px;
  border:3px solid #f1f5f9;
  border-top-color:var(--c-primary,#E3342F);
  border-radius:50%;
  animation:rp-spin .7s linear infinite;
}
@keyframes rp-spin { to { transform:rotate(360deg); } }

/* Toast */
.rp-toast {
  position:fixed; bottom:1.5rem; right:1.5rem;
  background:#1e293b; color:#f1f5f9;
  padding:.7rem 1.2rem; border-radius:10px;
  font-size:.85rem; font-family:inherit;
  border-left:3px solid var(--c-secondary,#38C172);
  box-shadow:0 8px 24px rgba(0,0,0,.2);
  z-index:2000;
  animation:rp-fadein .2s ease;
}
@keyframes rp-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
`;