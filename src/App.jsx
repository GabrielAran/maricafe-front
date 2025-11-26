import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ContactoPage from "./pages/ContactoPage"
import ProductosPage from './pages/ProductosPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import './App.css'
import BackToTopButton from './components/ui/BackToTopButton'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [pageData, setPageData] = useState(null)

  const handleNavigate = (page, data = null) => {
    // Scroll to top smoothly when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentPage(page)
    setPageData(data)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />
      case 'productos':
        return <ProductosPage onNavigate={handleNavigate} />
      case 'product':
        return <ProductPage onNavigate={handleNavigate} productId={pageData?.productId} />
      case 'catering':
        return <div>Página de Catering (próximamente)</div>
      case 'contacto':
        return <ContactoPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />
      case 'admin':
        return <AdminPanel />
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />
      case 'order-details':
        return <OrderDetailsPage onNavigate={handleNavigate} orderId={pageData?.orderId} />
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
      <BackToTopButton />
      <ToastContainer />
    </div>
  )
}

export default App
