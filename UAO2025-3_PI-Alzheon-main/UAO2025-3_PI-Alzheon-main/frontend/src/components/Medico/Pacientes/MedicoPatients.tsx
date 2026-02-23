import { useState } from 'react'
import { HiPlus, HiPencil, HiTrash, HiUserPlus, HiXMark } from 'react-icons/hi2'
import { MedicoPatient, Caregiver } from '../../../services/medicoApi'

interface MedicoPatientsProps {
  patients: MedicoPatient[]
  availablePatients: MedicoPatient[]
  caregivers: Caregiver[]
  onAssignPatient: (pacienteId: string) => Promise<void>
  onUnassignPatient: (pacienteId: string) => Promise<void>
  onUpdatePatient: (pacienteId: string, data: { nombre: string; email: string }) => Promise<void>
  onAssignCaregiver: (pacienteId: string, cuidadorId: string) => Promise<void>
  loading?: boolean
}

export const MedicoPatients = ({
  patients,
  availablePatients,
  caregivers,
  onAssignPatient,
  onUnassignPatient,
  onUpdatePatient,
  onAssignCaregiver,
  loading,
}: MedicoPatientsProps) => {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCaregiverModal, setShowCaregiverModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<MedicoPatient | null>(null)
  const [editForm, setEditForm] = useState({ nombre: '', email: '' })
  const [selectedCaregiver, setSelectedCaregiver] = useState('')

  const handleEdit = (patient: MedicoPatient) => {
    setSelectedPatient(patient)
    setEditForm({ nombre: patient.nombre, email: patient.email })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (selectedPatient) {
      await onUpdatePatient(selectedPatient._id, editForm)
      setShowEditModal(false)
      setSelectedPatient(null)
    }
  }

  const handleAssignCaregiver = async () => {
    if (selectedPatient && selectedCaregiver) {
      await onAssignCaregiver(selectedPatient._id, selectedCaregiver)
      setShowCaregiverModal(false)
      setSelectedPatient(null)
      setSelectedCaregiver('')
    }
  }

  const unassignedPatients = availablePatients.filter(
    (ap) => !patients.find((p) => p._id === ap._id)
  )

  return (
    <section className="w-full px-4 pb-16 sm:px-6">
      <div className="flex items-center justify-between mb-6 text-white">
        <div>
          <p className="patient-section-title">Gestión de Pacientes</p>
          <h2 className="text-3xl font-semibold">Mis Pacientes</h2>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 glass-button rounded-full px-6 py-3 text-sm font-semibold"
        >
          <HiPlus className="text-xl" />
          Asignar Paciente
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-white">Cargando pacientes...</div>
      ) : patients.length === 0 ? (
        <div className="glass-card p-10 text-center text-white">
          <p className="text-xl font-semibold mb-2">No tienes pacientes asignados</p>
          <span className="text-white/70">Comienza asignando pacientes desde el botón superior.</span>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <div key={patient._id} className="glass-card p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {patient.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(patient)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    <HiPencil />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Desasignar este paciente?')) {
                        onUnassignPatient(patient._id)
                      }
                    }}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white"
                  >
                    <HiTrash />
                  </button>
                </div>
              </div>

              <div className="text-white mb-4">
                <h3 className="text-lg font-bold">{patient.nombre}</h3>
                <p className="text-sm text-white/70">{patient.email}</p>
              </div>

              {/* Estadísticas de progreso */}
              {patient.estadisticas && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                    <span>Progreso semanal</span>
                    <span className="text-white font-semibold">
                      {patient.estadisticas.grabacionesEstaSemana}/{patient.estadisticas.metaSemanal}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((patient.estadisticas.grabacionesEstaSemana / patient.estadisticas.metaSemanal) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/50 mt-2">
                    <span>{patient.estadisticas.totalFotos} fotos</span>
                    <span>{patient.estadisticas.totalGrabaciones} grabaciones</span>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-white/70 text-sm mb-2">
                  <span>Cuidadores:</span>
                  <button
                    onClick={() => {
                      setSelectedPatient(patient)
                      setShowCaregiverModal(true)
                    }}
                    className="text-blue-300 hover:text-blue-200 flex items-center gap-1"
                  >
                    <HiUserPlus className="text-lg" />
                    Asignar
                  </button>
                </div>
                {patient.cuidadores.length === 0 ? (
                  <p className="text-white/50 text-sm">Sin cuidadores asignados</p>
                ) : (
                  <div className="space-y-1">
                    {patient.cuidadores.map((cuidador) => (
                      <p key={cuidador._id} className="text-white text-sm">
                        • {cuidador.nombre}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Asignar Paciente */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Asignar Paciente</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <HiXMark className="text-2xl" />
              </button>
            </div>

            {unassignedPatients.length === 0 ? (
              <p className="text-white/70 text-center py-8">No hay pacientes disponibles para asignar</p>
            ) : (
              <div className="space-y-3">
                {unassignedPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-white font-semibold">{patient.nombre}</p>
                      <p className="text-white/70 text-sm">{patient.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onAssignPatient(patient._id)
                        setShowAssignModal(false)
                      }}
                      className="glass-button rounded-full px-4 py-2 text-sm font-semibold text-white"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Editar Paciente */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Editar Paciente</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <HiXMark className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Nombre</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-3 rounded-lg glass-button text-white font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Asignar Cuidador */}
      {showCaregiverModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Asignar Cuidador</h3>
              <button
                onClick={() => setShowCaregiverModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <HiXMark className="text-2xl" />
              </button>
            </div>

            <p className="text-white/70 mb-4">
              Asignando cuidador a: <strong className="text-white">{selectedPatient.nombre}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">Seleccionar Cuidador</label>
              <select
                value={selectedCaregiver}
                onChange={(e) => setSelectedCaregiver(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
              >
                <option value="">-- Seleccionar --</option>
                {caregivers.map((caregiver) => (
                  <option key={caregiver._id} value={caregiver._id} className="bg-[#0A1220]">
                    {caregiver.nombre} ({caregiver.email})
                    {caregiver.pacienteAsociado && ' - Ya asignado'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCaregiverModal(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignCaregiver}
                disabled={!selectedCaregiver}
                className="flex-1 px-4 py-3 rounded-lg glass-button text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
