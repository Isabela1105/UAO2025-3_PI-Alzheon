import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoutes = () => {
  const { status } = useSelector((state:any ) => state.auth)

  if (status === 'checking') {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  if (status === 'not authenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
