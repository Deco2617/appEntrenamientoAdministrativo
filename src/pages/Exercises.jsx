import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Dumbbell, Youtube, Edit2, Trash2, X, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const Exercises = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('Todos');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState({
    id: null,
    name: '',
    muscle_group: '',
    video_url: '',
    description: ''
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      // Agregamos headers para decirle a Laravel que queremos JSON
      const response = await fetch('http://127.0.0.1:8000/api/exercises', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // <--- ESTO EVITA EL ERROR "ROUTE LOGIN NOT DEFINED"
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setExercises(Array.isArray(data) ? data : data.data || []);
      
    } catch (error) {
      console.error("Error cargando ejercicios:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: EMBED URL ---
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // --- FORM HANDLERS ---
  const handleSave = async (e) => {
    e.preventDefault();
    const url = isEditing 
      ? `http://127.0.0.1:8000/api/exercises/${currentExercise.id}`
      : 'http://127.0.0.1:8000/api/exercises';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(currentExercise)
      });
      if (response.ok) {
        fetchExercises();
        setShowModal(false);
        resetForm();
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar ejercicio?")) return;
    try {
       await fetch(`http://127.0.0.1:8000/api/exercises/${id}`, { method: 'DELETE' });
       fetchExercises();
    } catch (error) { console.error(error); }
  };

  const openEditModal = (ex) => {
    setCurrentExercise(ex);
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentExercise({ id: null, name: '', muscle_group: '', video_url: '', description: '' });
  };

  // --- FILTRADO ---
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = filterMuscle === 'Todos' || ex.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const muscleGroups = ['Todos', ...new Set(exercises.map(ex => ex.muscle_group))];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ejercicios</h1>
            <p className="text-sm text-gray-500">Catálogo de movimientos</p>
          </div>
          <button onClick={openCreateModal} className="bg-[#C2185B] hover:bg-[#ad1457] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors">
            <Plus size={18} /> Nuevo Ejercicio
          </button>
        </header>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
             <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input 
                  type="text" placeholder="Buscar ejercicio..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B]"
                />
             </div>
             <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select value={filterMuscle} onChange={(e) => setFilterMuscle(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 outline-none cursor-pointer">
                   {muscleGroups.map(group => <option key={group} value={group}>{group}</option>)}
                </select>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Ejercicio</th>
                  <th className="px-6 py-4">Músculo</th>
                  <th className="px-6 py-4">Video</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr><td colSpan="4" className="text-center p-8 text-gray-400">Cargando...</td></tr>
                ) : filteredExercises.length > 0 ? (
                  filteredExercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{ex.name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{ex.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border uppercase">{ex.muscle_group}</span>
                      </td>
                      <td className="px-6 py-4">
                        {ex.video_url ? (
                          <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#C2185B] hover:underline font-medium">
                            <Youtube size={16} /> Ver
                          </a>
                        ) : <span className="text-gray-300 text-xs">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(ex)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(ex.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center p-12 text-gray-400">No hay ejercicios.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          
          {/* CAMBIO 1: max-w-lg (ancho normal) y diseño vertical (sin flex-row) */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* 1. Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" required value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({...currentExercise, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="Ej. Press Banca"
                />
              </div>

              {/* 2. Grupo Muscular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Muscular</label>
                <select 
                   required value={currentExercise.muscle_group}
                   onChange={(e) => setCurrentExercise({...currentExercise, muscle_group: e.target.value})}
                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                >
                  <option value="">Selecciona...</option>
                  <option value="Pecho">Pecho</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Pierna">Pierna</option>
                  <option value="Hombro">Hombro</option>
                  <option value="Bíceps">Bíceps</option>
                  <option value="Tríceps">Tríceps</option>
                  <option value="Abdomen">Abdomen</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>

              {/* 3. Instrucciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  rows="3" value={currentExercise.description || ''}
                  onChange={(e) => setCurrentExercise({...currentExercise, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                  placeholder="Instrucciones breves..."
                ></textarea>
              </div>

              {/* 4. CAMBIO 2: URL AL FINAL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Video (Youtube)</label>
                <div className="relative">
                   <Youtube className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                   <input 
                     type="url" value={currentExercise.video_url || ''}
                     onChange={(e) => setCurrentExercise({...currentExercise, video_url: e.target.value})}
                     className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                     placeholder="https://youtube.com/watch?v=..."
                   />
                </div>
              </div>

              {/* 5. CAMBIO 3: PREVIEW CONDICIONAL (Solo si hay URL) */}
              {currentExercise.video_url && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner animate-fadeIn">
                  <div className="aspect-video w-full bg-black">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={getEmbedUrl(currentExercise.video_url)} 
                        title="Preview" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                  </div>
                  <div className="p-2 text-center text-xs text-gray-500 bg-gray-100 border-t border-gray-200">
                    Vista previa del video
                  </div>
                </div>
              )}

            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-white font-medium transition">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-[#C2185B] text-white rounded-lg hover:bg-[#ad1457] font-medium shadow-md transition">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;