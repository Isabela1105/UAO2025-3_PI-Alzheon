import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import { clearUser } from '../../store/slices/userSlice'
import { fetchLogout } from '../../lib/api'
import { toast } from 'sonner'

export const Navbar = () => {

  const { nombre } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const defaultProfilePic = '/defProfile.png'
  const backgroundImage = "/backgroundNavBar.jpg"
  const logoImage = "/alzheon.png"

  const handleLogout = async () => {
    dispatch(logout({}))
    dispatch(clearUser())
    await fetchLogout()
    toast.success('Se ha cerrado la sesion con exito')
    navigate('/login')
  }

  return (
    <div className="relative h-[80px] w-full bg-[#c4bfb8]">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="absolute h-[659.79%] left-0 max-w-none top-[-0.05%] w-full object-cover"
        />
      </div>
      
      <div className="relative flex items-center justify-between h-full px-[40px]">
        {/* Logo Section */}
        <Link to='/' className='flex items-center gap-1'>
          <div className="w-[50px] h-[48px]">
            <img 
              src={logoImage} 
              alt="Alzheon Logo" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-column items-center">
            <h1 className="font-bold text-white text-2xl">Alzheon</h1>
            <p className="text-white/70 text-xs ml-1">Alzheimer's awareness</p>
          </div>
        </Link>

        {/* User Section */}
        <div className="relative">
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-[40px]"></div>
          </div>
          
                    <div className="relative flex items-center gap-4 px-6 py-3 h-[50px] w-auto min-w-fit">
            {nombre ? (
              <>
                <div className="w-[36px] h-[36px] rounded-full overflow-hidden">
                  <img 
                    src={defaultProfilePic} 
                    alt="Usuario" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-[1px] h-[30px] bg-black/20"></div>
                <div className="relative group">
                  <span className="font-medium text-[18px] text-black cursor-pointer">{nombre}</span>
                  <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 min-w-[150px]">
                    <Link to='/profile' className="block px-3 py-2 text-black hover:bg-black/10 rounded">Perfil</Link>
                    <span onClick={handleLogout} className="block px-3 py-2 text-black hover:bg-black/10 rounded cursor-pointer">Cerrar sesión</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-[36px] h-[36px] rounded-full bg-gray-300"></div>
                <div className="w-[1px] h-[30px] bg-black/20"></div>
                <Link to='/login'>
                  <span className="font-medium text-[18px] text-black">Iniciar Sesión</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
