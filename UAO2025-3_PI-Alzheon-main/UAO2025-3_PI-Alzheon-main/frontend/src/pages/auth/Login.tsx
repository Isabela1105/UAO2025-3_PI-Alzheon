// src/pages/Login.tsx
import { useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../store/store';
import { startLogin } from '../../store/thunks/authThunk';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { Navbar } from '../../components/generics/Navbar';
import { Footer } from '../../components/generics/Footer';

export const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<null | { ok: boolean; msg: string }>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(startLogin({ email: correo, password: contrasena }));
      if (result) {
        navigate('/app');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const backgroundImage = "/background.jpg";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative bg-[#13172b]">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={backgroundImage} 
            alt="Mountain landscape" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Login Container */}
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="w-[450px] h-[480px] relative">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 rounded-[34px]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[34px] border border-white/20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-[34px]"></div>
            </div>
          
          {/* Content */}
          <div className="relative flex flex-col items-center pt-[40px] px-[60px] pb-[40px] h-full">
            {/* Title */}
            <h1 className="text-[36px] font-extrabold text-black text-center mb-[16px] leading-none">
              Login
            </h1>
            
            {/* Line separator */}
            <div className="w-[320px] h-[1px] bg-black/20 mb-[16px]"></div>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-[320px]">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo"
                  className="w-full h-[56px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[18px] font-medium placeholder-white/48 border-none outline-none"
                  required
                />
              </div>
              
              {/* Password Input */}
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full h-[56px] rounded-[20px] bg-black/20 px-[20px] text-white/48 text-[18px] font-medium placeholder-white/48 border-none outline-none"
                  required
                />
              </div>
              
              {/* Line separator */}
              <div className="w-full h-[1px] bg-black/20 mb-[16px]"></div>
              
              {/* Login Button */}
              <button
                type="submit"
                className="w-full h-[56px] rounded-[20px] bg-black/74 text-white text-[20px] font-bold hover:bg-black/80 transition-colors"
              >
                Ingresar
              </button>
            </form>
            
            {/* Register Link */}
            <button 
              onClick={() => setShowRegister(true)}
              className="text-center text-[16px] font-semibold text-black/42 mt-6 hover:text-black/60 transition-colors cursor-pointer"
            >
              Regístrate aquí
            </button>
            
            {/* Forgot password link */}
            <button
              onClick={() => { setShowForgot(true); setForgotStatus(null); setForgotEmail(''); }}
              className="text-center text-[14px] font-medium text-black/42 mt-2 hover:text-black/60 transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
        </div>
        
        {/* Register Form Modal */}
        {showRegister && (
          <div className="fixed inset-0 z-50">
            <RegisterForm onBackToLogin={() => setShowRegister(false)} />
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[480px] relative">
              {/* Outer glass layer for subtle blur */}
              <div className="absolute inset-0 rounded-[28px] pointer-events-none">
                <div className="absolute inset-0 bg-white/6 backdrop-blur-md rounded-[28px] border border-white/10"></div>
              </div>

              {/* Inner content box to improve contrast */}
              <div className="relative p-6 bg-white/95 rounded-[20px] shadow-lg">
                <h3 className="text-[20px] font-extrabold text-[#0b1221] mb-2">Recuperar contraseña</h3>
                <p className="text-[14px] text-[#374151] mb-4">Introduce el correo asociado a tu cuenta y te enviaremos un enlace para restablecer la contraseña.</p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotLoading(true);
                  setForgotStatus(null);
                  try {
                    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5500';
                    const resp = await fetch(`${API_BASE}/api/forgot-password`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail })
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                      setForgotStatus({ ok: true, msg: data.msg || 'Se envió el enlace si el email está registrado.' });
                    } else {
                      setForgotStatus({ ok: false, msg: data.error || data.msg || 'Ocurrió un error' });
                    }
                  } catch (err) {
                    setForgotStatus({ ok: false, msg: 'Error de red' });
                  } finally {
                    setForgotLoading(false);
                  }
                }} className="flex flex-col gap-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Correo"
                    required
                    className="w-full h-[56px] rounded-[12px] bg-white border border-gray-200 px-4 text-black text-[16px] placeholder-gray-400 outline-none shadow-sm"
                  />

                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={forgotLoading} className="flex-1 h-[52px] rounded-[12px] bg-[#0b1221] text-white text-[16px] font-bold hover:opacity-95 transition-colors disabled:opacity-60">
                      {forgotLoading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                    <button type="button" onClick={() => setShowForgot(false)} className="h-[52px] px-4 rounded-[12px] border border-gray-200 text-[#0b1221] bg-white">Cancelar</button>
                  </div>
                </form>

                {forgotStatus && (
                  <div className={`mt-4 text-sm ${forgotStatus.ok ? 'text-green-600' : 'text-red-600'}`}>{forgotStatus.msg}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
