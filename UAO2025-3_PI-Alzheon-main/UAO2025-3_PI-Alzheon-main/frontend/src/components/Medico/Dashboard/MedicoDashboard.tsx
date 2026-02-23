import { HiArrowRight, HiChartBar, HiMicrophone, HiPhoto, HiUsers } from 'react-icons/hi2'
import { DoctorStats, MedicoPatient } from '../../../services/medicoApi'

interface MedicoDashboardProps {
  userName: string
  stats: DoctorStats
  patients: MedicoPatient[]
  onNavigate: (path: string) => void
}

export const MedicoDashboard = ({ userName, stats, patients, onNavigate }: MedicoDashboardProps) => {
  return (
    <section className="w-full px-4 pb-16 sm:px-6">
      {/* Encabezado */}
      <div className="mb-8 text-white">
        <p className="patient-section-title">Bienvenido de vuelta</p>
        <h2 className="text-4xl font-bold">Hola, {userName}</h2>
        <p className="mt-2 text-lg text-white/70">
          Resumen de tus pacientes y su progreso
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {/* Total Pacientes */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 backdrop-blur-sm">
              <HiUsers className="text-3xl text-blue-300" />
            </div>
            <span className="text-sm text-white/60">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.totalPacientes}</h3>
          <p className="text-sm text-white/70 mt-1">Pacientes asignados</p>
        </div>

        {/* Total Fotos */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 backdrop-blur-sm">
              <HiPhoto className="text-3xl text-purple-300" />
            </div>
            <span className="text-sm text-white/60">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.totalFotos}</h3>
          <p className="text-sm text-white/70 mt-1">Fotografías subidas</p>
        </div>

        {/* Total Grabaciones */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-pink-500/20 backdrop-blur-sm">
              <HiMicrophone className="text-3xl text-pink-300" />
            </div>
            <span className="text-sm text-white/60">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.totalGrabaciones}</h3>
          <p className="text-sm text-white/70 mt-1">Grabaciones realizadas</p>
        </div>

        {/* Esta Semana */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20 backdrop-blur-sm">
              <HiChartBar className="text-3xl text-green-300" />
            </div>
            <span className="text-sm text-white/60">7 días</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.grabacionesEstaSemana}</h3>
          <p className="text-sm text-white/70 mt-1">Esta semana</p>
        </div>
      </div>

      {/* Pacientes recientes */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Pacientes Recientes</h3>
            <p className="text-sm text-white/70 mt-1">Últimos pacientes asignados</p>
          </div>
          <button
            onClick={() => onNavigate('/medico/pacientes')}
            className="flex items-center gap-2 glass-button rounded-full px-6 py-2 text-sm font-semibold text-white"
          >
            Ver todos
            <HiArrowRight className="text-lg" />
          </button>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-12 text-white/70">
            <HiUsers className="text-6xl mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No tienes pacientes asignados</p>
            <p className="text-sm mt-2">Comienza asignando pacientes a tu lista</p>
            <button
              onClick={() => onNavigate('/medico/pacientes')}
              className="mt-4 glass-button rounded-full px-6 py-2 text-sm font-semibold text-white"
            >
              Asignar Pacientes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => (
              <div
                key={patient._id}
                onClick={() => onNavigate(`/medico/pacientes/${patient._id}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {patient.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-white flex-1">
                    <p className="font-semibold">{patient.nombre}</p>
                    <p className="text-sm text-white/60">{patient.email}</p>
                    {patient.estadisticas && (
                      <div className="mt-2">
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((patient.estadisticas.grabacionesEstaSemana / patient.estadisticas.metaSemanal) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                          {patient.estadisticas.grabacionesEstaSemana}/{patient.estadisticas.metaSemanal} grabaciones esta semana
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-white/70">
                  <p className="text-sm">
                    {patient.cuidadores.length === 0 && 'Sin cuidadores'}
                    {patient.cuidadores.length === 1 && '1 cuidador'}
                    {patient.cuidadores.length > 1 && `${patient.cuidadores.length} cuidadores`}
                  </p>
                  <HiArrowRight className="text-xl mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-6 sm:grid-cols-2 mt-10">
        <button
          onClick={() => onNavigate('/medico/pacientes')}
          className="glass-card p-8 text-left hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-xl bg-blue-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <HiUsers className="text-4xl text-blue-300" />
            </div>
            <div className="text-white">
              <h4 className="text-xl font-bold">Gestionar Pacientes</h4>
              <p className="text-sm text-white/70">Ver y asignar pacientes</p>
            </div>
          </div>
          <HiArrowRight className="text-2xl text-white/50 ml-auto" />
        </button>

        <button
          onClick={() => onNavigate('/medico/pacientes')}
          className="glass-card p-8 text-left hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-xl bg-purple-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <HiChartBar className="text-4xl text-purple-300" />
            </div>
            <div className="text-white">
              <h4 className="text-xl font-bold">Ver Estadísticas</h4>
              <p className="text-sm text-white/70">Progreso de pacientes</p>
            </div>
          </div>
          <HiArrowRight className="text-2xl text-white/50 ml-auto" />
        </button>
      </div>
    </section>
  )
}
