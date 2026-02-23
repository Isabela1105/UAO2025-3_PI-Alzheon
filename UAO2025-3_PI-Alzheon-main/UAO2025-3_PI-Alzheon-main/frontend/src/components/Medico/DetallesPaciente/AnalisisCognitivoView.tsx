import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  HiBeaker,
  HiChartBar,
  HiDocumentText,
  HiArrowDownTray,
  HiCalendar,
} from 'react-icons/hi2'
import {
  AnalisisCognitivo,
  fetchLineaBase,
  fetchAnalisisCognitivo,
  generarReporte,
  CognitiveMetrics,
} from '../../../services/medicoApi'

interface AnalisisCognitivoViewProps {
  pacienteId: string
  pacienteNombre: string
}

const metricLabels: Record<keyof CognitiveMetrics, string> = {
  coherencia: 'Coherencia',
  claridad: 'Claridad',
  riquezaLexica: 'Riqueza Léxica',
  memoria: 'Memoria',
  emocion: 'Emoción',
  orientacion: 'Orientación',
  razonamiento: 'Razonamiento',
  atencion: 'Atención',
}

const getScoreColor = (score: number) => {
  if (score >= 0.85) return 'text-green-400'
  if (score >= 0.70) return 'text-blue-400'
  if (score >= 0.55) return 'text-yellow-400'
  return 'text-red-400'
}

const getScoreLabel = (score: number) => {
  if (score >= 0.85) return 'Excelente'
  if (score >= 0.70) return 'Bueno'
  if (score >= 0.55) return 'Aceptable'
  return 'Preocupante'
}

