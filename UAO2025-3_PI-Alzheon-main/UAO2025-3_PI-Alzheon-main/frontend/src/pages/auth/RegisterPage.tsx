import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '../../components/auth/RegisterForm'
import { Navbar } from '../../components/generics/Navbar'
import { Footer } from '../../components/generics/Footer'

export const RegisterPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <RegisterForm onBackToLogin={() => navigate('/login')} />
      </main>
      <Footer />
    </div>
  )
}
