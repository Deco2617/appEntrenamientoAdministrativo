import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; 
import axios from 'axios';
import { BarChart3, Users, Edit, X, Save, CheckCircle, AlertCircle } from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({ price: '', description: '', is_active: false });

  // Texto por defecto que queremos prohibir
  const DEFAULT_DESCRIPTION_TEXT = "Coloque aquí los beneficios de este plan...";

  const [stats, setStats] = useState({
    activePlans: 0,
    activeSubscriptions: 0 
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPlans(response.data);
      const activos = response.data.filter(p => p.is_active).length;
      setStats(prev => ({ ...prev, activePlans: activos }));
      setLoading(false);
    } catch (error) {
      console.error("Error cargando planes:", error);
      setLoading(false);
    }
  };

  const getDurationLabel = (days) => {
    if (days === 30) return "Mensual";
    if (days === 90) return "Trimestral";
    if (days === 365) return "Anual";
    return `${days} Días`;
  };

  const handleEditClick = (plan) => {
    setCurrentPlan(plan);
    setFormData({
        price: plan.price,
        description: plan.description || '', 
        is_active: Boolean(plan.is_active)
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.description.trim() === DEFAULT_DESCRIPTION_TEXT || formData.description.trim() === "") {
        alert("⚠️ Por favor, escribe una descripción personalizada para el plan antes de guardar.");
        return; 
    }

    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://127.0.0.1:8000/api/plans/${currentPlan.id}`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        fetchPlans();
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error actualizando", error);
        alert("Error al actualizar el plan");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 relative">
        <header className="mb-8 flex justify-between items-center">
             <h1 className="text-2xl font-bold text-gray-800">Planes</h1>
             <div className="text-sm text-gray-500">Panel de Administración</div>
        </header>

        {/* Tarjetas Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* ... (Stats cards iguales) ... */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Planes Activos</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activePlans}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Suscripciones Activas</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Listado de Planes</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {/* CAMBIO 1: REAJUSTE DE ANCHOS DE COLUMNA 
                      Se redujo descripción (de 45% a 35%) y se dio más espacio a Estado y otros.
                  */}
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 w-[15%]">PLAN</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 w-[12%]">PRECIO</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 w-[12%]">DURACIÓN</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 w-[35%]">DESCRIPCIÓN</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 w-[15%] text-center">ESTADO</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 w-[11%] text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{plan.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-bold">S/. {plan.price}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{getDurationLabel(plan.duration_days)}</td>
                    
                    <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-xs" title={plan.description}>
                        {plan.description}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                          plan.is_active 
                            ? 'bg-green-100 text-green-700'  
                            : 'bg-red-100 text-red-700'      
                        }`}>
                        {plan.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleEditClick(plan)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" 
                        title="Editar Plan"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* === MODAL DE EDICIÓN === */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Editar {currentPlan?.name}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSave} className="p-6 space-y-4">
                        
                        {/* Precio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/.)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Descripción (Validación visual) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Beneficios</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows="4"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none resize-none transition-all ${
                                    formData.description === DEFAULT_DESCRIPTION_TEXT 
                                    ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900' 
                                    : 'border-gray-300 focus:ring-pink-500'
                                }`}
                                placeholder="Ej: Acceso al gimnasio, Rutinas personalizadas..."
                            ></textarea>
                            {formData.description === DEFAULT_DESCRIPTION_TEXT && (
                                <p className="text-xs text-red-500 mt-1">⚠️ Debes cambiar este texto para poder guardar.</p>
                            )}
                        </div>

                        {/* Estado (Switch con el nuevo color) */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setFormData({...formData, is_active: !formData.is_active})}>
                            <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${formData.is_active ? 'bg-pink-700' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${formData.is_active ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <label className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                {formData.is_active ? 'Plan Activo (Visible)' : 'Plan Inactivo (Oculto)'}
                            </label>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            
                            {/* CAMBIO 2: COLOR DEL BOTÓN GUARDAR
                                Se cambió bg-purple-600 por bg-pink-700 para coincidir con la imagen.
                            */}
                            <button 
                                type="submit" 
                                className="flex-1 px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={formData.description === DEFAULT_DESCRIPTION_TEXT || formData.description.trim() === ""}
                            >
                                <Save size={18} />
                                Guardar Cambios
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Plans;