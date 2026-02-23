import { useState } from 'react'
import { HiExclamationTriangle, HiCheckCircle, HiXCircle } from 'react-icons/hi2'
import { toast } from 'sonner'
import { AlertaCognitiva, marcarAlertaLeida, registrarAccionAlerta } from '../../../services/medicoApi'

interface AlertasListProps {
  alertas: AlertaCognitiva[]
  onAlertaActualizada: () => void
}

const severityColors = {
  critica: 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-300',
  alta: 'from-orange-500/20 to-orange-600/20 border-orange-500/50 text-orange-300',
  media: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-300',
  baja: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-300',
}

const severityIcons = {
  critica: '🚨',
  alta: '⚠️',
  media: '⚡',
  baja: 'ℹ️',
}

const severityLabels = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const AlertasList = ({ alertas, onAlertaActualizada }: AlertasListProps) => {
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaCognitiva | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [accionTipo, setAccionTipo] = useState('')
  const [accionDescripcion, setAccionDescripcion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMarcarLeida = async (alertaId: string) => {
    try {
      setLoading(true)
      await marcarAlertaLeida(alertaId)
      toast.success('Alerta marcada como leída')
      onAlertaActualizada()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al marcar alerta')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrarAccion = async () => {
    if (!selectedAlerta || !accionTipo || !accionDescripcion) {
      toast.error('Completa todos los campos')
      return
    }

    try {
      setLoading(true)
      await registrarAccionAlerta(selectedAlerta._id, {
        tipo: accionTipo,
        descripcion: accionDescripcion,
      })
      toast.success('Acción registrada correctamente')
      setShowActionModal(false)
      setSelectedAlerta(null)
      setAccionTipo('')
      setAccionDescripcion('')
      onAlertaActualizada()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrar acción')
    } finally {
      setLoading(false)
    }
  }

  if (alertas.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <HiCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Sin alertas pendientes</h3>
        <p className="text-white/70">No hay alertas cognitivas sin revisar</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {alertas.map((alerta) => (
          <div
            key={alerta._id}
            className={`glass-card p-6 border-2 bg-gradient-to-br ${severityColors[alerta.severidad]}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{severityIcons[alerta.severidad]}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-white">
                      {alerta.pacienteId.nombre}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        alerta.severidad === 'critica'
                          ? 'bg-red-500/30 text-red-200'
                          : alerta.severidad === 'alta'
                          ? 'bg-orange-500/30 text-orange-200'
                          : alerta.severidad === 'media'
                          ? 'bg-yellow-500/30 text-yellow-200'
                          : 'bg-blue-500/30 text-blue-200'
                      }`}
                    >
                      {severityLabels[alerta.severidad]}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{alerta.pacienteId.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">
                  {new Date(alerta.fechaAlerta).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-white/50 text-xs">
                  {new Date(alerta.fechaAlerta).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Mensaje */}
            <p className="text-white mb-4">{alerta.mensaje}</p>

            {/* Desviaciones */}
            {alerta.desviaciones.length > 0 && (
              <div className="mb-4">
                <p className="text-white/70 text-sm font-semibold mb-2">Desviaciones detectadas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {alerta.desviaciones.map((desv, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-black/20 border border-white/10"
                    >
                      <p className="text-white text-sm font-semibold capitalize">
                        {desv.metrica}
                      </p>
                      <p className="text-white/70 text-xs">
                        Base: {(desv.valorBase * 100).toFixed(0)}% →{' '}
                        Actual: {(desv.valorActual * 100).toFixed(0)}%
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          desv.porcentajeDesviacion < 0 ? 'text-red-300' : 'text-green-300'
                        }`}
                      >
                        {desv.porcentajeDesviacion > 0 ? '+' : ''}
                        {(desv.porcentajeDesviacion * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {alerta.recomendaciones.length > 0 && (
              <div className="mb-4">
                <p className="text-white/70 text-sm font-semibold mb-2">Recomendaciones:</p>
                <ul className="space-y-1">
                  {alerta.recomendaciones.map((rec, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-white/50">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Acciones previas */}
            {alerta.acciones.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-black/20 border border-white/10">
                <p className="text-white/70 text-sm font-semibold mb-2">Acciones tomadas:</p>
                <div className="space-y-2">
                  {alerta.acciones.map((accion, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="text-white font-medium">{accion.tipo}</p>
                      <p className="text-white/70">{accion.descripcion}</p>
                      <p className="text-white/50 text-xs">
                        {new Date(accion.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              {!alerta.leida && (
                <button
                  onClick={() => handleMarcarLeida(alerta._id)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  <HiCheckCircle className="text-lg" />
                  Marcar como leída
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedAlerta(alerta)
                  setShowActionModal(true)
                }}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass-button text-white font-semibold disabled:opacity-50"
              >
                <HiExclamationTriangle className="text-lg" />
                Registrar acción
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Registrar Acción */}
      {showActionModal && selectedAlerta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Registrar Acción</h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-white/70 hover:text-white"
              >
                <HiXCircle className="text-3xl" />
              </button>
            </div>

            <p className="text-white/70 mb-6">
              Paciente: <strong className="text-white">{selectedAlerta.pacienteId.nombre}</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/70 text-sm mb-2">Tipo de Acción</label>
                <select
                  value={accionTipo}
                  onChange={(e) => setAccionTipo(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="cita_programada">Cita programada</option>
                  <option value="ajuste_medicacion">Ajuste de medicación</option>
                  <option value="derivacion_especialista">Derivación a especialista</option>
                  <option value="seguimiento_telefonico">Seguimiento telefónico</option>
                  <option value="evaluacion_neuropsicologica">Evaluación neuropsicológica</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Descripción</label>
                <textarea
                  value={accionDescripcion}
                  onChange={(e) => setAccionDescripcion(e.target.value)}
                  rows={4}
                  placeholder="Describe la acción tomada..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarAccion}
                disabled={loading || !accionTipo || !accionDescripcion}
                className="flex-1 px-4 py-3 rounded-lg glass-button text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
