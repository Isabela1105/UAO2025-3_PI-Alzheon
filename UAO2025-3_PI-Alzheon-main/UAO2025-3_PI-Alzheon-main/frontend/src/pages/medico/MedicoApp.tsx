import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Navbar } from '../../components/generics/Navbar'
import { Footer } from '../../components/generics/Footer'
import { useAuth } from '../../hooks/useAuth'
import {
  MedicoPatient,
  PatientDetails,
  MedicoPhoto,
  MedicoRecording,
  Caregiver,
  DoctorStats,
  fetchDoctorStats,
  fetchAssignedPatients,
  fetchPatientDetails,
  fetchPatientPhotos,
  fetchPatientRecordings,
  fetchAvailableCaregivers,
  assignPatient,
  unassignPatient,
  updatePatientInfo,
  assignCaregiverToPatient,
  fetchAvailablePatients,
} from '../../services/medicoApi'

// Importar los componentes del médico (los crearemos después)
import { MedicoDashboard } from '../../components/Medico/Dashboard/MedicoDashboard'
import { MedicoPatients } from '../../components/Medico/Pacientes/MedicoPatients'
import { MedicoPatientDetail } from '../../components/Medico/DetallesPaciente/MedicoPatientDetail'
import { MedicoNavbar } from '../../components/Medico/Navbar/MedicoNavbar'

export const MedicoApp = () => {
  const { status, user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState<DoctorStats>({
    totalPacientes: 0,
    totalFotos: 0,
    totalGrabaciones: 0,
    grabacionesEstaSemana: 0,
  })
  const [patients, setPatients] = useState<MedicoPatient[]>([])
  const [availablePatients, setAvailablePatients] = useState<MedicoPatient[]>([])
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, patientsData, caregiversData, availablePatientsData] = await Promise.all([
          fetchDoctorStats(),
          fetchAssignedPatients(),
          fetchAvailableCaregivers(),
          fetchAvailablePatients(),
        ])
        setStats(statsData)
        setPatients(patientsData)
        setCaregivers(caregiversData)
        setAvailablePatients(availablePatientsData)
      } catch (error) {
        toast.error('Error al cargar los datos')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status])

  const handleAssignPatient = async (pacienteId: string) => {
    try {
      await assignPatient(pacienteId)
      toast.success('Paciente asignado correctamente')
      
      // Recargar datos
      const [patientsData, statsData, availablePatientsData] = await Promise.all([
        fetchAssignedPatients(),
        fetchDoctorStats(),
        fetchAvailablePatients(),
      ])
      setPatients(patientsData)
      setStats(statsData)
      setAvailablePatients(availablePatientsData)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al asignar paciente')
    }
  }

  const handleUnassignPatient = async (pacienteId: string) => {
    try {
      await unassignPatient(pacienteId)
      toast.success('Paciente desasignado correctamente')
      
      // Recargar datos
      const [patientsData, statsData, availablePatientsData] = await Promise.all([
        fetchAssignedPatients(),
        fetchDoctorStats(),
        fetchAvailablePatients(),
      ])
      setPatients(patientsData)
      setStats(statsData)
      setAvailablePatients(availablePatientsData)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al desasignar paciente')
    }
  }

  const handleUpdatePatient = async (
    pacienteId: string,
    data: { nombre: string; email: string }
  ) => {
    try {
      await updatePatientInfo(pacienteId, data)
      toast.success('Información actualizada correctamente')
      
      // Recargar pacientes
      const patientsData = await fetchAssignedPatients()
      setPatients(patientsData)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar')
    }
  }

  const handleAssignCaregiver = async (pacienteId: string, cuidadorId: string) => {
    try {
      await assignCaregiverToPatient(pacienteId, cuidadorId)
      toast.success('Cuidador asignado correctamente')
      
      // Recargar datos
      const [patientsData, caregiversData] = await Promise.all([
        fetchAssignedPatients(),
        fetchAvailableCaregivers(),
      ])
      setPatients(patientsData)
      setCaregivers(caregiversData)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al asignar cuidador')
    }
  }

  if (status === 'not authenticated') {
    return <Navigate to="/login" replace />
  }

  if (!user.rol || user.rol.toLowerCase() !== 'medico') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex flex-col patient-gradient-bg">
      <Navbar />

      <main className="flex-1 pb-12">
        <MedicoNavbar 
          userName={user.nombre ?? 'Médico'} 
          userEmail={user.email}
        />

        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
          <Routes>
            <Route
              path="dashboard"
              element={
                <MedicoDashboard
                  userName={user.nombre ?? 'Médico'}
                  stats={stats}
                  patients={patients}
                  onNavigate={(path) => navigate(path)}
                />
              }
            />
            <Route
              path="pacientes"
              element={
                <MedicoPatients
                  patients={patients}
                  availablePatients={availablePatients}
                  caregivers={caregivers}
                  onAssignPatient={handleAssignPatient}
                  onUnassignPatient={handleUnassignPatient}
                  onUpdatePatient={handleUpdatePatient}
                  onAssignCaregiver={handleAssignCaregiver}
                  loading={loading}
                />
              }
            />
            <Route
              path="pacientes/:pacienteId"
              element={
                <MedicoPatientDetail
                  caregivers={caregivers}
                  onAssignCaregiver={handleAssignCaregiver}
                />
              }
            />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  )
}
