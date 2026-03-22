// src/hooks/usePermisos.ts
// Hook para verificar permisos en el frontend

/**
 * Guarda los permisos en localStorage después del login:
 *   localStorage.setItem('permisos', JSON.stringify(data.permisos))
 *
 * Luego usa este hook en cualquier componente para verificar acceso.
 */
export const usePermisos = () => {
  const raw = localStorage.getItem('permisos')
  const permisos: string[] = raw ? JSON.parse(raw) : []

  /**
   * Verifica si el usuario tiene un permiso específico.
   * 
   * Uso:
   *   puede('inventario.ver')              → true/false
   *   puede('inventario.productos.editar') → true/false
   */
  const puede = (clave: string): boolean => permisos.includes(clave)

  /**
   * Verifica si el usuario tiene TODOS los permisos del array.
   * 
   * Uso:
   *   puedeTodo(['contratos.ver', 'contratos.crear'])
   */
  const puedeTodo = (claves: string[]): boolean =>
    claves.every(c => permisos.includes(c))

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos.
   * 
   * Uso:
   *   puedeAlguno(['reportes.ver', 'reportes.contables'])
   */
  const puedeAlguno = (claves: string[]): boolean =>
    claves.some(c => permisos.includes(c))

  return { permisos, puede, puedeTodo, puedeAlguno }
}