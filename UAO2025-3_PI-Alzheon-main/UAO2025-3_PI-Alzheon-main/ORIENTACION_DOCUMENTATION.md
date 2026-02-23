# Modo de Orientación Temporal y Espacial - Documentación

## 📋 Descripción

Se ha implementado un sistema completo de orientación temporal y espacial con preguntas diarias que permite:

- **Pacientes**: Responder preguntas diarias de orientación temporal y espacial
- **Médicos**: Monitorear el progreso de orientación de sus pacientes
- **Sistema**: Detectar automáticamente áreas problemáticas y generar estadísticas

## 🎯 Características Principales

### Para Pacientes

1. **Test Diario Automático**
   - Se crea automáticamente un nuevo test cada día
   - Preguntas sobre: día, mes, año, hora, ciudad, país, lugar específico
   - Interfaz interactiva con validación de respuestas

2. **Preguntas Incluidas**
   - ¿Qué día de la semana es hoy?
   - ¿Cuál es la fecha de hoy?
   - ¿En qué mes estamos?
   - ¿En qué año estamos?
   - ¿Qué hora es aproximadamente?
   - ¿En qué ciudad estamos?
   - ¿En qué país estamos?
   - ¿En qué lugar específico estamos?

3. **Validación Inteligente**
   - Búsqueda flexible para fechas
   - Tolerancia de ±1 hora para preguntas de hora
   - Ignora acentos y mayúsculas/minúsculas
   - Múltiples intentos permitidos

4. **Estadísticas Personalizadas**
   - Puntuación de orientación (0-100%)
   - Historial de tests
   - Tendencias (mejorado, deteriorado, estable)
   - Identificación de áreas problemáticas
   - Gráficos y visualización de datos

### Para Médicos

1. **Monitoreo de Pacientes**
   - Ver historial de orientación de cada paciente
   - Identificar áreas problemáticas recurrentes
   - Comparar evolución en diferentes períodos

2. **Admin Actions**
   - Reiniciar test del día (si es necesario repetir)
   - Ver detalles completos de cada test

## 🛠️ Implementación Técnica

### Backend

**Archivos Nuevos:**
- `/backend/models/orientacionDiaria.js` - Esquema de datos
- `/backend/controllers/orientacionController.js` - Lógica de negocio

**Rutas Agregadas:**
```javascript
// Paciente
GET    /api/paciente/orientacion
POST   /api/paciente/orientacion/responder
GET    /api/paciente/orientacion/historial
GET    /api/paciente/orientacion/estadisticas
GET    /api/paciente/orientacion/:testId

// Médico
GET    /api/medico/pacientes/:pacienteId/orientacion
POST   /api/medico/pacientes/:pacienteId/orientacion/reiniciar
```

### Frontend

**Componentes Nuevos:**
- `/frontend/src/components/Paciente/TestOrientacion/TestOrientacion.tsx` - Test interactivo
- `/frontend/src/components/Paciente/TestOrientacion/EstadisticasOrientacion.tsx` - Estadísticas
- `/frontend/src/components/Medico/OrientacionMedico/OrientacionMedico.tsx` - Vista médico

**Servicio:**
- `/frontend/src/services/orientacionApi.ts` - Llamadas API

## 📱 Cómo Integrar en el Dashboard del Paciente

En el archivo del Dashboard del paciente, importa y usa el componente:

```typescript
import { TestOrientacion, EstadisticasOrientacion } from '@/components/Paciente/TestOrientacion'

export const PatientDashboard = () => {
  const [tab, setTab] = useState('test') // o 'estadisticas'

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setTab('test')}>Test de Hoy</button>
        <button onClick={() => setTab('estadisticas')}>Mis Estadísticas</button>
      </div>

      {tab === 'test' && <TestOrientacion />}
      {tab === 'estadisticas' && <EstadisticasOrientacion />}
    </div>
  )
}
```

## 📊 Cómo Integrar en la Vista del Médico

En la vista de detalles del paciente del médico:

```typescript
import { OrientacionMedico } from '@/components/Medico/OrientacionMedico/OrientacionMedico'

export const PatientDetailsView = ({ pacienteId, nombrePaciente }) => {
  const [tab, setTab] = useState('general')

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setTab('general')}>General</button>
        <button onClick={() => setTab('orientacion')}>Orientación</button>
      </div>

      {tab === 'orientacion' && (
        <OrientacionMedico 
          pacienteId={pacienteId} 
          nombrePaciente={nombrePaciente} 
        />
      )}
    </div>
  )
}
```

## 🔐 Seguridad y Privacidad

- Las respuestas correctas **nunca se envían al frontend** durante el test
- Los pacientes solo ven sus propios datos
- Los médicos solo ven datos de pacientes asignados
- Autenticación requerida en todas las rutas

## 📈 Interpretación de Resultados

### Puntuación
- **80-100%**: Orientación excelente
- **60-79%**: Orientación adecuada
- **0-59%**: Problemas de orientación que requieren atención

### Áreas Problemáticas
- **Temporal**: Dificultades con día, mes, año, hora
- **Espacial**: Dificultades con ubicación geográfica

### Tendencia
- **Mejorado**: Progreso positivo en pruebas recientes
- **Deteriorado**: Declive en desempeño
- **Estable**: Sin cambios significativos

## 🔄 Automáticamente Crea

- Un nuevo test cada día a las 00:00 horas
- Las preguntas se generan con la fecha/hora actual
- Las respuestas correctas se ajustan automáticamente
- Se calcela la puntuación al responder la última pregunta

## 📝 Variables de Entorno

En `.env` del backend, puedes configurar:

```
CIUDAD_DEFAULT=Cali
PAIS_DEFAULT=Colombia
LUGAR_DEFAULT=Hogar
```

## 🧪 Testing

Para probar manualmente:

1. Inicia sesión como paciente
2. Navega al test de orientación
3. Responde las preguntas
4. Verifica las estadísticas
5. Como médico, visualiza el historial del paciente

## 🐛 Troubleshooting

**Problema**: Las preguntas no se crean automáticamente
- Solución: Asegúrate de que el modelo esté importado en router.js

**Problema**: Las respuestas no se validan correctamente
- Solución: Revisa la función `normalizarRespuesta()` en el controlador

**Problema**: Los componentes no se renderizam
- Solución: Verifica que los servicios tengan la URL correcta del backend

## 🔮 Futuras Mejoras

- [ ] Exportar historial a PDF
- [ ] Integración con pruebas cognitivas más complejas
- [ ] Alertas automáticas para médicos si baja puntuación
- [ ] Comparativa con línea base establecida
- [ ] Análisis de patrones temporales

## 📞 Soporte

Si tienes problemas o preguntas sobre la integración, contacta al equipo de desarrollo.
