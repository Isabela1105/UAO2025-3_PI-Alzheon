import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

export const useAuth = () => {
  const authState = useSelector((state: RootState) => state.auth)
  const userState = useSelector((state: RootState) => state.user)

  const isAuthenticated = authState.status === 'authenticated'
  const isPatient = userState.rol?.toLowerCase() === 'paciente'
  const isCuidador = userState.rol?.toLowerCase() === 'cuidador/familiar'
  const isMedico = userState.rol?.toLowerCase() === 'medico'

  return {
    status: authState.status,
    errorMessage: authState.errorMessage,
    user: userState,
    isAuthenticated,
    isPatient,
    isCuidador,
    isMedico,
  }
}
