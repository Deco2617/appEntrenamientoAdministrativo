// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileChartPie, Calendar, LayoutDashboard, Users, CreditCard, Dumbbell, Apple, Settings, LogOut, ClipboardList, Activity, Utensils, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Planes', icon: ClipboardList, path: '/planes' },
    { name: 'Suscripciones', icon: CreditCard, path: '/suscripciones' },
    { name: 'Ejercicios', icon: Activity, path: '/ejercicios' },
    { name: 'Rutinas', icon: Dumbbell, path: '/rutinas' },
    { name: 'Comidas', icon: Utensils, path: '/comidas' },
    { name: 'Nutrición', icon: Apple, path: '/nutricion' },
    { name: 'Reportes', icon: FileChartPie, path: '/reports' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Cerrar sidebar al navegar (en móvil)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Cerrar sidebar al hacer resize a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* BOTÓN HAMBURGER - Solo visible en móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-[#C2185B] transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* OVERLAY OSCURO - Solo en móvil cuando está abierto */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* HEADER CON LOGO Y BOTÓN CERRAR */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/CM LOGO.png"
              alt="Logo"
              className='w-10 h-9 object-contain' />
            <span className="text-xl font-bold text-[#C2185B]">appEntrenamiento</span>
          </div>
          {/* Botón cerrar - Solo en móvil */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                ${isActive(item.path)
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#C2185B]'
                }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* FOOTER (Logout) */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}