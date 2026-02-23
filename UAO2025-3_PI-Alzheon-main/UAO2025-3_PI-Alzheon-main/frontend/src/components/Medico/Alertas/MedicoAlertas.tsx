import { useEffect, useState } from 'react'
import { HiExclamationTriangle, HiFunnel } from 'react-icons/hi2'
import { toast } from 'sonner'
import { AlertaCognitiva, fetchAlertas, fetchHistorialAlertas } from '../../../services/medicoApi'
import { AlertasList } from '../Dashboard/AlertasList'

export const MedicoAlertas = () => {
  const [alertas, setAlertas] = useState<AlertaCognitiva[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // Filtros
  const [soloNoLeidas, setSoloNoLeidas] = useState(true)
  const [severidadFiltro, setSeveridadFiltro] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  useEffect(() => {
    loadAlertas()
  }, [soloNoLeidas, severidadFiltro, fechaInicio, fechaFin])

  const loadAlertas = async () => {
    try {
      setLoading(true)
      
      if (soloNoLeidas && !severidadFiltro && !fechaInicio && !fechaFin) {
        // Cargar solo no leídas (sin filtros adicionales)
        const data = await fetchAlertas()
        setAlertas(data)
      } else {
        // Cargar con filtros
        const data = await fetchHistorialAlertas({
          leida: soloNoLeidas ? false : undefined,
          severidad: severidadFiltro || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        })
        setAlertas(data)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cargar alertas')
    } finally {
      setLoading(false)
    }
  }

  const handleLimpiarFiltros = () => {
    setSoloNoLeidas(true)
    setSeveridadFiltro('')
    setFechaInicio('')
    setFechaFin('')
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        Cargando alertas...
      </div>
    )
  }

  return (
    <section className="w-full px-4 pb-16 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <HiExclamationTriangle className="text-yellow-400" />
              Alertas Cognitivas
            </h2>
            <p className="mt-2 text-lg text-white/70">
              Monitoreo de desviaciones cognitivas de los pacientes
            </p>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 glass-button rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            <HiFunnel className="text-lg" />
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Estado</label>
              <select
                value={soloNoLeidas ? 'no-leidas' : 'todas'}
                onChange={(e) => setSoloNoLeidas(e.target.value === 'no-leidas')}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              >
                <option value="no-leidas">Solo no leídas</option>
                <option value="todas">Todas</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Severidad</label>
              <select
                value={severidadFiltro}
                onChange={(e) => setSeveridadFiltro(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              >
                <option value="">Todas</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={loadAlertas}
              className="glass-button rounded-lg px-6 py-2 text-sm font-semibold text-white"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleLimpiarFiltros}
              className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-semibold"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid gap-6 sm:grid-cols-4 mb-8">
        <div className="glass-card p-6">
          <p className="text-white/70 text-sm mb-2">Total de Alertas</p>
          <p className="text-4xl font-bold text-white">{alertas.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/70 text-sm mb-2">Críticas</p>
          <p className="text-4xl font-bold text-red-400">
            {alertas.filter((a) => a.severidad === 'critica').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/70 text-sm mb-2">Altas</p>
          <p className="text-4xl font-bold text-orange-400">
            {alertas.filter((a) => a.severidad === 'alta').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/70 text-sm mb-2">No Leídas</p>
          <p className="text-4xl font-bold text-yellow-400">
            {alertas.filter((a) => !a.leida).length}
          </p>
        </div>
      </div>

      {/* Lista de alertas */}
      <AlertasList alertas={alertas} onAlertaActualizada={loadAlertas} />
    </section>
  )
}
