import { useMemo, useRef, useState } from 'react'
import { HiPlay, HiDocument, HiMicrophone, HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import { PatientRecording } from '../../../services/api'

interface PatientRecordingsProps {
  recordings: PatientRecording[]
  loading?: boolean
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

const formatDate = (date: string) => {
  const localeDate = new Date(date)
  return localeDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export const PatientRecordings = ({ recordings, loading }: PatientRecordingsProps) => {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const orderedRecordings = useMemo(
    () =>
      [...recordings].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ),
    [recordings]
  )

  const handlePlay = (targetId: string) => {
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== targetId) {
        audio?.pause()
      }
    })
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section className="w-full px-4 pb-16 sm:px-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="patient-section-title">Mis grabaciones</p>
          <h2 className="text-3xl font-semibold">Escucha lo que has compartido</h2>
        </div>
        {recordings.length > 0 && (
          <span className="glass-button rounded-full px-4 py-2 text-sm">
            {recordings.length} registros
          </span>
        )}
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center">Cargando grabaciones...</div>
      ) : orderedRecordings.length === 0 ? (
        <div className="glass-panel p-10 text-center text-lg">
          Aún no has grabado descripciones. Cuando lo hagas, aparecerán aquí.
        </div>
      ) : (
        <div className="glass-panel p-6 space-y-4 patient-scroll max-h-[650px] overflow-auto">
          {orderedRecordings.map((recording) => {
            const isExpanded = expandedId === recording._id
            const hasAudio = recording.audioUrl && recording.tipoContenido !== 'texto'
            const hasTexto = recording.descripcionTexto
            const hasTranscripcion = recording.transcripcion

            return (
              <div key={recording._id} className="glass-card p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/20 shadow-lg flex-shrink-0">
                      <img src={recording.fotoUrl} alt={recording.nota || 'Foto descrita'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm uppercase tracking-[0.4em] text-white/70">Grabado el</p>
                      <h3 className="text-xl font-semibold">{formatDate(recording.fecha)}</h3>
                      {recording.nota && <p className="text-white/70 text-sm mt-1 truncate">{recording.nota}</p>}
                      
                      <div className="flex gap-2 mt-2">
                        {hasAudio && (
                          <span className="inline-flex items-center gap-1 text-xs bg-[#3B9CFF]/20 text-[#3B9CFF] px-2 py-1 rounded-full">
                            <HiMicrophone />
                            Audio
                          </span>
                        )}
                        {hasTexto && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                            <HiDocument />
                            Texto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasAudio && recording.duracion > 0 && (
                    <div className="text-sm text-white/70">
                      Duración <span className="font-semibold text-white">{formatDuration(recording.duracion)}</span>
                    </div>
                  )}
                </div>

                {/* Audio Player */}
                {hasAudio && (
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                      <HiPlay className="text-lg text-[#3B9CFF]" />
                      Escuchar grabación
                    </div>
                    <audio
                      controls
                      src={recording.audioUrl}
                      className="w-full"
                      ref={(element) => {
                        audioRefs.current[recording._id] = element
                      }}
                      onPlay={() => handlePlay(recording._id)}
                    >
                      Tu navegador no soporta la reproducción de audio.
                    </audio>
                  </div>
                )}

                {/* Descripción de texto */}
                {hasTexto && (
                  <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                        <HiDocument className="text-lg" />
                        Descripción escrita
                      </div>
                      {recording.descripcionTexto && recording.descripcionTexto.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(recording._id)}
                          className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>Mostrar menos <HiChevronUp /></>
                          ) : (
                            <>Mostrar más <HiChevronDown /></>
                          )}
                        </button>
                      )}
                    </div>
                    <p className={`text-white/90 text-sm whitespace-pre-wrap ${!isExpanded && recording.descripcionTexto && recording.descripcionTexto.length > 150 ? 'line-clamp-3' : ''}`}>
                      {recording.descripcionTexto}
                    </p>
                  </div>
                )}

                {/* Transcripción */}
                {hasTranscripcion && !hasTexto && (
                  <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                        <HiDocument className="text-lg" />
                        Transcripción automática
                      </div>
                      {recording.transcripcion && recording.transcripcion.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(recording._id)}
                          className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>Mostrar menos <HiChevronUp /></>
                          ) : (
                            <>Mostrar más <HiChevronDown /></>
                          )}
                        </button>
                      )}
                    </div>
                    <p className={`text-white/80 text-sm italic whitespace-pre-wrap ${!isExpanded && recording.transcripcion && recording.transcripcion.length > 150 ? 'line-clamp-3' : ''}`}>
                      {recording.transcripcion}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
