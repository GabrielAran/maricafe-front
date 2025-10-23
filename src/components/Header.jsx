import React, { useState } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import CartSheet from './CartSheet.jsx'

export default function Header({ onNavigate, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    onNavigate('home')
  }

  const handleNavigation = (page) => {
    onNavigate(page)
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* make container relative so we can absolutely center the desktop nav */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => handleNavigation('home')}
        >
          <img
            src="/cropped-LogoMaricafe-header.png"
            alt="Maricafe - Café Bar & LGBT Bookstore"
            className="h-12 w-auto"
          />
        </div>

    {/* Desktop Navigation */}
    {/* Absolutely center the desktop nav so links remain centered regardless
        of logo/actions presence (works for admin/non-auth states). */}
    <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
          <button 
            className={`transition-colors ${currentPage === 'home' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            onClick={() => handleNavigation('home')}
          >
            Inicio
          </button>
          {!isAdmin() && (
            <>
              <button 
                className={`transition-colors ${currentPage === 'productos' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                onClick={() => handleNavigation('productos')}
              >
                Productos
              </button>
              <button 
                className={`transition-colors ${currentPage === 'contacto' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                onClick={() => handleNavigation('contacto')}
              >
                Contacto
              </button>
            </>
          )}
          {isAuthenticated && isAdmin() && (
            <button 
              className={`transition-colors ${currentPage === 'admin' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => handleNavigation('admin')}
            >
              Panel de Administración
            </button>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Cart - Visible to all except admins, but access controlled */}
          {!isAdmin() && <CartSheet onNavigate={onNavigate} />}

          {/* User menu */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              {!isAdmin() && (
                <>
                  <span className="text-sm text-muted-foreground hidden md:block">
                    Hola, {user?.firstName}
                  </span>
                  <button 
                    onClick={() => handleNavigation('profile')}
                    className="p-2 text-foreground hover:text-primary transition-colors"
                    title="Mi Perfil"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </>
              )}
              {isAdmin() && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  ADMIN
                </span>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 text-foreground hover:text-destructive transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleNavigation('login')}
              className="p-2 text-foreground hover:text-primary transition-colors"
              title="Iniciar sesión"
            >
              <User className="h-5 w-5" />
            </button>
          )}

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button 
              className={`w-full text-center transition-colors ${currentPage === 'home' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => handleNavigation('home')}
            >
              Inicio
            </button>
            {!isAdmin() && (
              <>
                <button 
                  className={`w-full text-center transition-colors ${currentPage === 'productos' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                  onClick={() => handleNavigation('productos')}
                >
                  Productos
                </button>
                <button 
                  className={`w-full text-center transition-colors ${currentPage === 'contacto' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                  onClick={() => handleNavigation('contacto')}
                >
                  Contacto
                </button>
              </>
            )}
            {isAuthenticated && isAdmin() && (
              <button 
                className={`w-full text-center transition-colors ${currentPage === 'admin' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                onClick={() => handleNavigation('admin')}
              >
                Panel de Administración
              </button>
            )}
            
            {/* Mobile user actions */}
            <div className="border-t pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {!isAdmin() && (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Hola, {user?.firstName} {user?.lastName}
                      </div>
                      <button 
                        onClick={() => handleNavigation('profile')}
                        className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Mi Perfil</span>
                      </button>
                    </>
                  )}
                  {isAdmin() && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded inline-block">
                      ADMINISTRADOR
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleNavigation('login')}
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Iniciar sesión</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
