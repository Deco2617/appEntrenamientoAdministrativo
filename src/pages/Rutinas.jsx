import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, LayoutList, CheckCircle, Edit2, Dumbbell, Users, Globe, Trash2 } from 'lucide-react'; // Agregué Globe para "Publicar"
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MassAssignmentModal from '../components/MassAssignmentModal';
import IndividualAssignmentModal from '../components/IndividualAssignmentModal'; // ¡NUEVO COMPONENTE!
import FeedbackModal from '../components/FeedbackModal';

const Rutinas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // DATOS
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  // ESTADOS DE MODALES
  const [showMassModal, setShowMassModal] = useState(false);
  const [showIndividualModal, setShowIndividualModal] = useState(false);

  // FEEDBACK
  const [feedback, setFeedback] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('Todos');

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await api.get('/routines');
        const data = response.data.data || response.data;
        setRoutines(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta rutina?")) return;
    try {
      await api.delete(`/routines/${id}`);
      setRoutines(routines.filter(r => r.id !== id));
      if (selectedRoutine?.id === id) setSelectedRoutine(null);
      setFeedback({ isOpen: true, type: 'success', title: 'Eliminado', message: 'Rutina eliminada.' });
    } catch (e) {
      setFeedback({ isOpen: true, type: 'error', title: 'Error', message: 'No se pudo eliminar.' });
    }
  };

  // HELPERS
  const translateLevel = (l) => ({ 'beginner': 'Principiante', 'intermediate': 'Intermedio', 'advanced': 'Avanzado' }[l] || l);
  const getComputedStatus = (r) => (r.exercises?.length > 0 ? 'Publicado' : 'Borrador');
  const getStatusBadge = (s) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s === 'Publicado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s}</span>
  );
  const getLevelBadge = (level) => {
    const levelName = translateLevel(level);
    const styles = {
      'Principiante': 'bg-blue-100 text-blue-700',
      'Intermedio': 'bg-orange-100 text-orange-700',
      'Avanzado': 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[levelName] || 'bg-gray-100 text-gray-700'}`}>
        {levelName}
      </span>
    );
  };

  // FILTRADO
  const filteredRoutines = routines.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'Todos' || translateLevel(r.level) === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: routines.length,
    published: routines.filter(r => getComputedStatus(r) === 'Publicado').length,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 flex flex-col h-full">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-4 shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Rutinas</h1>
          <button onClick={() => navigate('/rutinas/nueva')} className="bg-[#C2185B] hover:bg-[#ad1457] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm shadow-sm">
            <Plus size={16} /> Crear Rutina
          </button>
        </header>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* LISTA (IZQUIERDA) */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between h-20 items-center">
                <div><p className="text-gray-400 text-xs font-bold uppercase">Total</p><h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3></div>
                <div className="p-2 bg-pink-50 rounded-lg text-[#C2185B]"><LayoutList size={20} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between h-20 items-center">
                <div><p className="text-gray-400 text-xs font-bold uppercase">Publicadas</p><h3 className="text-2xl font-bold text-gray-800">{stats.published}</h3></div>
                <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20} /></div>
              </div>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B]" />
                </div>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#C2185B]">
                  <option value="Todos">Todas</option><option value="beginner">Principiante</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option>
                </select>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 sticky top-0"><tr className="text-gray-500 text-xs border-b border-gray-100 uppercase"><th className="px-4 py-3">Nombre</th><th className="px-4 py-3 text-center">Duración</th><th className="px-4 py-3 text-center">Nivel</th><th className="px-4 py-3 text-center">Estado</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? <tr><td colSpan="4" className="text-center p-8 text-gray-400">Cargando...</td></tr> :
                      filteredRoutines.map(r => (
                        <tr key={r.id} onClick={() => setSelectedRoutine(r)} className={`cursor-pointer hover:bg-gray-50 ${selectedRoutine?.id === r.id ? 'bg-pink-50/60' : ''}`}>
                          <td className="px-4 py-3 font-medium text-gray-700">{r.name}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{r.estimated_duration} min</td>
                          <td className="px-4 py-3 text-center">{getLevelBadge(r.level)}</td>
                          <td className="px-4 py-3 text-center">{getStatusBadge(getComputedStatus(r))}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DETALLE (DERECHA) */}
          <div className="w-[400px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden shrink-0">
            {selectedRoutine ? (
              <>
                <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#C2185B] uppercase mb-1">Detalle</span>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/rutinas/editar/${selectedRoutine.id}`)} className="text-gray-300 hover:text-blue-500"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(selectedRoutine.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedRoutine.name}</h2>
                  <p className="text-sm text-gray-500 line-clamp-3">{selectedRoutine.description || "Sin descripción."}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Ejercicios ({selectedRoutine.exercises?.length || 0})</h4>
                  {selectedRoutine.exercises?.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="flex justify-between mb-2"><div className="flex gap-2 items-center"><span className="bg-gray-100 text-gray-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{idx + 1}</span><span className="font-semibold text-sm text-gray-800">{ex.name}</span></div></div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <div><span className="text-gray-400 font-bold uppercase text-[9px] block">Series</span><span className="font-semibold text-gray-700">{ex.pivot?.sets || 0}</span></div>
                        <div className="border-l border-gray-200"><span className="text-gray-400 font-bold uppercase text-[9px] block">Reps</span><span className="font-semibold text-gray-700">{ex.pivot?.reps || 0}</span></div>
                        <div className="border-l border-gray-200"><span className="text-gray-400 font-bold uppercase text-[9px] block">Descanso</span><span className="font-semibold text-gray-700">{ex.pivot?.rest_time || 0}s</span></div>
                      </div>
                    </div>
                  ))}
                  {!selectedRoutine.exercises?.length && <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg"><Dumbbell className="mx-auto h-8 w-8 mb-2 opacity-50" /><p className="text-sm">Sin ejercicios</p></div>}
                </div>

                {/* --- BOTONES DE ACCIÓN NUEVOS --- */}
                <div className="p-4 border-t border-gray-100 bg-white space-y-2">
                  {/* BOTÓN 1: PUBLICAR MASIVAMENTE */}
                  <button
                    onClick={() => setShowMassModal(true)}
                    className="w-full bg-[#C2185B] hover:bg-[#ad1457] text-white font-medium py-3 rounded-lg transition shadow-sm text-sm flex items-center justify-center gap-2"
                  >
                    <Globe size={16} /> Publicar Rutina (Masivo)
                  </button>

                  {/* BOTÓN 2: ASIGNAR 1 A 1 */}
                  <button
                    onClick={() => setShowIndividualModal(true)}
                    className="w-full bg-white border border-gray-200 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
                  >
                    <Users size={16} /> Asignar a Alumno
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400"><div className="text-4xl mb-4 animate-bounce">👈</div><p className="text-sm font-medium">Selecciona una rutina</p></div>
            )}
          </div>
        </div>

        {/* --- MODALES --- */}
        {selectedRoutine && (
          <>
            {/* Modal para PUBLICAR (Masivo) */}
            <MassAssignmentModal
              isOpen={showMassModal}
              onClose={() => setShowMassModal(false)}
              routine={selectedRoutine}
              onShowFeedback={(f) => setFeedback({ ...f, isOpen: true })}
            />

            {/* Modal para ASIGNAR PERSONALIZADO (Nuevo) */}
            <IndividualAssignmentModal
              isOpen={showIndividualModal}
              onClose={() => setShowIndividualModal(false)}
              routine={selectedRoutine}
              onShowFeedback={(f) => setFeedback({ ...f, isOpen: true })}
            />
          </>
        )}

        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback({ ...feedback, isOpen: false })} type={feedback.type} title={feedback.title} message={feedback.message} />
      </main>
    </div>
  );
};

export default Rutinas;