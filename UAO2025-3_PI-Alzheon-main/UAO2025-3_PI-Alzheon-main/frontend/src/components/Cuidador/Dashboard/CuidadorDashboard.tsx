import { HiChevronRight, HiHandRaised, HiPhoto, HiChartBar, HiSparkles } from 'react-icons/hi2'
import { PatientStats } from '../../../services/cuidadorApi'

interface CuidadorDashboardProps {
  userName: string
  patientName: string
  stats: PatientStats
  onNavigate: (path: string) => void
}

const quickActions = [
  { label: 'Gestionar Fotos', action: '/cuidador/fotos', icon: HiPhoto },
  { label: 'Ver Progreso', action: '/cuidador/progreso', icon: HiChartBar },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  })
}

export const CuidadorDashboard = ({
  userName,
  patientName,
  stats,
  onNavigate,
}: CuidadorDashboardProps) => {
  const weeklyGoal = 4
  const progress = Math.min(100, Math.round((stats.grabacionesEstaSemana / weeklyGoal) * 100))

  return (
    <section className="w-full px-4 pb-16 sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="glass-panel p-6">
          <p className="patient-section-title mb-2">Bienvenida</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-snug flex items-center gap-3">
            Hola, {userName}
            <span className="inline-flex items-center justify-center rounded-full bg-white/15 p-2 text-[#3B9CFF]">
              <HiHandRaised className="text-2xl" />
            </span>
          </h2>
          <p className="text-white/70 mt-3 text-lg max-w-2xl">
            Tu dedicación marca la diferencia. Aquí puedes gestionar los recuerdos de {patientName} y 
            seguir su progreso en el proceso de recordación.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="glass-card p-5 flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Gestión de contenido</p>
              <h3 className="text-2xl font-semibold text-white">Agregar nuevas fotos</h3>
              <p className="text-white/70 text-sm">
                Sube fotografías significativas para ayudar a {patientName} a ejercitar su memoria.
              </p>
              <button
                onClick={() => onNavigate('/cuidador/fotos')}
                className="mt-auto glass-button rounded-full px-5 py-3 text-left text-sm font-semibold text-white flex items-center justify-between"
              >
                Gestionar fotos
                <HiChevronRight />
              </button>
            </div>

            <div className="glass-card p-5 flex flex-col gap-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Actividad semanal</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-white">{stats.grabacionesEstaSemana}</span>
                  <span className="text-white/70 text-sm">de {weeklyGoal} sesiones</span>
                </div>
              </div>
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-[#3B9CFF]" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm text-white/70">
                {stats.grabacionesEstaSemana >= weeklyGoal 
                  ? `¡Excelente! ${patientName} ha cumplido el objetivo semanal` 
                  : `${patientName} está en un gran ritmo`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass-card p-5 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Resumen general</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Total de fotos</span>
                <span className="text-2xl font-semibold text-white">{stats.totalFotos}</span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Total de grabaciones</span>
                <span className="text-2xl font-semibold text-white">{stats.totalGrabaciones}</span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Esta semana</span>
                <span className="text-2xl font-semibold text-white">{stats.grabacionesEstaSemana}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Última actividad</p>
            {stats.ultimaGrabacion ? (
              <>
                <h3 className="text-xl font-semibold text-white">
                  {formatDate(stats.ultimaGrabacion.fecha)}
                </h3>
                <p className="text-white/70 text-sm">
                  Grabación de {Math.floor(stats.ultimaGrabacion.duracion / 60)} minutos
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white">Sin grabaciones aún</h3>
                <p className="text-white/70 text-sm">
                  {patientName} aún no ha grabado ninguna descripción
                </p>
              </>
            )}

            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
              <HiSparkles className="shrink-0 text-[#E8C39E]" />
              <span>
                Cada foto es una oportunidad para fortalecer la memoria. Sigue agregando contenido significativo.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-panel p-6">
        <p className="patient-section-title mb-4">Accesos rápidos</p>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.action)}
              className="glass-card flex items-center gap-3 px-4 py-5 text-white text-lg font-semibold justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <action.icon className="text-2xl text-[#3B9CFF]" />
                </span>
                {action.label}
              </div>
              <HiChevronRight className="text-white/60" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
