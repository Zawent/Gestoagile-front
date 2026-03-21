/**
 * useAuth — hook centralizado de autenticación
 */

import { useNavigate } from 'react-router-dom'

const SESSION_KEYS = [
  'access_token',
  'user_id',
  'user_name',
  'user_email',
  'user_rol_id',
  'user_rol_nombre',  // <-- NUEVO
  'empresa_id',
  'empresa_slug',
  'empresa_nombre',
] as const

export const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
  sessionStorage.clear()
}

export const useAuth = () => {
  const navigate = useNavigate()

  const token         = localStorage.getItem('access_token')
  const userName      = localStorage.getItem('user_name')      ?? ''
  const userEmail     = localStorage.getItem('user_email')     ?? ''
  const userRolNombre = localStorage.getItem('user_rol_nombre') ?? '' // <-- NUEVO
  const empresaSlug   = localStorage.getItem('empresa_slug')   ?? ''
  const empresaNombre = localStorage.getItem('empresa_nombre') ?? ''

  const isAuthenticated = Boolean(token)

  /**
   * Compara el rol del usuario actual contra un nombre de rol.
   * La comparación es case-insensitive para evitar errores de capitalización.
   *
   * Uso:
   *   hasRol('Administrador') → true/false
   */
  const hasRol = (nombre: string): boolean =>
    userRolNombre.toLowerCase() === nombre.toLowerCase()

  const logout = async (slug?: string) => {
    const currentSlug = slug ?? empresaSlug

    if (token) {
      try {
        await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch {
        console.warn('No se pudo revocar el token en el servidor.')
      }
    }

    clearSession()
    navigate('/loginEmpresa', { replace: true })
  }

  return {
    isAuthenticated,
    userName,
    userEmail,
    userRolNombre,  // <-- NUEVO: el nombre del rol ("Administrador", "Usuario", etc.)
    hasRol,         // <-- NUEVO: helper para chequear roles fácilmente
    empresaSlug,
    empresaNombre,
    logout,
  }
}