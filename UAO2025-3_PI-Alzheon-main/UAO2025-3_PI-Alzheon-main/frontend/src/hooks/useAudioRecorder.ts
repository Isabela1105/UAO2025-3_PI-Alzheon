import { useCallback, useEffect, useRef, useState } from 'react'

interface RecorderConfig {
  onError?: (message: string) => void
}

export const useAudioRecorder = ({ onError }: RecorderConfig = {}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startTimer = () => {
    clearTimer()
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const reset = useCallback(() => {
    clearTimer()
    stopStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    setIsRecording(false)
    setIsPaused(false)
    setElapsedTime(0)
    setAudioURL(null)
    setAudioBlob(null)
  }, [])

  const startRecording = useCallback(async () => {
    if (isRecording) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioURL(url)
        stopStream()
        clearTimer()
      }

      recorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setElapsedTime(0)
      startTimer()
    } catch (error) {
      reset()
      if (error instanceof Error) {
        onError?.(error.message)
      } else {
        onError?.('No se pudo iniciar la grabación')
      }
    }
  }, [isRecording, onError, reset])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const togglePause = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder || !isRecording) return

    if (recorder.state === 'recording') {
      recorder.pause()
      clearTimer()
      setIsPaused(true)
    } else if (recorder.state === 'paused') {
      recorder.resume()
      startTimer()
      setIsPaused(false)
    }
  }, [isRecording])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return {
    isRecording,
    isPaused,
    elapsedTime,
    audioURL,
    audioBlob,
    startRecording,
    stopRecording,
    togglePause,
    reset,
  }
}
