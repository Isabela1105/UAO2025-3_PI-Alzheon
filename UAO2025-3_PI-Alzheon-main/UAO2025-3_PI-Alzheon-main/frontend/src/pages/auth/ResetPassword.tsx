import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/generics/Navbar';
import { Footer } from '../../components/generics/Footer';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<null | { ok: boolean; text: string }>(null);

  useEffect(() => {
    // Si no hay token/email, redirigir al login
    if (!token || !email) {
      setMessage({ ok: false, text: 'Enlace inválido. Serás redirigido al login.' });
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ ok: false, text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ ok: false, text: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5500';
      const resp = await fetch(`${API_BASE}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password })
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ ok: true, text: data.msg || 'Contraseña restablecida correctamente. Redirigiendo al login...' });
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setMessage({ ok: false, text: data.error || data.msg || 'Error al restablecer la contraseña' });
      }
    } catch (err) {
      setMessage({ ok: false, text: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative bg-[#13172b]">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/background.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative flex items-center justify-center min-h-screen">
          <div className="w-[450px] h-auto relative">
            <div className="absolute inset-0 rounded-[34px]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[34px] border border-white/20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-[34px]"></div>
            </div>

            <div className="relative flex flex-col items-center pt-[36px] px-[48px] pb-[36px]">
              <h2 className="text-[28px] font-extrabold text-black mb-2">Restablecer contraseña</h2>
              <p className="text-[14px] text-black/60 mb-4 text-center">Introduce tu nueva contraseña para la cuenta asociada a <strong>{email}</strong>.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[360px]">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[56px] rounded-[20px] bg-black/10 px-[20px] text-black text-[16px] font-medium placeholder-black/40 border-none outline-none"
                  required
                  minLength={6}
                />

                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full h-[56px] rounded-[20px] bg-black/10 px-[20px] text-black text-[16px] font-medium placeholder-black/40 border-none outline-none"
                  required
                  minLength={6}
                />

                <div className="w-full h-[1px] bg-black/10 my-1"></div>

                <button type="submit" disabled={loading} className="w-full h-[56px] rounded-[20px] bg-black/74 text-white text-[18px] font-bold hover:bg-black/80 transition-colors">
                  {loading ? 'Procesando...' : 'Restablecer contraseña'}
                </button>

                <button type="button" onClick={() => navigate('/login')} className="w-full h-[48px] rounded-[20px] border border-black/10 text-black text-[16px]">Volver al login</button>
              </form>

              {message && (
                <div className={`mt-4 text-sm ${message.ok ? 'text-green-600' : 'text-red-600'}`}>{message.text}</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
