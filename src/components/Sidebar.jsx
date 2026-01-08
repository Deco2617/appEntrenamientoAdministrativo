// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Dumbbell, Apple, Settings, LogOut, ClipboardList, Activity, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Planes', icon: ClipboardList, path: '/planes' },
    { name: 'Suscripciones', icon: CreditCard, path: '/suscripciones' },
    { name: 'Ejercicios', icon: Activity, path: '/ejercicios' },
    { name: 'Rutinas', icon: Dumbbell, path: '/rutinas' },
    { name: 'Comidas', icon: Utensils, path: '/comidas' },
    { name: 'Nutrición', icon: Apple, path: '/nutricion' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* LOGO */}
      <div className="p-6 flex items-center gap-2">
        <img 
        src="/CM LOGO.png" 
        alt="Logo"
        className='w-10 h-9 object-contain' />
        <span className="text-xl font-bold text-[#C2185B]">appEntrenamiento</span>
      </div>

      {/* MENU ITEMS */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
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
  );
}