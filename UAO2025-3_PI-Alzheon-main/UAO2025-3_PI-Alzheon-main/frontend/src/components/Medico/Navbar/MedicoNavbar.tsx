import { HiArrowRightOnRectangle, HiHome, HiUsers } from 'react-icons/hi2'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { logout } from '../../../store/slices/authSlice'
import { clearUser } from '../../../store/slices/userSlice'
import { fetchLogout } from '../../../lib/api'

interface MedicoNavbarProps {
  userName: string
  userEmail?: string | null
}

const navItems = [
  { label: 'Dashboard', path: '/medico/dashboard', icon: HiHome },
  { label: 'Mis Pacientes', path: '/medico/pacientes', icon: HiUsers },
]

export const MedicoNavbar = ({ userName, userEmail }: MedicoNavbarProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetchLogout()
      dispatch(logout({}))
      dispatch(clearUser())
      navigate('/login')
      toast.success('Sesión cerrada correctamente')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header con perfil */}
        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-[2px]">
              <div className="h-full w-full rounded-full bg-[#0A1220]/80 flex items-center justify-center">
                <img src="/defProfile.jpg" alt="Perfil" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <div className="text-white">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">Médico</p>
              <h1 className="text-2xl font-semibold tracking-tight">{userName || 'Médico Alzheon'}</h1>
              <span className="text-sm text-white/70">{userEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 glass-button rounded-full px-6 py-2 text-sm font-semibold text-white"
            >
              Cerrar sesión
              <HiArrowRightOnRectangle className="text-xl" />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex gap-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
