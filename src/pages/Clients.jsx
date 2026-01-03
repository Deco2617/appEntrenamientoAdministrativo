import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Search, UserPlus, Users, UserCheck, Crown, Edit, MessageSquare, Phone } from 'lucide-react';

export default function Clients() {
  const navigate = useNavigate();
  // Estado para guardar la lista completa de clientes traída de la BD
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros de la interfaz
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  // Puedes agregar un estado para 'filterPlan' si deseas implementar ese filtro también

  // Al cargar la página, traemos los datos
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // Llamamos al endpoint que mejoramos en el paso anterior
      const response = await api.get('/trainer/my-students');
      setClients(response.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO EN TIEMPO REAL ---
  const filteredClients = clients.filter(client => {
    // Unimos nombre y apellido para buscar
    const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    
    // Verificamos si el término de búsqueda coincide con nombre o email
    const matchesSearch = fullName.includes(term) || client.email.toLowerCase().includes(term);
    
    // Verificamos el filtro de estado (dropdown)
    const matchesStatus = filterStatus === 'Todos' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // --- CÁLCULO AUTOMÁTICO DE ESTADÍSTICAS (Tarjetas superiores) ---
  const stats = {
    total: clients.length,
    // Contamos cuántos tienen el estado 'Activo' (calculado en el backend)
    active: clients.filter(c => c.status === 'Activo').length,
    // Contamos cuántos son premium (calculado en el backend basado en el nombre del plan)
    premium: clients.filter(c => c.is_premium).length 
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barra lateral navegable */}
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        
        {/* ENCABEZADO con Título y Botón de Crear */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <button 
            // Redirige a la pantalla que creamos anteriormente
            onClick={() => navigate('/clientes/nuevo')}
            className="bg-[#C2185B] hover:bg-[#ad1457] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Registrar Nuevo Alumno
          </button>
        </header>

        {/* TARJETAS DE RESUMEN (Datos calculados dinámicamente) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta Total */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Clientes</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</h3>
              <p className="text-xs text-gray-400 mt-1">Gestión completa</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Users className="text-gray-400 w-6 h-6" />
            </div>
          </div>

          {/* Tarjeta Activos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Clientes Activos</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.active}</h3>
              <p className="text-xs text-gray-400 mt-1">Con suscripción vigente</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <UserCheck className="text-gray-400 w-6 h-6" />
            </div>
          </div>

          {/* Tarjeta Premium */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Planes Premium</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.premium}</h3>
              <p className="text-xs text-gray-400 mt-1">Clientes con plan Pro/Master</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Crown className="text-gray-400 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: FILTROS Y TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* BARRA DE HERRAMIENTAS Y FILTROS */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-end">
            
            {/* Buscador de Texto */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar alumno..." 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dropdowns de Filtro */}
            <div className="flex gap-4 w-full md:w-auto">
                {/* Filtro Tipo de Plan (Visual por ahora) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Tipo de Plan</label>
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C2185B] bg-white cursor-pointer">
                  <option value="Todos">Todos</option>
                  <option value="Basico">Básico</option>
                  <option value="Pro">Pro</option>
                  <option value="Master">Master</option>
                </select>
              </div>
               {/* Filtro de Estado (Funcional) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Estado</label>
                <select 
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C2185B] bg-white cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLA DE DATOS */}
          <div className="overflow-x-auto">
            <h3 className="px-6 py-4 text-lg font-bold text-gray-800">Listado de Clientes</h3>
            
            <table className="w-full text-left border-collapse">
              {/* Encabezados de Tabla */}
              <thead>
                <tr className="bg-white text-gray-500 text-xs border-b border-gray-100 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Foto</th>
                  <th className="px-6 py-4 font-medium">Nombre</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Teléfono</th>
                  <th className="px-6 py-4 font-medium">Tipo de Plan</th>
                  <th className="px-6 py-4 font-medium">Última Asistencia</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              {/* Cuerpo de la Tabla */}
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="8" className="text-center p-8 text-gray-500">Cargando clientes...</td></tr>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      {/* Foto */}
                      <td className="px-6 py-4">
                        <img 
                          src={client.photo !== 'default.png' ? client.photo : `https://ui-avatars.com/api/?name=${client.first_name}+${client.last_name}&background=random&color=fff&bold=true`} 
                          alt="avatar" 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                        />
                      </td>
                      {/* Nombre */}
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 text-gray-500 text-sm">{client.email}</td>
                      {/* Teléfono (Nuevo campo) */}
                      <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-2">
                         <Phone size={16} className="text-gray-400"/>
                         {client.phone || '---'}
                      </td>
                      {/* Plan */}
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{client.plan_name}</td>
                      {/* Asistencia */}
                      <td className="px-6 py-4 text-sm text-gray-500">{client.last_attendance}</td>
                      {/* Estado (Etiqueta de color) */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                          ${client.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {client.status}
                        </span>
                      </td>
                      {/* Botones de Acción */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-[#C2185B] hover:bg-pink-50 rounded-lg transition" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Enviar Mensaje">
                            <MessageSquare size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Estado vacío si no hay coincidencias con el filtro
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-gray-400">
                      No se encontraron clientes que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN (Visual, idéntica al diseño) */}
          <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2 text-sm text-gray-600">
             <button className="hover:bg-gray-100 px-3 py-1 rounded transition flex items-center gap-1 disabled:opacity-50" disabled>
                &lt; Anterior
             </button>
             <span className="px-3 py-1 bg-[#C2185B] text-white rounded-lg font-medium">1</span>
             <button className="px-3 py-1 hover:bg-gray-100 rounded transition">2</button>
             <button className="hover:bg-gray-100 px-3 py-1 rounded transition flex items-center gap-1">
                 Siguiente &gt;
             </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}