import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { obtenerHistorial, obtenerEstadisticas, HistorialItem, EstadisticasOrientacion as EstadisticasData } from '../../../services/orientacionApi'

export const EstadisticasOrientacion = () => {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState(30)

  useEffect(() => {
    cargarDatos()
  }, [dias])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [historialData, estadisticasData] = await Promise.all([
        obtenerHistorial(dias),
        obtenerEstadisticas(dias)
      ])
      
      setHistorial(historialData)
      setEstadisticas(estadisticasData)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error al cargar datos')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de rango de fechas */}
      <div className="bg-white rounded-lg p-4 shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Período de análisis:
        </label>
        <div className="flex gap-2 flex-wrap">
          {[7, 14, 30, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dias === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Últimos {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de tests */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow">
            <div className="text-3xl font-bold text-blue-600">{estadisticas.totalTests}</div>
            <p className="text-gray-600 text-sm mt-2">Tests realizados</p>
          </div>

          {/* Tests completados */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow">
            <div className="text-3xl font-bold text-green-600">
              {estadisticas.testCompletados}/{estadisticas.totalTests}
            </div>
            <p className="text-gray-600 text-sm mt-2">Tests completados</p>
          </div>

          {/* Puntuación promedio */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow">
            <div className="text-3xl font-bold text-purple-600">
              {estadisticas.puntuacionPromedio}%
            </div>
            <p className="text-gray-600 text-sm mt-2">Puntuación promedio</p>
          </div>

          {/* Tendencia */}
          <div className={`rounded-lg p-6 shadow bg-gradient-to-br ${
            estadisticas.tendencia === 'mejorado' 
              ? 'from-green-50 to-green-100'
              : estadisticas.tendencia === 'deteriorado'
              ? 'from-red-50 to-red-100'
              : 'from-gray-50 to-gray-100'
          }`}>
            <div className={`text-xl font-bold mt-2 ${
              estadisticas.tendencia === 'mejorado'
                ? 'text-green-600'
                : estadisticas.tendencia === 'deteriorado'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {estadisticas.tendencia === 'mejorado' && '📈 Mejorado'}
              {estadisticas.tendencia === 'deteriorado' && '📉 Deteriorado'}
              {estadisticas.tendencia === 'estable' && '➡️ Estable'}
              {estadisticas.tendencia === 'sin datos' && '➖ Sin datos'}
            </div>
            <p className="text-gray-600 text-sm mt-2">Tendencia</p>
          </div>
        </div>
      )}

      {/* Rango de puntuaciones */}
      {estadisticas && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rango de Puntuaciones</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Puntuación Mínima</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.puntuacionMinima}%</p>
            </div>
            <div className="border-l border-r border-gray-300 px-4">
              <p className="text-gray-600 text-sm">Puntuación Promedio</p>
              <p className="text-2xl font-bold text-indigo-600">{estadisticas.puntuacionPromedio}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Puntuación Máxima</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.puntuacionMaxima}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Áreas problemáticas */}
      {estadisticas && estadisticas.areasProblematicasComunes.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Áreas a Mejora</h3>
          <div className="space-y-3">
            {estadisticas.areasProblematicasComunes.map((area, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize font-medium text-gray-700">
                    {area.area === 'temporal' ? 'Orientación Temporal' : 'Orientación Espacial'}
                  </span>
                  <span className="text-gray-600 text-sm">{area.frecuencia} tests</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      area.area === 'temporal' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${(area.frecuencia / Math.max(...estadisticas.areasProblematicasComunes.map(a => a.frecuencia))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial detallado */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Tests</h3>
        
        {historial.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No hay tests realizados en este período
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Puntuación</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Respuestas</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Duración</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Áreas</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(item.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        item.puntuacionOrientacion >= 80
                          ? 'text-green-600'
                          : item.puntuacionOrientacion >= 60
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}>
                        {item.puntuacionOrientacion}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.respuestasCorrectas}/{item.totalRespuestas}
                    </td>
                    <td className="px-4 py-3">
                      {item.duracion ? `${item.duracion}m` : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.areasProblematicas.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {item.areasProblematicas.map(area => (
                            <span
                              key={area}
                              className={`px-2 py-1 rounded ${
                                area === 'temporal'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-600">✓ Excelente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
