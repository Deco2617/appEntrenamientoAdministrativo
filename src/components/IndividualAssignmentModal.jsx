import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, CheckCircle, UserCheck, Info } from 'lucide-react';
import api from '../services/api';

const IndividualAssignmentModal = ({ isOpen, onClose, routine, onShowFeedback }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allClients, setAllClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchClients = async () => {
                try {
                    // Endpoint para obtener alumnos con plan personalizado
                    const response = await api.get('/clients?plan_type=Personalizado'); 
                    const data = response.data.data || response.data;
                    setAllClients(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Error cargando alumnos:", error);
                }
            };
            fetchClients();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredClients = allClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleClient = (clientId) => {
        setSelectedClients(prev => 
            prev.includes(clientId) 
                ? prev.filter(id => id !== clientId) 
                : [...prev, clientId]
        );
    };

    const handleAssign = async () => {
        if (selectedClients.length === 0) return;
        setLoading(true);
        try {
            await api.post('/assignments/individual-routine', {
                routine_id: routine.id,
                client_ids: selectedClients,
                assigned_date: startDate,
                end_date: endDate || null
            });

            onShowFeedback({
                type: 'success',
                title: '¡Asignación Exitosa!',
                message: `Rutina asignada correctamente a ${selectedClients.length} alumno(s).`
            });
            onClose();
        } catch (error) {
            onShowFeedback({
                type: 'error',
                title: 'Error de Asignación',
                message: error.response?.data?.message || "Error al procesar."
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-gray-800">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header con Color Principal #C2185B */}
                <div className="p-6 bg-[#C2185B] flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Asignar a Alumnos</h2>
                            <p className="text-pink-100 text-xs font-medium uppercase tracking-wider">Plan Personalizado</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Buscador */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar por nombre, email u objetivo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C2185B]/20 focus:border-[#C2185B] transition-all"
                        />
                    </div>

                    {/* Lista de Alumnos */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase px-1">
                            Selecciona los alumnos ({selectedClients.length} seleccionados)
                        </p>
                        <div className="border border-gray-100 rounded-xl max-h-52 overflow-y-auto custom-scrollbar bg-gray-50/30">
                            {filteredClients.map(client => (
                                <div 
                                    key={client.id}
                                    onClick={() => toggleClient(client.id)}
                                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-gray-100 last:border-0 hover:bg-white ${selectedClients.includes(client.id) ? 'bg-pink-50/30' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Checkbox con Color Principal */}
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedClients.includes(client.id) ? 'bg-[#C2185B] border-[#C2185B]' : 'bg-white border-gray-300'}`}>
                                            {selectedClients.includes(client.id) && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{client.name}</p>
                                            <p className="text-xs text-gray-400">{client.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-pink-100 text-[#C2185B] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Personalizado</span>
                                        <p className="text-[10px] text-gray-400 mt-1">{client.goal || 'Sin objetivo'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rango de Fechas basado en Referencia */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                                <Calendar size={14} className="text-[#C2185B]" /> Fecha de Inicio
                            </label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C2185B]/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                                <Calendar size={14} className="text-gray-400" /> Fecha Fin (Opc)
                            </label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C2185B]/20"
                            />
                        </div>
                    </div>

                    {/* Cuadro de Resumen Morado/Rosa */}
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                        <div className="flex gap-3">
                            <Info className="text-[#C2185B] shrink-0" size={18} />
                            <p className="text-xs text-[#C2185B] font-medium leading-tight">
                                Se asignará esta rutina a <strong>{selectedClients.length} alumno(s)</strong> con plan Personalizado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Acciones */}
                <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-all">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleAssign}
                        disabled={loading || selectedClients.length === 0}
                        className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                            loading || selectedClients.length === 0 ? 'bg-gray-300' : 'bg-[#C2185B] hover:bg-[#ad1457] active:scale-95'
                        }`}
                    >
                        {loading ? 'Asignando...' : 'Asignar Rutina'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IndividualAssignmentModal;