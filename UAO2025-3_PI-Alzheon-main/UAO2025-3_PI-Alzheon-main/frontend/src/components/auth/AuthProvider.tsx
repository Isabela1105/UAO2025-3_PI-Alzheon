import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store/store'
import { checkAuthStatus } from '../../store/thunks/authThunk'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useSelector((state: RootState) => state.auth)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Solo verificar autenticación UNA VEZ al cargar la aplicación
    if (!hasInitialized.current && authState.status === 'checking') {
      hasInitialized.current = true
      dispatch(checkAuthStatus())
    }
  }, [dispatch, authState.status])

  return <>{children}</>
}
