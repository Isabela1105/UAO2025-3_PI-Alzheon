import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { obtenerHistorialPaciente, reiniciarTestDelDia, HistorialItem } from '../../../services/orientacionApi'

interface OrientacionMedicoProps {
  pacienteId: string
  nombrePaciente: string
}

export const OrientacionMedico = ({ pacienteId, nombrePaciente }: OrientacionMedicoProps) => {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState(30)
  const [reiniciando, setReiniciando] = useState(false)

  useEffect(() => {
    cargarHistorial()
  }, [dias, pacienteId])

  const cargarHistorial = async () => {
    try {
      setLoading(true)
      const data = await obtenerHistorialPaciente(pacienteId, dias)
      setHistorial(data)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error al cargar historial')
      }
    } finally {
      setLoading(false)
    }
  }

  const manejarReinicio = async () => {
    if (!confirm('¿Estás seguro de que quieres reiniciar el test del día?')) {
      return
    }

    try {
      setReiniciando(true)
      await reiniciarTestDelDia(pacienteId)
      toast.success('Test reiniciado correctamente')
      cargarHistorial()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error al reiniciar test')
      }
    } finally {
      setReiniciando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Cargando historial de orientación...</p>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const completados = historial.filter(h => h.completado)
  const promedioPuntuacion = completados.length > 0
    ? Math.round(completados.reduce((sum, h) => sum + h.puntuacionOrientacion, 0) / completados.length)
    : 0

  const problemasTotales = historial.reduce((acc, h) => {
    return acc + h.areasProblematicas.length
  }, 0)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Historial de Orientación - {nombrePaciente}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Seguimiento de orientación temporal y espacial
            </p>
          </div>
          <button
            onClick={manejarReinicio}
            disabled={reiniciando}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            {reiniciando ? 'Reiniciando...' : 'Reiniciar Test de Hoy'}
          </button>
        </div>
      </div>

      {/* Selector de rango */}
      <div className="bg-white rounded-lg p-4 shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Período de análisis:
        </label>
        <div className="flex gap-2 flex-wrap">
          {[7, 14, 30, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                dias === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Tests Completados</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {completados.length}/{historial.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Puntuación Promedio</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{promedioPuntuacion}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Áreas Problemáticas</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{problemasTotales}</p>
        </div>
      </div>

      {/* Tabla de historial */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Tests</h4>
        
        {historial.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No hay tests registrados en este período
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Puntuación</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Respuestas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Áreas Problemáticas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Duración</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {new Date(item.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              item.puntuacionOrientacion >= 80
                                ? 'bg-green-500'
                                : item.puntuacionOrientacion >= 60
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${item.puntuacionOrientacion}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold w-12 text-right ${
                          item.puntuacionOrientacion >= 80
                            ? 'text-green-600'
                            : item.puntuacionOrientacion >= 60
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}>
                          {item.puntuacionOrientacion}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                        {item.respuestasCorrectas}/{item.totalRespuestas}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.completado ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Completado
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                          En progreso
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.areasProblematicas.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {item.areasProblematicas.map(area => (
                            <span
                              key={area}
                              className={`px-2 py-1 rounded text-xs font-medium ${
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
                        <span className="text-green-600 text-xs font-semibold">✓ Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.duracion ? `${item.duracion}m` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Nota:</span> Este historial muestra el desempeño del paciente en las pruebas diarias de orientación temporal y espacial. 
          Las áreas problemáticas identificadas pueden indicar problemas cognitivos que requieren seguimiento.
        </p>
      </div>
    </div>
  )
}
