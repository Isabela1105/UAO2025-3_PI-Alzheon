import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/glassmorphism.css'
import { store } from './store/store'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { BrowserRouter } from 'react-router-dom'
import { Alzheon } from './Alzheon.tsx'
import { AuthProvider } from './components/auth/AuthProvider'

const rootElement = document.getElementById('root') as HTMLDivElement

createRoot(rootElement ?? (() => { throw new Error('Root element not found') })()).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position='top-right' richColors/>
          <Alzheon />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
