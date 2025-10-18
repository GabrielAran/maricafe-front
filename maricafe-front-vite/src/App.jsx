import { useState } from 'react'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductosPage from './pages/ProductosPage.jsx'
import TortasPage from './pages/TortasPage.jsx'
import TazasPage from './pages/TazasPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'productos':
        return <ProductosPage />
      case 'tortas':
        return <TortasPage />
      case 'catering':
        return <div>Página de Catering (próximamente)</div>
      case 'tazas':
        return <TazasPage />
      case 'contacto':
        return <div>Página de Contacto (próximamente)</div>
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />
      case 'admin':
        return <AdminPanel />
      default:
        return <HomePage />
    }
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-background">
          <Header onNavigate={setCurrentPage} currentPage={currentPage} />
          <main className="flex-1">
            {renderPage()}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
