import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  id: string | null
  nombre: string | null
  email: string | null
  rol: string | null
}

const initialState: UserState = {
  id: null,
  nombre: null,
  email: null,
  rol: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.id = action.payload._id || action.payload.id
      state.nombre = action.payload.nombre
      state.email = action.payload.email
      state.rol = action.payload.rol
    },
    clearUser: (state) => {
      state.id = null
      state.nombre = null
      state.email = null
      state.rol = null
    }
  }
})

// Action creators are generated for each case reducer function
export const { setUser, clearUser } = userSlice.actions
