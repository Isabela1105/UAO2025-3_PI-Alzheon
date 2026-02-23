

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5500'

export interface UserResponse {
  _id: string
  nombre: string
  email: string
  rol: string
}

export const fetchRegister = async (form: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Error al registrar el usuario')
  }

  const data = await response.json()
  return data
}

export const fetchLogin = async (credentials: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })

  if (response.status === 401) {
    throw new Error('El usuario o la contraseña son incorrectas. Intentalo de nuevo')
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData?.msg || 'Error de autenticación')
  }

  return true
}

export const fetchLogout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData?.msg || 'No se pudo cerrar la sesion')
  }
}

export const fetchUserInfo = async (): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/user`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('No se pudo obtener la información del usuario')
  }

  const data = await response.json()
  return data
}

export const fetchUserById = async (user_id: string): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${user_id}`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('No se pudo obtener la información del usuario por ID')
  }

  const data = await response.json()
  return data
}

export const fetchDeleteUser = async (id: string) => {
   try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Error al eliminar el usuario')
    }

    return true
  } catch (error) {
    if (error instanceof Error) return false
  }
}

export const fetchUpdateUser = async (id: string, data: FormData | Record<string, unknown>) => {
  const isFormData = data instanceof FormData
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? data : JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData?.error || 'Error al actualizar el usuario')
  }

  const updatedUser = await response.json()
  return updatedUser
}

export const fetchVerifyCookie = async() => {
  const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: 'GET',
    credentials: 'include'
  })
  if (!response.ok) {
    throw new Error('No autenticado')
  }
  const data = await response.json()
  return data
}
