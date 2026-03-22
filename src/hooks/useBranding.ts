/**
 * useBranding — carga el branding de la empresa desde la API pública.
 *
 * - No requiere token (ruta pública GET /{slug}/branding)
 * - Lo usa tanto LoginUsuario como Dashboard
 * - Devuelve `loading: true` mientras espera, así los componentes
 *   pueden mostrar un skeleton y evitar el flash de estilos por defecto.
 * - Cachea el resultado en sessionStorage para evitar refetches innecesarios
 *   dentro de la misma sesión del navegador.
 */

import { useEffect, useState } from 'react'

export interface Branding {
  nombre: string
  logo: string
  colors: {
    primary:    string
    secondary:  string
    tertiary:   string
    quaternary: string
  }
}

export const FALLBACK_BRANDING: Branding = {
  nombre: 'Mi Empresa',
  logo:   'https://placehold.co/80x80/e68947/ffffff?text=ME',
  colors: {
    primary:    '#e58346',
    secondary:  '#79b4c2',
    tertiary:   '#acc55f',
    quaternary: '#0a1439',
  },
}

const API_BASE = 'http://127.0.0.1:8000/api'
const CACHE_KEY = (slug: string) => `branding_${slug}`

export const useBranding = (slug: string | undefined) => {
  const [branding, setBranding] = useState<Branding | null>(null) // null = aún no cargado
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    if (!slug) {
      setBranding(FALLBACK_BRANDING)
      setLoading(false)
      return
    }

    // ── Intentar desde caché de sesión primero ──────────────────────────────
    const cached = sessionStorage.getItem(CACHE_KEY(slug))
    if (cached) {
      try {
        setBranding(JSON.parse(cached))
        setLoading(false)
        return
      } catch {
        sessionStorage.removeItem(CACHE_KEY(slug))
      }
    }

    // ── Fetch real ──────────────────────────────────────────────────────────
    let cancelled = false

    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE}/${slug}/branding`)
        if (!res.ok) throw new Error()
        const data: Branding = await res.json()

        if (!cancelled) {
          // Normalizar colores nulos que el back pueda devolver
          const normalized: Branding = {
            ...data,
            colors: {
              primary:    data.colors.primary    ?? FALLBACK_BRANDING.colors.primary,
              secondary:  data.colors.secondary  ?? FALLBACK_BRANDING.colors.secondary,
              tertiary:   data.colors.tertiary   ?? FALLBACK_BRANDING.colors.tertiary,
              quaternary: data.colors.quaternary ?? FALLBACK_BRANDING.colors.quaternary,
            },
          }

          sessionStorage.setItem(CACHE_KEY(slug), JSON.stringify(normalized))
          setBranding(normalized)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setBranding(FALLBACK_BRANDING)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBranding()
    return () => { cancelled = true }
  }, [slug])

  return { branding: branding ?? FALLBACK_BRANDING, loading, error }
}