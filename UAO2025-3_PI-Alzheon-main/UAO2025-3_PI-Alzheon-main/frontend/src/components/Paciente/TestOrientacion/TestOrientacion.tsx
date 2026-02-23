import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { obtenerTestDelDia, responderPregunta, reiniciarMiTest, TestOrientacion as TestData } from '../../../services/orientacionApi'

export const TestOrientacion = () => {
  const [test, setTest] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [respondiendo, setRespondiendo] = useState(false)
  const [reiniciando, setReiniciando] = useState(false)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [resultados, setResultados] = useState<Record<string, boolean | null>>({})

  useEffect(() => {
    cargarTest()
  }, [])

  const cargarTest = async () => {
    try {
      setLoading(true)
      const data = await obtenerTestDelDia()
      setTest(data)
      
      // Inicializar respuestas con las del servidor
      const respuestasIniciales: Record<string, string> = {}
      const resultadosIniciales: Record<string, boolean | null> = {}
      
      Object.entries(data.preguntas).forEach(([key, pregunta]) => {
        respuestasIniciales[key] = pregunta.respuestaUsuario || ''
        resultadosIniciales[key] = pregunta.correcta ?? null
      })
      
      setRespuestas(respuestasIniciales)
      setResultados(resultadosIniciales)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error al cargar el test')
      }
    } finally {
      setLoading(false)
    }
  }

  const manejarCambioRespuesta = (nombrePregunta: string, valor: string) => {
    setRespuestas(prev => ({
      ...prev,
      [nombrePregunta]: valor
    }))
  }

  const manejarEnviarRespuesta = async (nombrePregunta: string) => {
    const respuesta = respuestas[nombrePregunta]?.trim()
    
    if (!respuesta) {
      toast.error('Por favor ingresa una respuesta')
      return
    }

    try {
      setRespondiendo(true)
      const resultado = await responderPregunta(nombrePregunta, respuesta)
      
      // Actualizar resultados
      setResultados(prev => ({
        ...prev,
        [nombrePregunta]: resultado.pregunta.correcta ?? null
      }))

      if (resultado.correcta) {
        toast.success('¡Correcto!')
      } else {
        toast.error('Respuesta incorrecta, intenta de nuevo')
      }

      // Si el test se completó, actualizar la puntuación
      if (resultado.completado) {
        setTest(prev => {
          if (!prev) return null
          return {
            ...prev,
            completado: true,
            puntuacionOrientacion: resultado.puntuacionOrientacion ?? 0,
            areasProblematicas: resultado.areasProblematicas ?? []
          } as TestData
        })
        
        toast.success(`¡Test completado! Puntuación: ${resultado.puntuacionOrientacion}%`)
        
        // Mostrar áreas problemáticas si las hay
        if (resultado.areasProblematicas && resultado.areasProblematicas.length > 0) {
          const areas = resultado.areasProblematicas.join(', ')
          toast.info(`Áreas a trabajar: ${areas}`)
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error al enviar respuesta')
      }
    } finally {
      setRespondiendo(false)
    }
  }

  const manejarReiniciar = async () => {
    try {
      setReiniciando(true)
      await reiniciarMiTest()
      toast.success('Test reiniciado. Cargando nuevo...')
      
      // Recargar el test
      await cargarTest()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error al reiniciar el test')
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
          <p>Cargando test de orientación...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="text-center p-8 text-red-600">
        Error al cargar el test
      </div>
    )
  }

  const preguntasArray = Object.entries(test.preguntas)
  const preguntasRespondidas = preguntasArray.filter(([_, p]) => p.respuestaUsuario).length

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Test de Orientación Temporal y Espacial
        </h2>
        <p className="text-gray-600">
          Responde las siguientes preguntas para evaluar tu orientación.
        </p>
        
        {test.completado && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="font-semibold text-green-800">
              ✓ Test Completado
            </p>
            <p className="text-green-700">
              Puntuación: <span className="font-bold text-lg">{test.puntuacionOrientacion}%</span>
            </p>
            {test.areasProblematicas && test.areasProblematicas.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                Áreas a mejorar: {test.areasProblematicas.join(', ')}
              </p>
            )}
          </div>
        )}
        
        {!test.completado && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-700">
              Progreso: {preguntasRespondidas} de {preguntasArray.length} preguntas respondidas
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(preguntasRespondidas / preguntasArray.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {preguntasArray.map(([nombrePregunta, pregunta]) => {
          const estado = resultados[nombrePregunta]
          const esCorrecta = estado === true
          const esIncorrecta = estado === false

          return (
            <div
              key={nombrePregunta}
              className={`p-4 rounded-lg border-2 transition-all ${
                esCorrecta
                  ? 'bg-green-50 border-green-500'
                  : esIncorrecta
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-white border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <label className="font-semibold text-gray-800 flex-1">
                  {pregunta.pregunta}
                </label>
                {esCorrecta && (
                  <span className="text-green-600 text-xl ml-2">✓</span>
                )}
                {esIncorrecta && (
                  <span className="text-orange-600 text-xl ml-2">✗</span>
                )}
              </div>

              {!test.completado ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={respuestas[nombrePregunta] || ''}
                    onChange={(e) => manejarCambioRespuesta(nombrePregunta, e.target.value)}
                    placeholder="Tu respuesta..."
                    disabled={esCorrecta || respondiendo}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !esCorrecta) {
                        manejarEnviarRespuesta(nombrePregunta)
                      }
                    }}
                  />
                  <button
                    onClick={() => manejarEnviarRespuesta(nombrePregunta)}
                    disabled={!respuestas[nombrePregunta]?.trim() || esCorrecta || respondiendo}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {respondiendo ? '...' : 'Enviar'}
                  </button>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-gray-700">
                    Tu respuesta: <span className="font-semibold">{pregunta.respuestaUsuario}</span>
                  </p>
                  <p className="text-gray-600 mt-1">
                    Intentos: {pregunta.intentos}
                  </p>
                </div>
              )}

              {esIncorrecta && (
                <div className="mt-2 p-2 bg-orange-100 rounded text-sm text-orange-800">
                  Intenta de nuevo. Tienes {pregunta.intentos} intento(s).
                </div>
              )}
            </div>
          )
        })}
      </div>

      {test.completado && (
        <div className="mt-8 text-center">
          <button
            onClick={manejarReiniciar}
            disabled={reiniciando}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {reiniciando ? 'Reiniciando...' : 'Reiniciar Test'}
          </button>
        </div>
      )}
    </div>
  )
}
