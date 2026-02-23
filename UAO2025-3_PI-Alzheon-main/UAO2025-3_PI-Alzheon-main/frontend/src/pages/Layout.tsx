import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { Login } from '../pages/auth/Login'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/generics/Navbar'
import { Footer } from '../components/generics/Footer'

export const Layout = () => {
  const authStatus = useSelector((state: RootState) => state.auth.status);

  return (
    <div>
      <Navbar />

      <main className='min-h-[calc(100dvh-260px)]'>
        <Outlet />
        {authStatus !== 'authenticated' && <Login />}
      </main>

      <Footer />

    </div>
  )
}
