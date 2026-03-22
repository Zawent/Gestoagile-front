// src/api/client.ts
// ─── Cliente HTTP centralizado ─────────────────────────────────────────────────
// Todas las peticiones autenticadas pasan por aquí.
// La URL base se lee del .env: VITE_API_URL=http://127.0.0.1:8000/api

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token')
  const slug  = localStorage.getItem('empresa_slug')

  const url = path.startsWith('http')
    ? path                          // URL absoluta (raro, pero por si acaso)
    : `${BASE}/${slug}/${path}`     // http://127.0.0.1:8000/api/pizzeria-napoli/roles

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (data as { message?: string }).message ?? `Error ${res.status}`
    )
  }
  return data as T
}

// Para peticiones públicas (login, branding) que no llevan slug ni token
export async function publicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE}/${path}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      ...(options.headers as Record<string, string>),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (data as { message?: string }).message ?? `Error ${res.status}`
    )
  }
  return data as T
}