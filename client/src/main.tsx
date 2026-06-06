import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n.ts'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'
import { NotificationProvider } from './context/NotificationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <NotificationProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </NotificationProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
