import { FormEvent, useEffect, useMemo, useState } from 'react'
import { HiCheckCircle, HiLockClosed, HiShieldCheck } from 'react-icons/hi2'
import { toast } from 'sonner'
import { PatientProfile, ReminderFrequency, ReminderSettings } from '../../../services/api'

interface PatientSettingsProps {
  reminders: ReminderSettings
  profile: PatientProfile
  onSaveReminders: (settings: ReminderSettings) => Promise<void>
  onSaveProfile: (profile: PatientProfile) => Promise<void>
  onChangePassword: (payload: { currentPassword: string, newPassword: string }) => Promise<void>
}

const frequencyOptions: { label: string, value: ReminderFrequency }[] = [
  { label: 'Diario', value: 'diario' },
  { label: 'Cada 2 días', value: 'cada_2_dias' },
  { label: 'Semanal', value: 'semanal' },
]

type Tab = 'recordatorios' | 'perfil' | 'privacidad'

export const PatientSettings = ({
  reminders,
  profile,
  onSaveReminders,
  onSaveProfile,
  onChangePassword,
}: PatientSettingsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('recordatorios')
  const [reminderForm, setReminderForm] = useState(reminders)
  const [profileForm, setProfileForm] = useState(profile)
  const [savingReminders, setSavingReminders] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    setReminderForm(reminders)
  }, [reminders])

  useEffect(() => {
    setProfileForm(profile)
  }, [profile])

  const handleReminderSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSavingReminders(true)
    try {
      await onSaveReminders(reminderForm)
      toast.success('Recordatorios actualizados')
    } catch (error) {
      toast.error('No pudimos actualizar tus recordatorios')
    } finally {
      setSavingReminders(false)
    }
  }

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      await onSaveProfile(profileForm)
      toast.success('Tu perfil se guardó correctamente')
    } catch (error) {
      toast.error('Ocurrió un error al guardar tu perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const nextSessionText = useMemo(() => {
    if (!reminderForm.enabled || !reminderForm.nextSession) return 'Activa un recordatorio para mantener tu rutina.'
    const date = new Date(reminderForm.nextSession)
    return `Próxima sesión: ${date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })} a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  }, [reminderForm])

  return (
    <section className="w-full px-4 pb-16 sm:px-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="patient-section-title">Configuración</p>
          <h2 className="text-3xl font-semibold">Ajusta tu experiencia</h2>
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
          {(['recordatorios', 'perfil', 'privacidad'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-white/30 text-[#0A1220]' : 'glass-button text-white'
              }`}
            >
              {tab === 'recordatorios' && 'Mis recordatorios'}
              {tab === 'perfil' && 'Mi perfil'}
              {tab === 'privacidad' && 'Privacidad'}
            </button>
          ))}
        </div>

        {activeTab === 'recordatorios' && (
          <form className="mt-6 grid gap-6 lg:grid-cols-2" onSubmit={handleReminderSubmit}>
            <div className="glass-card p-6 flex flex-col gap-4">
              <label className="flex items-center justify-between">
                <span className="text-lg font-semibold">Recordatorios activos</span>
                <button
                  type="button"
                  onClick={() => setReminderForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-16 h-8 rounded-full relative transition-colors ${
                    reminderForm.enabled ? 'bg-[#3B9CFF]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${
                      reminderForm.enabled ? 'translate-x-8' : ''
                    }`}
                  />
                </button>
              </label>

              <label className="text-sm text-white/70 flex flex-col gap-2">
                Selecciona la hora
                <input
                  type="time"
                  value={reminderForm.hour}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, hour: e.target.value }))}
                  className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
                />
              </label>

              <label className="text-sm text-white/70 flex flex-col gap-2">
                Frecuencia
                <select
                  value={reminderForm.frequency}
                  onChange={(e) =>
                    setReminderForm((prev) => ({ ...prev, frequency: e.target.value as ReminderFrequency }))
                  }
                  className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-[#0A1220]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-white/70 flex flex-col gap-2">
                Mensaje motivador
                <textarea
                  value={reminderForm.motivationalMessage}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, motivationalMessage: e.target.value }))}
                  rows={4}
                  className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
                />
              </label>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-[#3B9CFF] py-3 font-semibold disabled:opacity-60"
                disabled={savingReminders}
              >
                {savingReminders ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            <div className="glass-card p-6 flex flex-col gap-4">
              <HiCheckCircle className="text-4xl text-[#E8C39E]" />
              <p className="text-lg font-semibold">
                {reminderForm.enabled ? 'Recordatorios activos' : 'Recordatorios desactivados'}
              </p>
              <p className="text-white/70 text-sm">{nextSessionText}</p>
              <span className="text-white/60 text-sm">
                Puedes pausar tus recordatorios en cualquier momento si necesitas descansar.
              </span>
            </div>
          </form>
        )}

        {activeTab === 'perfil' && (
          <form className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]" onSubmit={handleProfileSubmit}>
            <div className="glass-card p-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Nombre completo
                <input
                  type="text"
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Correo
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Teléfono
                <input
                  type="tel"
                  value={profileForm.telefono || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, telefono: e.target.value }))}
                  className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
                />
              </label>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[#3B9CFF] py-3 font-semibold disabled:opacity-60"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 rounded-full glass-button py-3 font-semibold"
                >
                  Cambiar contraseña
                </button>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col gap-3">
              <HiLockClosed className="text-4xl text-[#3B9CFF]" />
              <p className="text-lg font-semibold">Datos seguros</p>
              <span className="text-white/70 text-sm">
                Tus datos están protegidos. Si detectas alguna actividad inusual comunícate con tu cuidador.
              </span>
            </div>
          </form>
        )}

        {activeTab === 'privacidad' && (
          <div className="mt-6 glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <HiShieldCheck className="text-3xl text-[#3B9CFF]" />
              <div>
                <p className="text-xl font-semibold">Tu información está protegida</p>
                <span className="text-white/70 text-sm">Solo tu equipo de cuidado autorizado puede acceder.</span>
              </div>
            </div>
            <ul className="space-y-3 text-white/80">
              <li>• Las grabaciones y fotografías se almacenan cifradas.</li>
              <li>• Puedes solicitar que eliminemos cualquier registro cuando quieras.</li>
              <li>• Nunca compartiremos tus datos con terceros sin tu aprobación.</li>
            </ul>
          </div>
        )}
      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={async (payload) => {
            try {
              await onChangePassword(payload)
              toast.success('Contraseña actualizada')
              setShowPasswordModal(false)
            } catch (error) {
              toast.error('No pudimos actualizar tu contraseña')
            }
          }}
        />
      )}
    </section>
  )
}

interface ChangePasswordModalProps {
  onClose: () => void
  onSubmit: (payload: { currentPassword: string, newPassword: string }) => Promise<void>
}

const ChangePasswordModal = ({ onClose, onSubmit }: ChangePasswordModalProps) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const newErrors: Record<string, string> = {}
    if (form.newPassword.length < 8) {
      newErrors.newPassword = 'Debe tener al menos 8 caracteres.'
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = 'Incluye una mayúscula para mayor seguridad.'
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }
    setErrors(newErrors)
  }, [form])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.keys(errors).length > 0) return
    setSaving(true)
    try {
      await onSubmit({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form className="glass-panel relative max-w-lg w-full p-6 text-white" onSubmit={handleSubmit}>
        <h3 className="text-2xl font-semibold mb-4">Actualiza tu contraseña</h3>
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Contraseña actual
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Nueva contraseña
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
            />
            {errors.newPassword && <span className="text-red-200 text-xs">{errors.newPassword}</span>}
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Confirmar contraseña
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="rounded-2xl bg-white/10 px-4 py-3 border border-white/20 text-white"
            />
            {errors.confirmPassword && <span className="text-red-200 text-xs">{errors.confirmPassword}</span>}
          </label>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onClose} className="flex-1 glass-button rounded-full py-3 font-semibold">
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-full bg-[#3B9CFF] py-3 font-semibold disabled:opacity-50"
            disabled={saving || Object.keys(errors).length > 0}
          >
            {saving ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  )
}
