import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
// Iconos completos
import { 
  Plus, Search, Edit2, Trash2, Apple, Flame, Target, 
  Calendar, Info, Clock, User, X, Megaphone, Users, Filter 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Nutricion = () => {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Modal
  const [modalType, setModalType] = useState(null); // 'individual' | 'massive' | null
  const [clients, setClients] = useState([]); 
  
  // Buscador dentro del modal
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

  // --- Cargar Clientes FILTRADOS por Objetivo ---
  const fetchClientsByGoal = async (goal) => {
    try {
      const token = localStorage.getItem('token');
      // Pide al backend solo los usuarios que coincidan con el objetivo
      const res = await axios.get(`http://127.0.0.1:8000/api/users?goal=${encodeURIComponent(goal)}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch (error) {
      console.error("Error cargando clientes", error);
      setClients([]);
    }
  };

  // Abrir Modal Individual
  const openIndividualModal = () => {
    if (selectedPlan) {
        setAssignData({ ...assignData, userId: '' }); 
        setClientSearchQuery('');
        // Aquí ocurre la magia: Carga solo alumnos compatibles
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
            // El backend responde cuántos se asignaron
            alert("¡Plan publicado masivamente a los alumnos compatibles!");
        }
        setModalType(null);
    } catch (error) {
        alert(error.response?.data?.message || "Error al asignar.");
    }
  };

  const filteredPlans = dietPlans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filtrado local para el buscador dentro del modal
  const modalClientsFiltered = clients.filter(c => 
    (c.first_name + ' ' + c.last_name).toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

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
          {/* TABLA IZQUIERDA */}
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

          {/* DETALLE DERECHA */}
          <div className="col-span-5">
            {selectedPlan ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <div className="mb-6 border-b border-gray-50 pb-6">
                  <span className="text-[10px] font-black text-[#C2185B] uppercase tracking-widest mb-2 block">Vista Previa</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPlan.name}</h2>
                  <div className="flex gap-3"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"><Target size={12}/> {selectedPlan.goal}</span></div>
                </div>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                   <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center"><Calendar className="mx-auto text-gray-300 mb-2" size={24}/><p className="text-xs text-gray-500 font-medium">Contenido del plan configurado.</p></div>
                </div>

                <div className="space-y-3">
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

        {/* MODAL */}
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
                        
                        {/* Selector con Buscador */}
                        {modalType === 'individual' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase block">Buscar Alumno ({selectedPlan.goal})</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                    <input 
                                        type="text" placeholder="Escribe el nombre..." 
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C2185B] mb-2"
                                        value={clientSearchQuery}
                                        onChange={(e) => setClientSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B] bg-white"
                                    value={assignData.userId} onChange={e => setAssignData({...assignData, userId: e.target.value})}
                                    required size={5}
                                >
                                    <option value="" disabled>-- Selecciona un alumno --</option>
                                    {modalClientsFiltered.length > 0 ? (
                                        modalClientsFiltered.map(client => (
                                            <option key={client.id} value={client.id} className="p-2">{client.first_name} {client.last_name}</option>
                                        ))
                                    ) : <option disabled>No hay alumnos compatibles</option>}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Desde</label>
                                <input type="date" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B]" value={assignData.startDate} onChange={e => setAssignData({...assignData, startDate: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hasta</label>
                                <input type="date" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B]" value={assignData.endDate} onChange={e => setAssignData({...assignData, endDate: e.target.value})} required />
                            </div>
                        </div>

                        {modalType === 'massive' && (
                            <div className="bg-purple-50 p-3 rounded-lg flex gap-3 items-start border border-purple-100">
                                <Filter size={18} className="text-purple-600 mt-0.5 shrink-0"/>
                                <p className="text-xs text-purple-800">
                                    Se asignará automáticamente a todos los alumnos <strong>PRO</strong> que tengan el objetivo <strong>"{selectedPlan.goal}"</strong>.
                                </p>
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