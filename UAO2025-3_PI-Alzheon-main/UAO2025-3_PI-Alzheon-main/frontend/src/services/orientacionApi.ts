import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5500'

export const orientacionApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
})

// Interfaces
export interface Pregunta {
  pregunta: string
  respuestaUsuario?: string | null
  correcta?: boolean | null
  intentos: number
}

export interface TestOrientacion {
  _id: string
  fecha: string
  preguntas: {
    diaSemana: Pregunta
    fechaCompleta: Pregunta
    mes: Pregunta
    año: Pregunta
    hora: Pregunta
    ciudad: Pregunta
    pais: Pregunta
    lugarEspecifico: Pregunta
  }
  completado: boolean
  puntuacionOrientacion?: number
  respuestasCorrectas?: number
  areasProblematicas?: string[]
}

export interface RespuestaTest {
  correcta: boolean
  pregunta: Pregunta
  completado: boolean
  puntuacionOrientacion?: number
  areasProblematicas?: string[]
}

export interface HistorialItem {
  _id: string
  fecha: string
  puntuacionOrientacion: number
  respuestasCorrectas: number
  respuestasIncorrectas: number
  totalRespuestas: number
  completado: boolean
  duracion?: number
  areasProblematicas: string[]
}

export interface EstadisticasOrientacion {
  totalTests: number
  testCompletados: number
  puntuacionPromedio: number
  puntuacionMinima: number
  puntuacionMaxima: number
  areasProblematicasComunes: Array<{ area: string; frecuencia: number }>
  tendencia: 'mejorado' | 'deteriorado' | 'estable' | 'sin datos'
}

// Obtener test del día
export const obtenerTestDelDia = async (): Promise<TestOrientacion> => {
  const { data } = await orientacionApiClient.get('/paciente/orientacion')
  return data
}

// Responder una pregunta
export const responderPregunta = async (
  nombrePregunta: string,
  respuesta: string
): Promise<RespuestaTest> => {
  const { data } = await orientacionApiClient.post('/paciente/orientacion/responder', {
    nombrePregunta,
    respuesta
  })
  return data
}

// Obtener historial
export const obtenerHistorial = async (dias: number = 30): Promise<HistorialItem[]> => {
  const { data } = await orientacionApiClient.get('/paciente/orientacion/historial', {
    params: { dias }
  })
  return data
}

// Obtener estadísticas
export const obtenerEstadisticas = async (dias: number = 30): Promise<EstadisticasOrientacion> => {
  const { data } = await orientacionApiClient.get('/paciente/orientacion/estadisticas', {
    params: { dias }
  })
  return data
}

// Obtener test completado
export const obtenerTestCompletado = async (testId: string): Promise<TestOrientacion> => {
  const { data } = await orientacionApiClient.get(`/paciente/orientacion/${testId}`)
  return data
}

// Reiniciar mi test (paciente)
export const reiniciarMiTest = async (): Promise<{ mensaje: string }> => {
  const { data } = await orientacionApiClient.post('/paciente/orientacion/reiniciar')
  return data
}

// Para el médico: obtener historial de un paciente
export const obtenerHistorialPaciente = async (pacienteId: string, dias: number = 30): Promise<HistorialItem[]> => {
  const { data } = await orientacionApiClient.get(`/medico/pacientes/${pacienteId}/orientacion`, {
    params: { dias }
  })
  return data
}

// Reiniciar test (médico)
export const reiniciarTestDelDia = async (pacienteId: string): Promise<{ mensaje: string }> => {
  const { data } = await orientacionApiClient.post(`/medico/pacientes/${pacienteId}/orientacion/reiniciar`)
  return data
}
