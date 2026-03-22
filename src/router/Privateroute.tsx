import { Navigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'

interface PrivateRouteProps { children: ReactNode }

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { slug } = useParams<{ slug: string }>()
  const token    = localStorage.getItem('access_token')

  if (!token) {
    const savedSlug = slug ?? localStorage.getItem('empresa_slug')
    return <Navigate to={savedSlug ? `/${savedSlug}/login` : '/loginEmpresa'} replace />
  }

  return <>{children}</>
}

export default PrivateRoute