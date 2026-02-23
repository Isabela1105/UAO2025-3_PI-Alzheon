import { createSlice } from '@reduxjs/toolkit'

enum states {
  // eslint-disable-next-line no-unused-vars
  AUTHENTICATED = 'authenticated', NOT_AUTHENTICATED = 'not authenticated', CHECKING = 'checking'
}

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: states.CHECKING,
    errorMessage: null
  },

  reducers: {
    login: (state) => {
      state.status = states.AUTHENTICATED
      state.errorMessage = null
    },

    logout: (state, {payload}) => {
      state.status = states.NOT_AUTHENTICATED
      state.errorMessage = payload.errorMessage ?? null
    },

    checkingCredentials: (state) => {
      state.status = states.CHECKING
      state.errorMessage = null
    }
  },
})

// Action creators are generated for each case reducer function
export const { checkingCredentials, login, logout } = authSlice.actions