export const AnalisisCognitivoView = ({ pacienteId, pacienteNombre }: AnalisisCognitivoViewProps) => {
  const [lineaBase, setLineaBase] = useState<AnalisisCognitivo | null>(null)
  const [analisis, setAnalisis] = useState<AnalisisCognitivo[]>([])
  const [promedios, setPromedios] = useState<(CognitiveMetrics & { puntuacionGlobal: number }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [generandoReporte, setGenerandoReporte] = useState(false)
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    loadData()
  }, [pacienteId, fechaInicio, fechaFin, limit])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar línea base
      try {
        const baseData = await fetchLineaBase(pacienteId)
        setLineaBase(baseData)
      } catch (error) {
        // Puede no existir línea base todavía
        setLineaBase(null)
      }

      // Cargar análisis
      const analisisData = await fetchAnalisisCognitivo(pacienteId, {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        limit,
      })
      
      setAnalisis(analisisData.analisis)
      setPromedios(analisisData.promedios)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cargar análisis cognitivos')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerarReporte = async (encriptar: boolean = false) => {
    try {
      setGenerandoReporte(true)
      const blob = await generarReporte(pacienteId, {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        encriptar,
      })

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Nombre del archivo según si está encriptado o no
      const extension = encriptar ? 'encrypted' : 'pdf'
      a.download = `reporte_${pacienteNombre}_${Date.now()}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(encriptar ? 'Reporte encriptado descargado' : 'Reporte PDF descargado')
    } catch (error: any) {
      console.error('Error al generar reporte:', error)
      toast.error(error.response?.data?.error || 'Error al generar reporte')
    } finally {
      setGenerandoReporte(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        Cargando análisis cognitivos...
      </div>
    )
  }

  if (!lineaBase && analisis.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <HiBeaker className="text-6xl text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Sin análisis cognitivos</h3>
        <p className="text-white/70">
          Este paciente aún no tiene grabaciones con texto para analizar.
        </p>
        <p className="text-white/50 text-sm mt-2">
          Se necesitan al menos 3 grabaciones para establecer la línea base.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y Acciones */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiBeaker className="text-3xl" />
            Análisis Cognitivo
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerarReporte(false)}
              disabled={generandoReporte}
              className="flex items-center gap-2 glass-button rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <HiDocumentText className="text-lg" />
              Generar Reporte
            </button>
            <button
              onClick={() => handleGenerarReporte(true)}
              disabled={generandoReporte}
              className="flex items-center gap-2 glass-button rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <HiArrowDownTray className="text-lg" />
              Reporte Encriptado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-white/70 text-sm mb-2">Límite</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
            >
              <option value={10}>10 análisis</option>
              <option value={20}>20 análisis</option>
              <option value={50}>50 análisis</option>
              <option value={100}>100 análisis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Línea Base */}
      {lineaBase && (
        <div className="glass-card p-6 border-2 border-blue-500/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <HiChartBar className="text-3xl text-blue-300" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Línea Base Cognitiva</h4>
              <p className="text-white/70 text-sm">
                Promedio de los primeros 3 análisis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metricLabels).map(([key, label]) => {
              const value = lineaBase[key as keyof CognitiveMetrics]
              return (
                <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/70 text-sm mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
                    {(value * 100).toFixed(0)}%
                  </p>
                  <p className="text-white/50 text-xs mt-1">{getScoreLabel(value)}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-blue-300 font-semibold mb-2">Puntuación Global</p>
            <p className="text-4xl font-bold text-white">
              {lineaBase.puntuacionGlobal.toFixed(1)}/100
            </p>
          </div>
        </div>
      )}

      {/* Promedios del Período */}
      {promedios && (
        <div className="glass-card p-6">
          <h4 className="text-xl font-bold text-white mb-4">Promedios del Período Seleccionado</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metricLabels).map(([key, label]) => {
              const value = promedios[key as keyof CognitiveMetrics]
              const baseValue = lineaBase?.[key as keyof CognitiveMetrics]
              const diff = baseValue ? ((value - baseValue) / baseValue) * 100 : 0

              return (
                <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/70 text-sm mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
                    {(value * 100).toFixed(0)}%
                  </p>
                  {baseValue && (
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        diff >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {diff > 0 ? '+' : ''}
                      {diff.toFixed(1)}% vs base
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 font-semibold mb-1">Puntuación Global Promedio</p>
                <p className="text-4xl font-bold text-white">
                  {promedios.puntuacionGlobal.toFixed(1)}/100
                </p>
              </div>
              {lineaBase && (
                <div className="text-right">
                  <p className="text-white/70 text-sm">vs Línea Base</p>
                  <p
                    className={`text-2xl font-bold ${
                      promedios.puntuacionGlobal >= lineaBase.puntuacionGlobal
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {promedios.puntuacionGlobal > lineaBase.puntuacionGlobal ? '+' : ''}
                    {(promedios.puntuacionGlobal - lineaBase.puntuacionGlobal).toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historial de Análisis */}
      <div className="glass-card p-6">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <HiCalendar className="text-2xl" />
          Historial de Análisis ({analisis.length})
        </h4>

        <div className="space-y-3">
          {analisis.map((item) => (
            <div
              key={item._id}
              className={`p-4 rounded-lg border-2 ${
                item.esLineaBase
                  ? 'bg-blue-500/10 border-blue-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold">
                      {new Date(item.fechaAnalisis).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    {item.esLineaBase && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200">
                        Línea Base
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">
                    {new Date(item.fechaAnalisis).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm mb-1">Puntuación Global</p>
                  <p className={`text-3xl font-bold ${getScoreColor(item.puntuacionGlobal / 100)}`}>
                    {item.puntuacionGlobal.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Métricas individuales */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {Object.entries(metricLabels).map(([key, label]) => {
                  const value = item[key as keyof CognitiveMetrics]
                  return (
                    <div key={key} className="text-center">
                      <p className="text-white/50 text-xs mb-1">{label}</p>
                      <p className={`text-sm font-bold ${getScoreColor(value)}`}>
                        {(value * 100).toFixed(0)}%
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Observaciones */}
              {item.observaciones && (
                <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-purple-300 text-sm font-semibold mb-1">Observaciones:</p>
                  <p className="text-white/80 text-sm">{item.observaciones}</p>
                </div>
              )}

              {/* Alertas */}
              {item.alertas && item.alertas.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-orange-300 text-sm font-semibold mb-2">Alertas detectadas:</p>
                  <ul className="space-y-1">
                    {item.alertas.map((alerta, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-orange-400">⚠</span>
                        {alerta}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {item.recomendaciones && item.recomendaciones.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-black/20 border border-white/10">
                  <p className="text-white/70 text-sm font-semibold mb-2">Recomendaciones:</p>
                  <ul className="space-y-1">
                    {item.recomendaciones.map((rec, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-white/50">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
