import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, LayoutList, CheckCircle, Edit2, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const Rutinas = () => {
  const { user } = useAuth(); 
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros (Solo Búsqueda y Nivel, Estado eliminado)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('Todos');

  // --- 1. CARGA DE DATOS ---
  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      // Ajusta tu URL local
      const response = await fetch('http://127.0.0.1:8000/api/routines');
      const data = await response.json();
      
      const loadedRoutines = Array.isArray(data) ? data : (data.data || []);
      setRoutines(loadedRoutines);
      
      if (loadedRoutines.length > 0) {
        setSelectedRoutine(loadedRoutines[0]);
      }
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HELPERS ---
  const translateLevel = (level) => {
    const map = { 'beginner': 'Baja', 'intermediate': 'Media', 'advanced': 'Alta' };
    return map[level] || level;
  };

  const getComputedStatus = (routine) => {
    return (routine.exercises && routine.exercises.length > 0) ? 'Publicado' : 'Borrador';
  };

  // Filtro simplificado (Sin estado)
  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'Todos' || translateLevel(routine.level) === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: routines.length,
    published: routines.filter(r => getComputedStatus(r) === 'Publicado').length,
  };

  const getStatusBadge = (status) => {
    const isPublished = status === 'Publicado';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        isPublished ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {isPublished ? 'Publicado' : 'Borrador'}
      </span>
    );
  };

  return (
    // 'h-screen overflow-hidden' asegura que la pagina no tenga doble scroll
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      {/* Contenedor Principal Ajustado */}
      <main className="flex-1 ml-64 p-6 flex flex-col h-full">
        
        {/* HEADER (Compacto) */}
        <header className="flex justify-between items-center mb-4 shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Rutinas</h1>
          <button className="bg-[#C2185B] hover:bg-[#ad1457] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors shadow-sm">
            <Plus size={16} />
            Crear Rutina
          </button>
        </header>

        {/* LAYOUT GRID: IZQUIERDA (Datos) vs DERECHA (Detalle Full Height) */}
        <div className="flex gap-6 h-full overflow-hidden">
          
          {/* --- COLUMNA IZQUIERDA (Ancho Variable) --- */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            {/* 1. TARJETAS DE ESTADÍSTICAS (Compactas) */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {/* Card Total */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between h-20">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase">Total</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                </div>
                <div className="p-2 bg-pink-50 rounded-lg text-[#C2185B]">
                  <LayoutList size={20} />
                </div>
              </div>
              {/* Card Publicadas */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between h-20">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase">Publicadas</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.published}</h3>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>

            {/* 2. TABLA Y FILTROS (Ocupa el resto del espacio vertical) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
              
              {/* Barra de Filtros */}
              <div className="p-3 border-b border-gray-100 flex gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Buscar rutina..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B]"
                  />
                </div>
                {/* Filtro Dificultad (Sin filtro Estado) */}
                <select 
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none focus:border-[#C2185B] cursor-pointer"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="Todos">Todas las Dificultades</option>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              {/* Contenedor Scrollable de la Tabla */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-gray-500 text-xs border-b border-gray-100 font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3">Nombre</th> 
                      <th className="px-4 py-3 text-center">Duración</th>
                      <th className="px-4 py-3 text-center">Nivel</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {loading ? (
                      <tr><td colSpan="4" className="text-center p-8 text-gray-400">Cargando...</td></tr>
                    ) : filteredRoutines.map((routine) => (
                      <tr 
                        key={routine.id}
                        onClick={() => setSelectedRoutine(routine)}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedRoutine?.id === routine.id ? 'bg-pink-50/60' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-700 truncate max-w-[150px]">
                          {routine.name}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">{routine.estimated_duration} min</td>
                        <td className="px-4 py-3 text-center text-gray-500">{translateLevel(routine.level)}</td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(getComputedStatus(routine))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Footer Paginación */}
              <div className="p-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 shrink-0">
                 <span>{filteredRoutines.length} resultados</span>
                 <div className="flex gap-1">
                    <button className="px-2 py-1 hover:bg-gray-100 rounded">Anterior</button>
                    <button className="px-2 py-1 hover:bg-gray-100 rounded">Siguiente</button>
                 </div>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA (Panel Detalle - ALTURA COMPLETA) --- */}
          {/* w-[400px] fija el ancho, h-full ocupa toda la altura disponible */}
          <div className="w-[400px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden shrink-0">
            {selectedRoutine ? (
              <>
                {/* Header del Panel */}
                <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                  <span className="text-xs font-bold text-[#C2185B] uppercase tracking-wide mb-1 block">
                    Detalle de Rutina
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight mb-2">
                    {selectedRoutine.name}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {selectedRoutine.description || "Sin descripción disponible."}
                  </p>
                </div>

                {/* Lista de Ejercicios (Scrollable Independiente) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    Ejercicios ({selectedRoutine.exercises ? selectedRoutine.exercises.length : 0})
                  </h4>

                  {selectedRoutine.exercises && selectedRoutine.exercises.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-pink-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex gap-2 items-center">
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-sm text-gray-800">{ex.name}</span>
                         </div>
                         <Edit2 size={14} className="text-gray-300 hover:text-[#C2185B] cursor-pointer"/>
                      </div>
                      
                      {/* Grid de Datos del Ejercicio */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <div>
                          <span className="block text-gray-400 font-bold uppercase text-[9px]">Series</span>
                          <span className="font-semibold text-gray-700">{ex.pivot.sets}</span>
                        </div>
                        <div className="border-l border-gray-200">
                          <span className="block text-gray-400 font-bold uppercase text-[9px]">Reps</span>
                          <span className="font-semibold text-gray-700">{ex.pivot.reps}</span>
                        </div>
                        <div className="border-l border-gray-200">
                          <span className="block text-gray-400 font-bold uppercase text-[9px]">Descanso</span>
                          <span className="font-semibold text-gray-700">{ex.pivot.rest_time}s</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!selectedRoutine.exercises || selectedRoutine.exercises.length === 0) && (
                     <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        <Dumbbell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Sin ejercicios asignados</p>
                     </div>
                  )}
                </div>

                {/* Footer del Panel (Botones fijos abajo) */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <button className="w-full bg-[#C2185B] hover:bg-[#ad1457] text-white font-medium py-3 rounded-lg transition shadow-sm mb-2 text-sm">
                    Publicar Rutina
                  </button>
                  <button className="w-full bg-white border border-gray-200 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition text-sm">
                    Asignar a Alumno
                  </button>
                </div>
              </>
            ) : (
              // Estado Vacío
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-4xl mb-4 animate-bounce">👈</div>
                <p className="text-sm font-medium">Selecciona una rutina</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Rutinas;