// src/hooks/useAuth.ts
import { useNavigate } from 'react-router-dom'

const SESSION_KEYS = [
  'access_token',
  'user_id',
  'user_name',
  'user_email',
  'user_rol_id',
  'user_rol_nombre',
  'empresa_id',
  'empresa_slug',
  'empresa_nombre',
  'permisos',
] as const

export const clearSession = () => {
  SESSION_KEYS.forEach(key => localStorage.removeItem(key))
  sessionStorage.clear()
}

export const useAuth = () => {
  const navigate = useNavigate()

  const token         = localStorage.getItem('access_token')
  const userName      = localStorage.getItem('user_name')       ?? ''
  const userEmail     = localStorage.getItem('user_email')      ?? ''
  const userRolNombre = localStorage.getItem('user_rol_nombre') ?? ''
  const empresaSlug   = localStorage.getItem('empresa_slug')    ?? ''
  const empresaNombre = localStorage.getItem('empresa_nombre')  ?? ''

  const isAuthenticated = Boolean(token)

  const hasRol = (nombre: string): boolean =>
    userRolNombre.toLowerCase() === nombre.toLowerCase()

  const logout = async (slug?: string) => {
    const BASE = import.meta.env.VITE_API_URL ?? '/api'
    if (token) {
      try {
        await fetch(`${BASE}/auth/logout`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })
      } catch {
        console.warn('No se pudo revocar el token.')
      }
    }
    clearSession()
    navigate('/loginEmpresa', { replace: true })
  }

  return { isAuthenticated, userName, userEmail, userRolNombre, hasRol, empresaSlug, empresaNombre, logout }
}