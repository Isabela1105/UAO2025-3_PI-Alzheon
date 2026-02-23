import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiArrowSmallRight,
  HiBellAlert,
  HiChartPie,
  HiChevronDown,
  HiMicrophone,
  HiPhoto,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi2'
import { Navbar } from '../components/generics/Navbar'
import { Footer } from '../components/generics/Footer'
import { useAuth } from '../hooks/useAuth'

interface FeatureCard {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isPatient, isCuidador } = useAuth()

  const handlePrimaryCTA = () => {
    if (isAuthenticated) {
      if (isPatient) return navigate('/paciente/dashboard')
      if (isCuidador) return navigate('/cuidador/dashboard')
      return navigate('/app')
    }
    navigate('/login')
  }

  const handleRegisterCTA = () => {
    navigate('/register')
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  const features: FeatureCard[] = useMemo(
    () => [
      {
        title: 'Memorias guiadas',
        description: 'Secuencias de fotografías familiares diseñadas para activar recuerdos positivos.',
        icon: HiPhoto,
      },
      {
        title: 'Grabaciones claras',
        description: 'Graba descripciones en audio con indicadores accesibles y seguimiento automático.',
        icon: HiMicrophone,
      },
      {
        title: 'Recordatorios humanos',
        description: 'Mensajes motivadores enviados en el momento perfecto para no romper la rutina.',
        icon: HiBellAlert,
      },
      {
        title: 'Monitoreo seguro',
        description: 'Indicadores cognitivos y reportes simples para cuidadores y especialistas.',
        icon: HiChartPie,
      },
    ],
    []
  )

  const steps = [
    { title: 'Reúne recuerdos', detail: 'El cuidador sube fotografías significativas y define la sesión.' },
    { title: 'Sesión guiada', detail: 'El paciente observa, describe y graba sus sensaciones sin presión.' },
    { title: 'Seguimiento', detail: 'Los progresos, recordatorios y notas quedan centralizados en Alzheon.' },
  ]

  return (
    <div className="min-h-screen flex flex-col patient-gradient-bg text-white">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 lg:px-12 py-16 grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
          <div className="space-y-6">
            <div className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm tracking-[0.3em] uppercase">
              <HiSparkles className="text-lg text-[#E8C39E]" />
              Terapia cognitiva cálida
            </div>
            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
              La manera más humana de acompañar la memoria desde casa.
            </h1>
            <p className="text-white/80 text-lg">
              Alzheon combina fotografías queridas, grabaciones en audio y recordatorios empáticos para crear sesiones
              terapéuticas que realmente conectan con cada paciente.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handlePrimaryCTA}
                className="glass-button rounded-full px-6 py-3 font-semibold text-[#0A1220] bg-white/90 text-lg"
              >
                Entrar a mi espacio
              </button>
              <button
                type="button"
                onClick={handleRegisterCTA}
                className="rounded-full px-6 py-3 font-semibold border border-white/40 hover:bg-white/10 transition"
              >
                Crear cuenta
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('recorrido')}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 border border-white/40 text-sm uppercase tracking-wide"
              >
                Ver recorrido
                <HiChevronDown />
              </button>
            </div>

            <div className="flex gap-10 pt-4">
              <div>
                <p className="text-3xl font-semibold text-[#E8C39E]">+1200</p>
                <p className="text-white/70 text-sm">sesiones guiadas</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#E8C39E]">98%</p>
                <p className="text-white/70 text-sm">usuarios motivados</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#E8C39E]">24/7</p>
                <p className="text-white/70 text-sm">acompañamiento</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-70 bg-[#E8C39E]/30" />
            <div className="relative space-y-6">
              <div className="glass-panel p-6 rounded-3xl shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <HiPhoto className="text-2xl text-[#3B9CFF]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Mis fotos</p>
                    <span className="text-lg font-semibold">Recuerdos familiares</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  Explora memorias positivas, graba descripciones y registra cada avance sin salir de casa.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <HiBellAlert className="text-2xl text-[#E8C39E]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Recordatorios</p>
                    <span className="text-lg font-semibold">Mensajes motivadores</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  Configura horarios, frecuencias y el tono perfecto para mantener viva la rutina terapéutica.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="recorrido" className="max-w-6xl mx-auto px-6 lg:px-12 py-12 space-y-8">
          <div className="text-center space-y-3">
            <p className="patient-section-title">Recorrido del cuidado</p>
            <h2 className="text-3xl font-semibold">Todo lo que necesitas en un mismo lugar</h2>
            <p className="text-white/70 max-w-3xl mx-auto">
              Alzheon fue creado junto a especialistas clínicos y familias reales para que cada interacción sea cálida,
              accesible y profundamente humana.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="glass-card p-5 rounded-3xl space-y-3">
                <feature.icon className="text-3xl text-[#3B9CFF]" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 lg:px-12 py-12 glass-panel rounded-[32px]">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="space-y-3 relative">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center text-lg font-semibold">
                    {index + 1}
                  </span>
                  <h4 className="text-lg font-semibold">{step.title}</h4>
                </div>
                <p className="text-white/70 text-sm">{step.detail}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 right-[-24px] text-white/40">
                    <HiArrowSmallRight className="text-2xl" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 lg:px-12 py-12 grid gap-8 lg:grid-cols-2">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <HiShieldCheck className="text-3xl text-[#E8C39E]" />
            <h3 className="text-2xl font-semibold">Privacidad y confianza</h3>
            <p className="text-white/70 text-sm">
              Ciframos cada recuerdo, audio y diagnóstico. Solo cuidadores autorizados tienen acceso a la información y
              puedes solicitar la eliminación de datos cuando lo necesites.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-2xl font-semibold">Listo para comenzar</h3>
            <p className="text-white/70 text-sm">
              Regístrate como paciente, cuidador o especialista y en minutos podrás agendar sesiones, cargar fotos y
              recibir recordatorios personalizados.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={handleRegisterCTA}
                className="glass-button rounded-full px-5 py-3 text-[#0A1220] bg-white/90 font-semibold"
              >
                Crear cuenta
              </button>
              <button
                type="button"
                onClick={handlePrimaryCTA}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 border border-white/40"
              >
                Ver demo
                <HiArrowSmallRight />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
