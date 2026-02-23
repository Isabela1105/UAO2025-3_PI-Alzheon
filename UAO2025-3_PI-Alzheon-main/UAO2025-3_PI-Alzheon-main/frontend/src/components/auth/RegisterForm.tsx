import { useForm } from '../../hooks/useForm'
import { startRegister } from '../../store/thunks/authThunk'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store/store'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface props {
  onBackToLogin: () => void
}

export const RegisterForm: React.FC<props> = ({onBackToLogin}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const {nombre, email, rol, password, confirm, form, handleInputChange, handleReset, errors, validateForm} = useForm({
    nombre: '',
    email: '',
    rol: '',
    password: '',
    confirm: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const {confirm, ...inputs} = form

    try {
      await dispatch(startRegister({...inputs}))
      handleReset()
      setLoading(false)
      navigate('/app')
    } catch (error) {
      setLoading(false)
      onBackToLogin()
    }
  }

  const backgroundImage = "/background.jpg"

  return (
    <div className="min-h-screen relative bg-[#13172b]">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={backgroundImage} 
          alt="Mountain landscape" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Register Container */}
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="w-[450px] h-[600px] relative">
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 rounded-[34px]">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[34px] border border-white/20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-[34px]"></div>
          </div>
          
          {/* Content */}
          <div className="relative flex flex-col items-center pt-[30px] px-[60px] pb-[30px] h-full">
            {/* Title */}
            <h1 className="text-[30px] font-extrabold text-black text-center mb-[12px] leading-none">
              Registro
            </h1>
            
            {/* Line separator */}
            <div className="w-[320px] h-[1px] bg-black/20 mb-[12px]"></div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-[320px]">
              {/* Name Input */}
              <div className="relative">
                <input
                  type="text"
                  name="nombre"
                  value={nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full h-[50px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[16px] font-medium placeholder-white/48 border-none outline-none"
                  required
                />
                {errors.nombre && <span className="text-red-300 text-xs mt-1">{errors.nombre}</span>}
              </div>
              
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Correo"
                  className="w-full h-[50px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[16px] font-medium placeholder-white/48 border-none outline-none"
                  required
                />
                {errors.email && <span className="text-red-300 text-xs mt-1">{errors.email}</span>}
              </div>

              {/* Role Selector */}
              <div className="relative">
                <select
                  name="rol"
                  value={rol}
                  onChange={handleInputChange}
                  className="w-full h-[50px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[16px] font-medium border-none outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-gray-800 text-white">Seleccionar Rol</option>
                  <option value="paciente" className="bg-gray-800 text-white">Paciente</option>
                  <option value="cuidador/familiar" className="bg-gray-800 text-white">Cuidador</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-4 h-4 text-white/48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.rol && <span className="text-red-300 text-xs mt-1">{errors.rol}</span>}
              </div>
              
              {/* Password Input */}
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  className="w-full h-[50px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[16px] font-medium placeholder-white/48 border-none outline-none"
                  required
                />
                {errors.password && <span className="text-red-300 text-xs mt-1">{errors.password}</span>}
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  type="password"
                  name="confirm"
                  value={confirm}
                  onChange={handleInputChange}
                  placeholder="Confirmar contraseña"
                  className="w-full h-[50px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[16px] font-medium placeholder-white/48 border-none outline-none"
                  required
                />
                {errors.confirm && <span className="text-red-300 text-xs mt-1">{errors.confirm}</span>}
              </div>
              
              {/* Line separator */}
              <div className="w-full h-[1px] bg-black/20 mb-[12px]"></div>
              
              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-[20px] bg-black/74 text-white text-[18px] font-bold hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
            
            {/* Back to Login Link */}
            <button 
              onClick={onBackToLogin}
              className="text-center text-[16px] font-semibold text-black/42 mt-4 hover:text-black/60 transition-colors cursor-pointer"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
