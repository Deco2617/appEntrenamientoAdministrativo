import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { DashboardSkeleton } from '../components/Skeletons';

export default function Dashboard() {
  const { user } = useAuth();

  // Estado para las métricas
  const [metrics, setMetrics] = useState({
    completed: 0,
    pending: 0,
    absent: 0
  });

  // Estado para la tabla (Lista unificada de hoy)
  const [todaysList, setTodaysList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hacemos las dos peticiones en paralelo para que sea más rápido
        const [statsRes, absenteesRes] = await Promise.all([
          api.get('/trainer/dashboard/stats'),
          api.get('/trainer/dashboard/absentees')
        ]);

        const stats = statsRes.data;       // { completadas: [], pendientes: [], total_completadas: X }
        const absentees = absenteesRes.data; // [ ... array de objetos assignedRoutine ... ]

        // 1. Actualizamos los números de las tarjetas
        setMetrics({
          completed: stats.total_completadas,
          pending: stats.pendientes.length,
          absent: Object.keys(absentees).length // Si devuelve objeto o array
        });

        // 2. Preparamos la tabla: Unimos completadas + pendientes para ver la agenda de hoy
        // Mapeamos para aplanar la estructura (user está dentro de assigned_routine)
        const completedFormatted = stats.completadas.map(item => ({
          id: item.id,
          studentName: item.user.first_name + ' ' + item.user.last_name,
          photo: item.user.profile_photo || 'default.png',
          status: 'Completado',
          time: 'Hoy', // Podrías usar updated_at para la hora exacta
          rawStatus: 1
        }));

        const pendingFormatted = stats.pendientes.map(item => ({
          id: item.id,
          studentName: item.user.first_name + ' ' + item.user.last_name,
          photo: item.user.profile_photo || 'default.png',
          status: 'Pendiente',
          time: '-',
          rawStatus: 0
        }));

        setTodaysList([...completedFormatted, ...pendingFormatted]);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========== ANIMACIONES CON ANIME.JS ==========
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!loading && !hasAnimated.current) {
      hasAnimated.current = true;

      // 1. Animación de las tarjetas (fade-in + slide-up)
      animate('.stat-card', {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: stagger(100),
        easing: 'easeOutQuad'
      });

      // 2. Animación de los números (contador desde 0)
      animate('.stat-number', {
        innerHTML: function (el) {
          return [0, el.getAttribute('data-value')];
        },
        round: 1,
        duration: 1200,
        easing: 'easeOutExpo'
      });

      // 3. Animación de la tabla (stagger en las filas)
      animate('.table-row', {
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 400,
        delay: stagger(60, { start: 300 }),
        easing: 'easeOutQuad'
      });

      // 4. Animación del contenedor de la tabla
      animate('.table-container', {
        opacity: [0, 1],
        duration: 500,
        delay: 200,
        easing: 'easeOutQuad'
      });
    }
  }, [loading]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
              Panel de Control
            </h1>
            <p className="text-gray-500 mt-1 text-sm lg:text-base">
              Bienvenido, {user?.first_name}. Aquí está el resumen de hoy.
            </p>
          </div>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Tarjeta 1: Completadas */}
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center opacity-0">
            <div>
              <p className="text-gray-500 text-sm font-medium">Rutinas Completadas</p>
              <h3 className="stat-number text-3xl font-bold text-gray-800 mt-2" data-value={metrics.completed}>0</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle size={28} />
            </div>
          </div>

          {/* Tarjeta 2: Pendientes */}
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center opacity-0">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pendientes de Hoy</p>
              <h3 className="stat-number text-3xl font-bold text-gray-800 mt-2" data-value={metrics.pending}>0</h3>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Clock size={28} />
            </div>
          </div>

          {/* Tarjeta 3: Ausentes (Riesgo) */}
          <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center opacity-0">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ausentes (+3 días)</p>
              <h3 className="stat-number text-3xl font-bold text-gray-800 mt-2" data-value={metrics.absent}>0</h3>
              <p className="text-xs text-red-400 mt-1">Requieren atención</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle size={28} />
            </div>
          </div>
        </div>

        {/* TABLA DE AGENDA DE HOY */}
        <div className="table-container bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-0">
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Agenda de Entrenamiento (Hoy)</h2>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4">Alumno</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todaysList.length > 0 ? (
                  todaysList.map((item) => (
                    <tr key={item.id} className="table-row hover:bg-gray-50 transition-colors opacity-0">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                        {/* Avatar o Inicial */}
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                          {item.studentName.charAt(0)}
                        </div>
                        {item.studentName}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border
                          ${item.rawStatus === 1
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {item.rawStatus === 1 ? 'Completó rutina' : 'Aún no inicia'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400">
                      No hay rutinas asignadas para hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}