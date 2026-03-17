import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginEmpresa = () => {
    const [slug, setSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [apiResponse, setApiResponse] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleIdentificar = async () => {
        if (!slug.trim()) return
        setLoading(true)
        setApiResponse(null)
        setError(null)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/identificar-empresa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: slug.trim() }),
            })

            const data = await response.json()
            setApiResponse(data)

            if (response.ok) {
                navigate(`/${data.slug}/login`)
            } else {
                setError(data?.message || data?.detail || 'Empresa no encontrada. Verifica el identificador.')
            }
        } catch {
            setError('No se pudo conectar con el servidor. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleIdentificar()
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#0A1439',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Keyframes & fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        .login-input:focus { outline: none; border-color: #acc55f !important; box-shadow: 0 0 0 3px rgba(172,197,95,0.2); }
        .login-input::placeholder { color: #334155; }
        .btn-primary:hover { background: #b8d066 !important; transform: translateY(-1px); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-back:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

            {/* Background orbs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(172,197,95,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(121,180,194,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* ── HEADER ── */}
            <header style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, padding: '1rem 1.5rem' }}>
                <nav style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <div style={{ background: '#acc55f', padding: '0.35rem', borderRadius: '0.5rem', display: 'flex' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', color: '#0A1439', fontWeight: 700 }}>inventory</span>
                        </div>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Gesto<span style={{ color: '#acc55f' }}>Agile</span>
                        </span>
                    </div>

                    {/* Back link */}
                    <button
                        className="btn-back"
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0.875rem', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
                        Volver al inicio
                    </button>
                </nav>
            </header>

            {/* ── MAIN CARD ── */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 2rem', position: 'relative', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '26rem' }}>
                    <div
                        style={{
                            background: 'rgba(27,46,88,0.45)',
                            backdropFilter: 'blur(18px)',
                            WebkitBackdropFilter: 'blur(18px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2rem',
                            padding: 'clamp(2rem, 5vw, 3rem)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Logo + heading */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div
                                style={{
                                    width: '5rem', height: '5rem',
                                    background: 'linear-gradient(135deg, #acc55f 0%, #79b4c2 100%)',
                                    borderRadius: '1.25rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 0 30px rgba(172,197,95,0.35)',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: '#0A1439', fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                            </div>
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 0.5rem', textAlign: 'center' }}>
                                Identificar Empresa
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                                Ingresa el identificador único de tu empresa para continuar
                            </p>
                        </div>

                        {/* Input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                                Identificador de empresa
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: '#475569' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>domain</span>
                                </div>
                                <input
                                    className="login-input"
                                    type="text"
                                    placeholder="ej: pizzeria-napoli"
                                    value={slug}
                                    onChange={(e) => { setSlug(e.target.value); setError(null) }}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(10,20,57,0.5)',
                                        border: `1px solid ${error ? '#e58346' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '1rem',
                                        padding: '1rem 1rem 1rem 3rem',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        fontWeight: 500,
                                        transition: 'all 0.2s',
                                    }}
                                />
                            </div>

                            {/* Error message */}
                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.625rem', color: '#e58346', fontSize: '0.8rem' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* CTA button */}
                        <button
                            className="btn-primary"
                            onClick={handleIdentificar}
                            disabled={loading || !slug.trim()}
                            style={{
                                width: '100%',
                                background: loading || !slug.trim() ? 'rgba(172,197,95,0.4)' : '#acc55f',
                                color: '#0A1439',
                                border: 'none',
                                borderRadius: '1rem',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: loading || !slug.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                boxShadow: slug.trim() && !loading ? '0 4px 20px rgba(172,197,95,0.3)' : 'none',
                                marginBottom: '1rem',
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined spin" style={{ fontSize: '1.1rem' }}>refresh</span>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    Continuar
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                                </>
                            )}
                        </button>

                        {/* Back button (mobile-friendly) */}
                        <button
                            className="btn-back"
                            onClick={() => navigate(-1)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                padding: '0.875rem',
                                color: '#94a3b8',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.375rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
                            Atrás
                        </button>
                    </div>

                    {/* Footer links */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                        {['Privacidad', 'Términos', 'Ayuda'].map((link) => (
                            <a key={link} href="#" style={{ fontSize: '0.75rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#acc55f')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </main>

            {/* ── LIVE SUPPORT WIDGET (solo desktop) ── */}
            <div style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 40 }}
                className="support-widget"
            >
                <style>{`
          @media (max-width: 768px) { .support-widget { display: none !important; } }
        `}</style>
                <div style={{ background: 'rgba(27,46,88,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '1.25rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '18rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', overflow: 'hidden', border: '2px solid rgba(172,197,95,0.3)', background: '#1e293b' }}>
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTt4nsH_ZYj7fSGbNhs5oD9HgxwBumNWBNWIAm1oHGNnT-K9e30y3KmmVPmt2lcdSAsTY1jJrWuWYbs48BVZXJsN8EtexxM5lCpnUtpwxYGYYcEOVaGMT3Ysg1BS18sYUyrw1iS9tltLfO8i5LpSXdvP5ZOWZ_S0hv71i8IpXHVXSaD54NUY9ujjE4tj032V4eevxGEUZySfV8Ek5-UfWLztvN-jrtrBlsphxTcwH1jK34u62tYHMhczJBAiga6rA5ovVSt1yBCkhH"
                                alt="Soporte"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '0.75rem', height: '0.75rem', background: '#acc55f', borderRadius: '9999px', border: '2px solid #0A1439' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.65rem', color: '#acc55f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.2rem' }}>Soporte en vivo</p>
                        <p style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500, margin: 0 }}>¿Necesitas ayuda para comenzar?</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ padding: '1.5rem', textAlign: 'center', color: '#334155', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                © 2024 GestoAgile Solutions. Todos los derechos reservados.
            </footer>
        </div>
    )
}