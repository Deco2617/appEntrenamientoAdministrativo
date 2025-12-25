// src/pages/Dashboard.jsx
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Users, Wallet, Bell, Plus, Search } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth(); // Obtenemos el usuario logueado

  // Datos de prueba (MOCK DATA) para que se vea igual a la imagen
  const stats = [
    { title: 'Clientes Activos Totales', value: '245', change: '+12% desde el último mes', icon: Users, color: 'text-purple-600' },
    { title: 'Ingresos Este Mes', value: 'S/.12,340', change: '+5% desde el último mes', icon: Wallet, color: 'text-green-600' },
    { title: 'Clientes en Riesgo', value: '7', change: 'Ausentes 3+ días', icon: Bell, color: 'text-red-500' },
  ];

  const students = [
    { id: 1, name: 'Ana García', plan: 'Personalizado', lastSeen: 'Hace 2 días', status: 'Activo', img: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Carlos Ruiz', plan: 'Pro', lastSeen: 'Hoy', status: 'Activo', img: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Sofía López', plan: 'Básico', lastSeen: 'Hace 5 días', status: 'Inactivo', img: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Pedro Martínez', plan: 'Pro', lastSeen: 'Hace 1 día', status: 'Activo', img: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Laura Fernández', plan: 'Personalizado', lastSeen: 'Hace 8 días', status: 'Inactivo', img: 'https://i.pravatar.cc/150?u=5' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* IMPORTAMOS EL SIDEBAR */}
      <Sidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-8">
        
        {/* ENCABEZADO */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, Entrenador {user?.first_name || 'Usuario'}
            </h1>
            <p className="text-gray-500 mt-1">Aquí tienes el resumen de hoy.</p>
          </div>

          {/* Tarjeta de Notificación Flotante */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3 max-w-sm">
            <div className="bg-red-100 p-2 rounded-full">
              <Bell className="text-[#C2185B] w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">Nueva Notificación</p>
              <p className="text-xs text-gray-500">Hay un nuevo mensaje de Sofía López.</p>
            </div>
          </div>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* SECCIÓN DE ALUMNOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Cabecera de la tabla */}
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Seguimiento de Alumnos</h2>
            <button className="bg-[#C2185B] hover:bg-[#ad1457] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
              <Plus size={18} />
              Registrar Nuevo Alumno
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Foto</th>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Tipo de Plan</th>
                  <th className="p-4 font-medium">Última Asistencia</th>
                  <th className="p-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <img src={student.img} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    </td>
                    <td className="p-4 font-medium text-gray-800">{student.name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${student.plan === 'Personalizado' ? 'bg-purple-100 text-purple-700' : 
                          student.plan === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {student.plan}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{student.lastSeen}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${student.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}