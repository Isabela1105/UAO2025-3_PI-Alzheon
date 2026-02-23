import { useState } from 'react'

export function useForm<T extends Record<string, unknown>> (initialForm: T) {

  const [form, setForm] = useState<T>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  // Get and set the input values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target
    setForm({
      ...form,
      [name]: value
    })
  }

  // validators that use regular expressions to match errors
  // eslint-disable-next-line no-unused-vars
  const validators: Record<string, (value: string) => string> = {
    email: (value: string) => !/^\S+@\S+\.\S+$/.test(value) ? 'Correo electrónico inválido' : '',
    password: (value: string) => value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : '',
    phone: (value: string) => !/^\d{10}$/.test(value) ? 'El teléfono debe tener 10 dígitos' : '',
    telefono: (value: string) => !/^\d{10}$/.test(value) ? 'El teléfono debe tener 10 dígitos' : '',
    nombre: (value: string) => value.length < 2 ? 'El nombre debe tener al menos 2 caracteres' : '',
    rol: (value: string) => !value ? 'Debes seleccionar un rol' : '',
    confirm: (value: string) => {
      // Check if passwords match
      return value !== form.password ? 'Las contraseñas no coinciden' : ''
    },
  }

  // Enhanced validation function with better type handling
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate each field
    Object.entries(form).forEach(([name, value]) => {
      const trimmedValue = (value as string).trim()

      // Solo validamos si el campo tiene un valor (ha sido modificado)
      if (trimmedValue) {
        // Apply field-specific validator if available
        const validator = validators[name]
        if (validator) {
          const error = validator(trimmedValue)
          if (error) {
            newErrors[name] = error
          }
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // allow to see the password field
  const handleToggleShow = () => {
    setShowPassword(!showPassword)
  }

  // set the form blank
  const handleReset = () => {
    setForm(initialForm)
    setErrors({})
  }


  return {
    ...form,
    form,
    errors,
    showPassword,
    handleInputChange,
    handleToggleShow,
    handleReset,
    validateForm
  }
}
