import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  HiCalendar,
  HiChartBar,
  HiFunnel,
  HiXMark,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi2'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { fetchGrabaciones, GrabacionConAnalisis } from '../../../services/cuidadorApi'

export const LineaTiempoEvolucion = () => {
  const [grabaciones, setGrabaciones] = useState<GrabacionConAnalisis[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoContenido: '',
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [metricaSeleccionada, setMetricaSeleccionada] = useState<string>('todas')
  const [sesionExpandida, setSesionExpandida] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await fetchGrabaciones()
      // Filtrar solo las que tienen análisis cognitivo
      const conAnalisis = data.filter((g: GrabacionConAnalisis) => g.analisisCognitivo)
      setGrabaciones(conAnalisis)
    } catch (error: any) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let filtradas = grabaciones

    if (filtros.fechaInicio) {
      filtradas = filtradas.filter(
        (g) => new Date(g.fecha) >= new Date(filtros.fechaInicio)
      )
    }

    if (filtros.fechaFin) {
      filtradas = filtradas.filter(
        (g) => new Date(g.fecha) <= new Date(filtros.fechaFin)
      )
    }

    if (filtros.tipoContenido) {
      filtradas = filtradas.filter((g) => g.tipoContenido === filtros.tipoContenido)
    }

    return filtradas
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      tipoContenido: '',
    })
  }

  const datosGrafico = aplicarFiltros()
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map((g) => ({
      fecha: new Date(g.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      }),
      fechaCompleta: new Date(g.fecha).toLocaleDateString('es-ES'),
      coherencia: Math.round((g.analisisCognitivo?.coherencia || 0) * 100),
      claridad: Math.round((g.analisisCognitivo?.claridad || 0) * 100),
      riquezaLexica: Math.round((g.analisisCognitivo?.riquezaLexica || 0) * 100),
      memoria: Math.round((g.analisisCognitivo?.memoria || 0) * 100),
      emocion: Math.round((g.analisisCognitivo?.emocion || 0) * 100),
      orientacion: Math.round((g.analisisCognitivo?.orientacion || 0) * 100),
      razonamiento: Math.round((g.analisisCognitivo?.razonamiento || 0) * 100),
      atencion: Math.round((g.analisisCognitivo?.atencion || 0) * 100),
      puntuacionGlobal: g.analisisCognitivo?.puntuacionGlobal || 0,
      _id: g._id,
    }))

  const metricas = [
    { key: 'todas', label: 'Todas las métricas', color: '#8884d8' },
    { key: 'puntuacionGlobal', label: 'Puntuación Global', color: '#8b5cf6' },
    { key: 'memoria', label: 'Memoria', color: '#f59e0b' },
    { key: 'coherencia', label: 'Coherencia', color: '#10b981' },
    { key: 'claridad', label: 'Claridad', color: '#3b82f6' },
    { key: 'orientacion', label: 'Orientación', color: '#ef4444' },
    { key: 'razonamiento', label: 'Razonamiento', color: '#ec4899' },
    { key: 'atencion', label: 'Atención', color: '#06b6d4' },
  ]

  const metricasParaMostrar =
    metricaSeleccionada === 'todas'
      ? ['memoria', 'coherencia', 'claridad', 'orientacion']
      : [metricaSeleccionada]

  if (loading) {
    return (
      <div className="glass-card p-8 text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        Cargando línea de tiempo...
      </div>
    )
  }

  if (grabaciones.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-white">
        <HiChartBar className="text-6xl mx-auto mb-4 text-white/50" />
        <h3 className="text-xl font-bold mb-2">Sin análisis cognitivos</h3>
        <p className="text-white/70">
          Realiza grabaciones para ver la evolución cognitiva en esta línea de tiempo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <HiChartBar className="text-3xl" />
              Línea de Tiempo - Evolución Cognitiva
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Seguimiento visual del progreso cognitivo a lo largo del tiempo
            </p>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 glass-button px-4 py-2 rounded-lg text-white"
          >
            <HiFunnel className="text-xl" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <div>
              <label className="block text-white/70 text-sm mb-2">Fecha inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Fecha fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Tipo de contenido</label>
              <select
                value={filtros.tipoContenido}
                onChange={(e) => setFiltros({ ...filtros, tipoContenido: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              >
                <option value="">Todos</option>
                <option value="audio">Audio</option>
                <option value="texto">Texto</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <HiXMark className="text-xl" />
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Selector de métrica */}
        <div className="mt-4">
          <label className="block text-white/70 text-sm mb-2">Métrica a visualizar</label>
          <div className="flex flex-wrap gap-2">
            {metricas.map((metrica) => (
              <button
                key={metrica.key}
                onClick={() => setMetricaSeleccionada(metrica.key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  metricaSeleccionada === metrica.key
                    ? 'glass-button text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                style={
                  metricaSeleccionada === metrica.key
                    ? { borderColor: metrica.color, borderWidth: '2px' }
                    : {}
                }
              >
                {metrica.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de línea de tiempo */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Evolución temporal ({datosGrafico.length} sesiones)
        </h3>

        {datosGrafico.length === 0 ? (
          <p className="text-white/70 text-center py-8">
            No hay datos que coincidan con los filtros aplicados
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={datosGrafico}>
              <defs>
                {metricas
                  .filter((m) => m.key !== 'todas')
                  .map((metrica) => (
                    <linearGradient
                      key={metrica.key}
                      id={`color${metrica.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={metrica.color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={metrica.color} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 18, 32, 0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Legend />
              {metricasParaMostrar.map((key) => {
                const metrica = metricas.find((m) => m.key === key)
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={metrica?.color}
                    fillOpacity={1}
                    fill={`url(#color${key})`}
                    strokeWidth={3}
                    name={metrica?.label}
                  />
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Lista de sesiones detallada */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Detalle de sesiones</h3>
        <div className="space-y-3">
          {aplicarFiltros().map((grabacion) => {
            const isExpanded = sesionExpandida === grabacion._id
            const analisis = grabacion.analisisCognitivo

            return (
              <div
                key={grabacion._id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setSesionExpandida(isExpanded ? null : grabacion._id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <HiCalendar className="text-2xl text-blue-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {new Date(grabacion.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-white/70 text-sm">
                        Puntuación: {analisis?.puntuacionGlobal.toFixed(1)}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (analisis?.puntuacionGlobal || 0) >= 70
                          ? 'bg-green-500/20 text-green-300'
                          : (analisis?.puntuacionGlobal || 0) >= 50
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {(analisis?.puntuacionGlobal || 0) >= 70
                        ? 'Bueno'
                        : (analisis?.puntuacionGlobal || 0) >= 50
                        ? 'Moderado'
                        : 'Preocupante'}
                    </div>
                    {isExpanded ? (
                      <HiChevronUp className="text-xl text-white" />
                    ) : (
                      <HiChevronDown className="text-xl text-white" />
                    )}
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExpanded && analisis && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {/* Métricas individuales */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { key: 'coherencia', label: 'Coherencia' },
                        { key: 'claridad', label: 'Claridad' },
                        { key: 'memoria', label: 'Memoria' },
                        { key: 'orientacion', label: 'Orientación' },
                        { key: 'razonamiento', label: 'Razonamiento' },
                        { key: 'atencion', label: 'Atención' },
                        { key: 'emocion', label: 'Emoción' },
                        { key: 'riquezaLexica', label: 'Riqueza Léxica' },
                      ].map(({ key, label }) => {
                        const valor = Math.round((analisis[key as keyof typeof analisis] as number) * 100)
                        return (
                          <div
                            key={key}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <p className="text-white/70 text-xs mb-1">{label}</p>
                            <p className="text-white text-xl font-bold">{valor}%</p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Observaciones */}
                    {analisis.observaciones && (
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-3">
                        <p className="text-purple-300 text-sm font-semibold mb-1">
                          Observaciones:
                        </p>
                        <p className="text-white/80 text-sm">{analisis.observaciones}</p>
                      </div>
                    )}

                    {/* Alertas */}
                    {analisis.alertas && analisis.alertas.length > 0 && (
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <p className="text-orange-300 text-sm font-semibold mb-2">
                          Alertas detectadas:
                        </p>
                        <ul className="space-y-1">
                          {analisis.alertas.map((alerta, idx) => (
                            <li
                              key={idx}
                              className="text-white/80 text-sm flex items-start gap-2"
                            >
                              <span className="text-orange-400">⚠</span>
                              {alerta}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
