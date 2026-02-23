import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../../components/primitives/LoadingSpinner'

export const MedicoRoute = () => {
  const { status, isMedico } = useAuth()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600">
        <LoadingSpinner />
      </div>
    )
  }

  if (status === 'not authenticated') {
    return <Navigate to="/login" replace />
  }

  if (!isMedico) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
