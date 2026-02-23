import { checkingCredentials, login, logout } from '../slices/authSlice'
import { toast } from 'sonner'
import { AppDispatch } from '../store'
import { fetchLogin, fetchRegister, fetchUserInfo, fetchVerifyCookie } from '../../lib/api'
import { setUser } from '../slices/userSlice'

export const startRegister = (form: Record<string, unknown>) => {
  return async(dispatch: AppDispatch) => {
    dispatch(checkingCredentials())
    try {
      await fetchRegister(form)

      await dispatch(startLogin({
        email: form.email,
        login_password: form.password
      }))

      toast.success('Usuario registrado exitosamente')
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
      throw error
    }
  }
}

export const startLogin = (form: Record<string, unknown>) => {
  return async(dispatch: AppDispatch) => {
    dispatch(checkingCredentials())

    try {
      await fetchLogin({
        email: String(form.email),
        password: String(form.login_password || form.password)
      })
      dispatch(login())

      const userData = await fetchUserInfo()
      dispatch(setUser(userData))
      return true
    } catch (error) {
      if(error instanceof Error) {
        dispatch(logout({errorMessage: error.message}))
        toast.error(error.message)
        return false
      }
    }
  }
}

// verify if a cookie is active to stay in session
export const checkAuthStatus = () => {
  return async (dispatch: AppDispatch) => {
    // Ya viene con status 'checking' del estado inicial
    try {
      const userData = await fetchVerifyCookie()

      dispatch(login())
      dispatch(setUser(userData.user))
    } catch (error) {
      if (error instanceof Error) dispatch(logout({ errorMessage: error.message }))
    }
  }
}
