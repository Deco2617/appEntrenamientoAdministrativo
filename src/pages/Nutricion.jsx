import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { 
  Plus, Search, Trash2, Apple, Flame, Target, 
  Calendar, Clock, User, X, Megaphone, Filter, ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Nutricion = () => {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados Modal
  const [modalType, setModalType] = useState(null);
  const [clients, setClients] = useState([]); 
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [assignData, setAssignData] = useState({
    userId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      // Ahora este endpoint trae TODA la info anidada gracias al cambio en el Controller
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

  const fetchClientsByGoal = async (goal) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:8000/api/users?goal=${encodeURIComponent(goal)}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch (error) {
      console.error("Error cargando clientes", error);
      setClients([]);
    }
  };

  const openIndividualModal = () => {
    if (selectedPlan) {
        setAssignData({ ...assignData, userId: '' }); 
        setClientSearchQuery('');
        fetchClientsByGoal(selectedPlan.goal); 
        setModalType('individual');
    }
  };

  const handleDelete = async (planId, e) => {
    e.stopPropagation();
    if(!confirm("¿Estás seguro de eliminar este plan?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/diet-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedList = dietPlans.filter(p => p.id !== planId);
      setDietPlans(updatedList);
      if(selectedPlan?.id === planId) setSelectedPlan(updatedList[0] || null);
    } catch (error) { console.error(error); }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        if (modalType === 'individual') {
            if(!assignData.userId) return alert("Selecciona un alumno");
            await axios.post('http://127.0.0.1:8000/api/assigned-diets', {
                user_id: assignData.userId,
                diet_plan_id: selectedPlan.id,
                start_date: assignData.startDate,
                end_date: assignData.endDate
            }, { headers: { Authorization: `Bearer ${token}` }});
            alert("¡Plan asignado correctamente!");

        } else if (modalType === 'massive') {
            await axios.post('http://127.0.0.1:8000/api/assigned-diets/massive', {
                diet_plan_id: selectedPlan.id,
                start_date: assignData.startDate,
                end_date: assignData.endDate,
                target_plan_type: 'Pro'
            }, { headers: { Authorization: `Bearer ${token}` }});
            alert("¡Plan publicado masivamente a los alumnos compatibles!");
        }
        setModalType(null);
    } catch (error) {
        alert(error.response?.data?.message || "Error al asignar.");
    }
  };

  // --- LÓGICA PARA RENDERIZAR COMIDAS REALES ---
  const renderPlanContent = () => {
    if (!selectedPlan || !selectedPlan.diet_plan_meals) return <p className="text-gray-400 text-xs">Cargando contenido...</p>;
    if (selectedPlan.diet_plan_meals.length === 0) return <p className="text-gray-400 text-xs italic">Este plan no tiene comidas configuradas aún.</p>;

    // 1. Agrupar por días
    const daysOrder = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    const daysTranslation = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };
    const mealOrder = { breakfast: 1, lunch: 2, snack: 3, dinner: 4 };
    const mealTranslation = { breakfast: 'Desayuno', lunch: 'Almuerzo', snack: 'Snack', dinner: 'Cena' };

    // Agrupamos el array plano que viene del backend
    const grouped = selectedPlan.diet_plan_meals.reduce((acc, item) => {
        const day = item.day_of_week;
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {});

    // Ordenamos los días
    const sortedDays = Object.keys(grouped).sort((a, b) => daysOrder[a] - daysOrder[b]);

    return sortedDays.map(dayKey => (
        <div key={dayKey} className="space-y-3 mb-6">
            <h4 className="text-xs font-black text-[#C2185B] uppercase tracking-widest flex items-center gap-2 border-b border-pink-100 pb-1">
                <Calendar size={14}/> {daysTranslation[dayKey] || dayKey}
            </h4>
            
            <div className="grid gap-3">
                {grouped[dayKey]
                    // Ordenamos comidas (Desayuno -> Cena)
                    .sort((a, b) => mealOrder[a.meal_type] - mealOrder[b.meal_type])
                    .map((mealItem) => (
                    <div key={mealItem.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-pink-200 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-gray-700 flex items-center gap-2 uppercase">
                                <Clock size={12} className="text-gray-400"/> 
                                {mealTranslation[mealItem.meal_type]} 
                                <span className="text-gray-400 font-normal ml-1">({mealItem.suggested_time ? mealItem.suggested_time.substring(0,5) : '--:--'})</span>
                            </span>
                        </div>
                        
                        {/* Lista de Alimentos dentro de la comida */}
                        <div className="space-y-1">
                            {mealItem.meal && mealItem.meal.foods && mealItem.meal.foods.length > 0 ? (
                                mealItem.meal.foods.map((food, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-100">
                                        <span className="text-gray-600 font-medium truncate max-w-[150px]">{food.name}</span>
                                        <div className="flex gap-2">
                                            <span className="font-bold text-gray-800">{food.pivot.quantity}</span>
                                            <span className="text-[10px] text-gray-400 pt-0.5">{food.calories_per_100g} kcal</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-[10px] text-red-400 italic">Sin alimentos registrados</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ));
  };

  const filteredPlans = dietPlans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const modalClientsFiltered = clients.filter(c => (c.first_name + ' ' + c.last_name).toLowerCase().includes(clientSearchQuery.toLowerCase()));

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Nutrición</h1>
            <p className="text-sm text-gray-500">Administra dietas y publícalas.</p>
          </div>
          <button onClick={() => navigate('/nutricion/nueva')} className="bg-[#C2185B] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-[#A0134D] transition-all">
            <Plus size={20} /> Nuevo Plan de Dieta
          </button>
        </header>

        <div className="grid grid-cols-12 gap-6">
          
          {/* TABLA DE PLANES */}
          <div className="col-span-7 flex flex-col gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <Search className="text-gray-400" size={20} />
              <input type="text" placeholder="Filtrar planes..." className="flex-1 outline-none text-sm text-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
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
                  {loading ? <tr><td colSpan="3" className="py-10 text-center">Cargando...</td></tr> : 
                   filteredPlans.map((plan) => (
                      <tr key={plan.id} onClick={() => setSelectedPlan(plan)} className={`cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'bg-pink-50/50' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedPlan?.id === plan.id ? 'bg-[#C2185B] text-white' : 'bg-pink-100 text-[#C2185B]'}`}><Apple size={18} /></div>
                            <span className="font-bold text-gray-700 text-sm">{plan.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{plan.goal}</td>
                        <td className="px-6 py-4 text-center">
                            <button onClick={(e) => handleDelete(plan.id, e)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* DETALLE DEL PLAN */}
          <div className="col-span-5">
            {selectedPlan ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <div className="mb-6 border-b border-gray-50 pb-6">
                  <span className="text-[10px] font-black text-[#C2185B] uppercase tracking-widest mb-2 block">Vista Previa</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPlan.name}</h2>
                  <div className="flex gap-3"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"><Target size={12}/> {selectedPlan.goal}</span></div>
                </div>

                {/* AQUÍ ESTÁ EL CAMBIO: RENDERIZADO DINÁMICO */}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                   {renderPlanContent()}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                    <button onClick={() => setModalType('massive')} className="w-full bg-[#C2185B] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#A0134D] transition-all flex justify-center items-center gap-2">
                      <Megaphone size={18}/> Publicar a Suscriptores PRO
                    </button>
                    <button onClick={openIndividualModal} className="w-full bg-white text-gray-700 border-2 border-gray-100 py-3.5 rounded-xl font-bold text-sm hover:border-gray-300 transition-all flex justify-center items-center gap-2">
                      <User size={18}/> Asignar a Alumno Individual
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] bg-white border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-8"><p className="text-gray-400 text-sm">Selecciona un plan.</p></div>
            )}
          </div>
        </div>

        {/* MODAL (Sin cambios funcionales, solo se muestra cuando toca) */}
        {modalType && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{modalType === 'massive' ? 'Publicación Masiva' : 'Asignación Individual'}</h3>
                            <p className="text-xs text-gray-500">Objetivo del Plan: <strong className="text-[#C2185B]">{selectedPlan.goal}</strong></p>
                        </div>
                        <button onClick={() => setModalType(null)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                    </div>

                    <form onSubmit={handleAssignSubmit} className="space-y-4">
                        {modalType === 'individual' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase block">Buscar Alumno ({selectedPlan.goal})</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                    <input type="text" placeholder="Escribe el nombre..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B] mb-2" value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)}/>
                                </div>
                                <select className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B] bg-white" value={assignData.userId} onChange={e => setAssignData({...assignData, userId: e.target.value})} required size={5}>
                                    <option value="" disabled>-- Resultados --</option>
                                    {modalClientsFiltered.length > 0 ? (
                                        modalClientsFiltered.map(client => ( <option key={client.id} value={client.id} className="p-2">{client.first_name} {client.last_name}</option> ))
                                    ) : <option disabled>No hay alumnos compatibles</option>}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Desde</label><input type="date" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B]" value={assignData.startDate} onChange={e => setAssignData({...assignData, startDate: e.target.value})} required /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hasta</label><input type="date" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B]" value={assignData.endDate} onChange={e => setAssignData({...assignData, endDate: e.target.value})} required /></div>
                        </div>
                        {modalType === 'massive' && (
                            <div className="bg-purple-50 p-3 rounded-lg flex gap-3 items-start border border-purple-100">
                                <Filter size={18} className="text-purple-600 mt-0.5 shrink-0"/>
                                <p className="text-xs text-purple-800">Se asignará a todos los alumnos <strong>PRO</strong> que tengan el objetivo <strong>"{selectedPlan.goal}"</strong>.</p>
                            </div>
                        )}
                        <button type="submit" className="w-full bg-[#C2185B] text-white py-3 rounded-xl font-bold hover:bg-[#A0134D] mt-2">Confirmar</button>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default Nutricion;