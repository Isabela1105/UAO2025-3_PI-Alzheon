import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { RootState } from '../../store/store'

export const PatientRoute = () => {
  const authState = useSelector((state: RootState) => state.auth)
  const userState = useSelector((state: RootState) => state.user)

  if (authState.status === 'checking') {
    return (
      <div className="min-h-screen patient-gradient-bg flex items-center justify-center text-white">
        <div className="glass-panel px-10 py-6 text-center">
          <p className="text-lg font-semibold tracking-wide">Confirmando la sesión...</p>
        </div>
      </div>
    )
  }

  if (authState.status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (userState.rol?.toLowerCase() !== 'paciente') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
