import { useNavigate } from 'react-router-dom'

export const Home = () => {
  const navigate = useNavigate()

  return (
    <div
      className="text-white overflow-x-hidden"
      style={{
        backgroundColor: '#0A1439',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* ── KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
        .marquee-track { animation: marqueeScroll 30s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── TOP NAVIGATION ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '1rem' }}>
        <nav
          style={{
            width: '100%',
            maxWidth: '80rem',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '1rem',
            background: 'rgba(27, 46, 88, 0.55)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ background: '#acc55f', padding: '0.4rem', borderRadius: '0.5rem', color: '#0A1439', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', fontWeight: 700 }}>inventory</span>
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Gesto<span style={{ color: '#acc55f' }}>Agile</span>
            </h2>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-links">
            {['Servicios', 'Impacto', 'Testimonios', 'Precios'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#acc55f')}
                onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/loginEmpresa')}
              style={{
                fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 1rem',
                background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer',
                borderRadius: '0.75rem', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/loginEmpresa')}
              style={{
                background: '#acc55f', color: '#0A1439', padding: '0.6rem 1.4rem',
                borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(172,197,95,0.3)',
                transition: 'transform 0.15s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#b8d066'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#acc55f'; }}
            >
              Prueba Gratis
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ width: '100%', backgroundColor: '#0A1439', position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '7rem', paddingBottom: '5rem' }}>
        {/* Glows */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(172,197,95,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40%', height: '60%', background: 'radial-gradient(ellipse at left bottom, rgba(121,180,194,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4rem', alignItems: 'center' }}>

          {/* Text column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.875rem', borderRadius: '9999px', background: 'rgba(172,197,95,0.1)', border: '1px solid rgba(172,197,95,0.25)', color: '#acc55f', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', width: 'fit-content' }}>
              <span style={{ position: 'relative', width: '0.5rem', height: '0.5rem', display: 'inline-flex' }}>
                <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '9999px', background: '#acc55f', opacity: 0.75 }} />
                <span style={{ position: 'relative', width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#acc55f', display: 'inline-flex' }} />
              </span>
              Logística Inteligente
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0 }}>
              Tu inventario más{' '}
              <br />
              <span style={{ color: '#acc55f', fontStyle: 'italic' }}>inteligente.</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '32rem', lineHeight: 1.7, margin: 0 }}>
              Aliado estratégico para la optimización de activos y trazabilidad. Simplificamos lo complejo para que tu logística fluya sin fricciones.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/loginEmpresa')}
                style={{
                  background: '#acc55f', color: '#0A1439', padding: '1rem 2rem',
                  borderRadius: '1rem', fontSize: '1rem', fontWeight: 700, border: 'none',
                  cursor: 'pointer', boxShadow: '0 8px 32px rgba(172,197,95,0.3)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#acc55f'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Empezar Prueba Gratuita
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
              </button>
              <button
                style={{
                  padding: '1rem 2rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(27,46,88,0.5)',
                  backdropFilter: 'blur(12px)', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(27,46,88,0.5)')}
              >
                Ver Demo
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>play_circle</span>
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex' }}>
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2Wkssv0Q4sN17058SQ9qjlqHJszqqCtqEKL2ZWDDfcZ5ycUaR5QMvTbEe13F1HrPhLuatTZn47-LLUNSmcJQJ-oi3xtMqBJsVdy75Zwo-OrMyUsdNh4DboNuK4D5A9NUapK2cy85L8NT7EmIeRZPuyzs3FhikFgEZnHHNSWE1_YXzKjDEzoqpyqhkZrQiXih4gL3FIHyIoEOiQwIy79l-Yk3y_v2VawuiaVCb598DW2iQgcfTOKnrC1t4Mn6jZkUwhPEuoHHUKEF7',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCYCNKSmsL2ipD-JtjMHtVTJ7bf7ic8VfxtxcNvs8YxGo6_1cpldfiE9Nz-ZGWMAUJ3FCaA7UzgSGWEwdjY6MnZFZDuf6zYk37n1DSdHUjFpNOFhz5OzvRbbI3kow1mj5jPS3lIkhKcW4QkRkw4zdEVP0hvuHiEsjXN0w461EyZ60ayyK6e106fS9IwtqXz-JKr2LpMcipyBiSiXYIsw3FceXXpCZQgkQoSXZggG5Xdm54BcdJlck2G1FiGwYoYYf_Mzd8P3TgCDuEN',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsS3BEv-xzA4hH3vO_P3vDC2KZr5-dySjmSetZxu33r6wSCsInK2qlrIrTg6_prnPsE4Lqyw6qEUV-Yw-d0x0odH7DIJHsZBPblGk-yVDvSulh9Zb34b_lOdtkg5fJCrwqRex-QDnBFyfsxLqFdiTrWjY6h8ytwQegbIMskuLdOtZ-M-W96j2l2LDn74iE9MXRDUSm1Zejy3KB2-N08WCSrnltfsgJh1BOpYj_AM1eSyfjQq7y8gK0oJaN6DXU-21-FVBq0W0aC9To',
                ].map((src, i) => (
                  <div key={i} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', border: '2px solid #0A1439', backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center', marginLeft: i === 0 ? 0 : '-0.75rem', backgroundColor: '#1e293b' }} />
                ))}
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', border: '2px solid #0A1439', background: '#acc55f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#0A1439', marginLeft: '-0.75rem' }}>
                  +2k
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500, margin: 0 }}>Confían en nosotros para su logística</p>
            </div>
          </div>

          {/* Dashboard preview */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-1rem', background: 'rgba(172,197,95,0.15)', filter: 'blur(3rem)', borderRadius: '9999px', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ width: '100%', aspectRatio: '4/3', backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkc_esTljQJ9l50qibswIHqTOZremD1uirHFzk8S1aRT_Xi69hIsi6qotfT3V0M3co036OA_OeBPCtURi4k86dHLxqHI8EIlz4S9N0-HQ3OvkQ9A3O1O6ctR9VMKCC3JxEsmVJzGLueF6nHTf3Uhwp4imyv1IqRavX7ynkWusycChhhM40zZaVk7ZmsWORMqC3mQsQG7fOr6xidEj51tbCedITZPO84nnX4iFuQSEjW6zWUqwqM7bkMH9s5ipiERRE74PT4OnBs1BX')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(27,46,88,0.5)' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.75rem 1rem', borderRadius: '1rem', background: 'rgba(27,46,88,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#e58346', fontSize: '1.1rem' }}>trending_up</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Eficiencia +42%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY MARQUEE ── */}
      <section style={{ width: '100%', backgroundColor: 'rgba(10,20,57,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 0', overflow: 'hidden' }}>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
          Empresas que confían en GestoAgile
        </p>
        <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div
            className="marquee-track"
            style={{ display: 'flex', width: 'max-content', gap: '2rem' }}
          >
            {[...['LOGISTIX', 'TECHFLOW', 'CARGOCO', 'GLOBALNET', 'SMARTMOVE', 'VELOCITY'], ...['LOGISTIX', 'TECHFLOW', 'CARGOCO', 'GLOBALNET', 'SMARTMOVE', 'VELOCITY']].map((brand, i) => (
              <div key={i} style={{ height: '3rem', width: '9rem', background: 'rgba(30,41,59,0.3)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, flexShrink: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
              >
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section id="servicios" style={{ width: '100%', backgroundColor: '#0A1439', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#acc55f', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Nuestros Servicios</p>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 3rem)', fontWeight: 700, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>Soluciones Estratégicas</h3>
            <p style={{ color: '#94a3b8', maxWidth: '40rem', margin: '0 auto', lineHeight: 1.7 }}>Combinamos tecnología de vanguardia con procesos optimizados para transformar tu cadena de suministro.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: 'inventory_2', color: '#acc55f', title: 'Control de Inventarios', desc: 'Gestión dinámica en tiempo real. Reduce mermas y optimiza el stock disponible automáticamente.' },
              { icon: 'route', color: '#e58346', title: 'Trazabilidad Total', desc: 'Seguimiento punto a punto con tecnología QR y RFID para visibilidad completa de la cadena.' },
              { icon: 'query_stats', color: '#79b4c2', title: 'Optimización Logística', desc: 'Algoritmos inteligentes para rutas eficientes y reducción de costos operativos en transporte.' },
              { icon: 'auto_awesome', color: '#f1b65a', title: 'Automatización de Reportes', desc: 'Informes ejecutivos automáticos. Recibe KPIs clave directamente en tu bandeja de entrada.' },
              { icon: 'hub', color: '#e2e8f0', title: 'Integración ERP', desc: 'Conexión nativa con SAP, Oracle y Microsoft Dynamics. Sincronización de datos bidireccional.' },
              { icon: 'support_agent', color: '#acc55f', title: 'Soporte 24/7', desc: 'Equipo de expertos disponible siempre. Asistencia técnica personalizada en tiempo récord.' },
            ].map(({ icon, color, title, desc }) => (
              <div
                key={title}
                style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(27,46,88,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'default', transition: 'transform 0.25s, border-color 0.25s', }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: `${color}18`, color, transition: 'transform 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.6rem' }}>{icon}</span>
                </div>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.625rem', margin: '0 0 0.625rem' }}>{title}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT METRICS ── */}
      <section id="impacto" style={{ width: '100%', backgroundColor: '#acc55f', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center', color: '#0A1439' }}>
          {[
            { value: '+40%', label: 'Eficiencia Operativa' },
            { value: '10k+', label: 'Usuarios Activos' },
            { value: '99.9%', label: 'Disponibilidad' },
            { value: '-25%', label: 'Costos de Inventario' },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 4vw, 3.75rem)', fontWeight: 700, letterSpacing: '-0.03em' }}>{value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.75 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonios" style={{ width: '100%', backgroundColor: '#0A1439', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
            <div>
              <p style={{ color: '#79b4c2', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Testimonios</p>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Lo que dicen nuestros clientes</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['arrow_back', 'arrow_forward'].map((icon) => (
                <button key={icon} style={{ width: '3rem', height: '3rem', borderRadius: '9999px', background: 'rgba(27,46,88,0.5)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#acc55f'; e.currentTarget.style.color = '#0A1439'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(27,46,88,0.5)'; e.currentTarget.style.color = 'white'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{icon}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollSnapType: 'x mandatory' }}>
            {[
              { quote: '"GestoAgile transformó por completo nuestra gestión de almacén. La integración con nuestro ERP fue impecable y ahora tenemos visibilidad real de cada palet."', name: 'Carlos Mendoza', role: 'Director de Operaciones, TechFlow', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCft5C-d6RZPTwSx_STxXCTvQp8eYdCvEbCPHmQCURToNANskudKWJYs0EyYfI61sav2ncGbVtF-heBGf436fyV-ZaM4EV2rJ8Pnyp6k8C_4VqXd5Rb23oykpW1wit8wGv1ZfiWZ8v5kD_fSYBXZ_Kj5uyj-Me_wYAOOqlTfyyIdtS3fx9dZuoD7_d3j3uNynY5MBloLLGBKQKncshXuGprnr4D-KqZ4Vr9Y8W-hgqNFri0QOkXyV6Uh8JJHHNUBEOCXAJgo4vaTRcK' },
              { quote: '"Los reportes automáticos nos ahorran más de 15 horas semanales de trabajo administrativo. Es la mejor inversión que hemos hecho este año."', name: 'Ana Rodríguez', role: 'Gerente de Logística, GlobalNet', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_2j50McivKXxj1ocoaLZSD7-HIo2pChQj-3iTDCb3N17SWBtg92mH6XC-CPFJJM5yY3NMvsFe0wfqXJ0ExVb2AR0-JkUbtS3GQSf2vVZ5yvkbhjetrtcDJZWb0TXBK79whuWZagu6tennYO_Jd6LN27h7Yrf1NfWg1crTJhhlMF9AZitYonPh9GP8Af8b-kANzLr17eSdUNZxqoAynnKwvppaoKM5p-9Lvb55OGMKgOEEq8s1V7rf4lNQ15JVl-TPhyU4pszMVSBZ' },
              { quote: '"El soporte 24/7 es real. Nos ayudaron con una incidencia un domingo a las 11 PM en menos de 10 minutos. Altamente recomendados."', name: 'Jorge Perales', role: 'CTO, SmartMove', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgLmVRPhlFmQonF0MPHZCzhptRJ3KsKzB9P3HQ1mA2aFSTr4HAGe9l_a6rBsIOlVA_x8c9r22W680XMCjpogIXPk4Yp-gzXJh37CFRZZy9PZmZ3zE85LXhlIzK-CihRjZKnA9do9ppSKNoxYBPbpX9Fu_xCh17PLVNF0G8Udoi3hE7oEdb0mpi3bHXnIFkswY8ZKtRytSevV271GAkYnU28bfTTbWFXdsftN38kU9Rp9-uFoZ7T98szTSyjlgC9HvuGmLVAfK05-VR' },
            ].map(({ quote, name, role, avatar }) => (
              <div key={name} style={{ minWidth: '26rem', flexShrink: 0, padding: '2.5rem', borderRadius: '1.5rem', background: 'rgba(27,46,88,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollSnapAlign: 'start' }}>
                <div style={{ display: 'flex', gap: '0.25rem', color: '#f1b65a' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.75, color: '#e2e8f0', margin: 0 }}>{quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundImage: `url('${avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.15rem' }}>{name}</h5>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="precios" style={{ width: '100%', backgroundColor: '#0A1439', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderRadius: '2.5rem', background: 'rgba(27,46,88,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '18rem', height: '18rem', background: 'rgba(172,197,95,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '18rem', height: '18rem', background: 'rgba(229,131,70,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <h2 style={{ position: 'relative', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 3.5rem)', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            ¿Listo para transformar<br />tu logística?
          </h2>
          <p style={{ position: 'relative', fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '36rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Únete a cientos de empresas que ya están optimizando su cadena de suministro con GestoAgile.
          </p>
          <div style={{ position: 'relative', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/loginEmpresa')}
              style={{ background: '#acc55f', color: '#0A1439', padding: '1.1rem 2.5rem', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 40px rgba(172,197,95,0.35)', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Empieza Gratis Hoy
            </button>
            <button
              style={{ padding: '1.1rem 2.5rem', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Hablar con un Experto
            </button>
          </div>
          <p style={{ position: 'relative', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>Sin tarjeta de crédito. Prueba completa de 14 días.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ width: '100%', backgroundColor: '#060e24', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '5rem 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '3rem', marginBottom: '4rem' }}>

            {/* Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ background: '#acc55f', padding: '0.4rem', borderRadius: '0.5rem', color: '#0A1439', display: 'flex' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', fontWeight: 700 }}>inventory</span>
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700 }}>
                  Gesto<span style={{ color: '#acc55f' }}>Agile</span>
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '20rem', margin: 0 }}>
                Especialistas en digitalización de procesos logísticos y trazabilidad inteligente.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['share', 'public', 'mail'].map((icon) => (
                  <a key={icon} href="#" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: 'rgba(27,46,88,0.6)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#acc55f')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Plataforma</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Características', 'Integraciones', 'Precios', 'Casos de Éxito'].map((link) => (
                  <li key={link}><a href="#" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#acc55f')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Compañía</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Sobre Nosotros', 'Blog', 'Carreras', 'Contacto'].map((link) => (
                  <li key={link}><a href="#" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#acc55f')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Newsletter</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Recibe las últimas novedades en logística y trazabilidad.</p>
              <input type="email" placeholder="tu@email.com"
                style={{ background: '#1B2E58', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'white', outline: 'none', width: '100%' }}
              />
              <button style={{ background: 'rgba(172,197,95,0.15)', color: '#acc55f', border: '1px solid rgba(172,197,95,0.3)', borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#acc55f'; e.currentTarget.style.color = '#0A1439'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,197,95,0.15)'; e.currentTarget.style.color = '#acc55f'; }}
              >
                Suscribirse
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>© 2024 GestoAgile. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {['Política de Privacidad', 'Términos de Servicio'].map((link) => (
                <a key={link} href="#" style={{ fontSize: '0.75rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                >{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home