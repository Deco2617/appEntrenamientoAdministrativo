import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Apple, Flame, Target, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Nutricion = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/diet-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDietPlans(res.data);
      if (res.data.length > 0) setSelectedPlan(res.data[0]); 
      setLoading(false);
    } catch (error) {
      console.error("Error cargando planes", error);
      setLoading(false);
    }
  };

  const filteredPlans = dietPlans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 font-sans">
        {/* ENCABEZADO */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Nutrición</h1>
            <p className="text-sm text-gray-500">Administra los planes de alimentación y sus contenidos.</p>
          </div>
          <button 
            onClick={() => navigate('/nutricion/nueva')}
            className="bg-[#C2185B] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-[#A0134D] transition-all"
          >
            <Plus size={20} /> Nuevo Plan de Dieta
          </button>
        </header>

        <div className="grid grid-cols-12 gap-6">
          
          {/* SECCIÓN IZQUIERDA: LISTADO EN TABLA */}
          <div className="col-span-7 flex flex-col gap-4">
            {/* Buscador de la tabla */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar planes por nombre..." 
                className="flex-1 outline-none text-sm text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Contenedor de la Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Objetivo</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="3" className="py-10 text-center text-gray-400">Cargando planes...</td></tr>
                  ) : filteredPlans.length > 0 ? (
                    filteredPlans.map((plan) => (
                      <tr 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'bg-pink-50/50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedPlan?.id === plan.id ? 'bg-[#C2185B] text-white' : 'bg-pink-100 text-[#C2185B]'}`}>
                              <Apple size={18} />
                            </div>
                            <span className="font-bold text-gray-700 text-sm">{plan.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">{plan.goal}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1">
                            <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition"><Edit2 size={14}/></button>
                            <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Info className="text-gray-200" size={40} />
                          <p className="text-gray-400 text-sm">No se encontraron planes registrados.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN DERECHA: DETALLE DEL PLAN */}
          <div className="col-span-5">
            {selectedPlan ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 border-b border-gray-50 pb-6">
                  <span className="text-[10px] font-black text-[#C2185B] uppercase tracking-widest mb-2 block">Vista Previa del Plan</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPlan.name}</h2>
                  <div className="flex gap-4">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Target size={12}/> {selectedPlan.goal}
                    </span>
                    <span className="bg-pink-100 text-[#C2185B] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Flame size={12}/> 1800 Kcal
                    </span>
                  </div>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Ejemplo de estructura de día */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                      <Calendar size={14}/> Distribución Lunes
                    </h4>
                    
                    <div className="grid gap-3">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-2 uppercase">
                            <Clock size={12} className="text-[#C2185B]"/> Desayuno
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between italic"><span>Avena con Chía</span> <span>150g</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-gray-200">
                  Asignar a Cliente
                </button>
              </div>
            ) : (
              <div className="h-[500px] bg-white border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Apple className="text-gray-200" size={40} />
                </div>
                <h4 className="text-gray-800 font-bold mb-1">Sin plan seleccionado</h4>
                <p className="text-gray-400 text-sm max-w-[200px]">Selecciona un elemento de la tabla para ver su detalle.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Nutricion;