import React, { useState, useEffect } from 'react';
import { X, Users, LayoutGrid, Target, Calendar, Info, CheckCircle } from 'lucide-react';
import api from '../services/api';

const MassAssignmentModal = ({ isOpen, onClose, routine, onShowFeedback }) => {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [goal, setGoal] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const goalOptions = [
        "Bajar de peso",
        "Ganar masa muscular",
        "Mejorar resistencia cardio",
        "Aumentar fuerza",
        "Mantenimiento físico",
        "Flexibilidad y Movilidad"
    ];

    useEffect(() => {
        if (isOpen) {
            const fetchPlans = async () => {
                try {
                    // Se asume que el backend ya filtra o nosotros filtramos los status === 1
                    const response = await api.get('/plans');
                    const allPlans = response.data;

                    // Filtrar solo planes activos y mapear descripción de duración
                    const activePlans = allPlans.filter(p => p.is_active === 1 || p.is_active === true);
                    setPlans(activePlans);
                } catch (error) {
                    console.error("Error cargando planes:", error);
                }
            };
            fetchPlans();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Helper para mostrar el nombre del plan con su periodicidad
    const getPlanDisplayName = (plan) => {
        // Determinamos la periodicidad basada en duration_days
        let period = "";
        const days = parseInt(plan.duration_days);

        if (days <= 31) period = "Mensual";
        else if (days <= 95) period = "Trimestral";
        else if (days <= 190) period = "Semestral";
        else if (days >= 360) period = "Anual";
        else period = `${days} días`;

        // Si tu plan se llama "Básico", esto devolverá "Plan Básico - Mensual"
        // Usamos .includes para no repetir la palabra "Plan" si ya la tiene el nombre
        const baseName = plan.name.toLowerCase().includes('plan') ? plan.name : `Plan ${plan.name}`;

        return `${baseName} - ${period}`;
    };

    const handleAssign = async () => {
        setLoading(true);
        try {
            const response = await api.post('/assignments/mass-routine', {
                routine_id: routine.id,
                plan_id: selectedPlan,
                goal: goal,
                assigned_date: startDate
            });

            onShowFeedback({
                type: 'success',
                title: '¡Publicación Exitosa!',
                message: response.data.message
            });
            onClose();
        } catch (error) {
            onShowFeedback({
                type: 'error',
                title: 'Error de Publicación',
                message: error.response?.data?.message || "Error al procesar"
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden  animate-in fade-in zoom-in duration-200">

                {/* Header con Color Principal */}
                <div className="p-6 bg-[#C2185B] flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Publicar Rutina</h2>
                            <p className="text-pink-100 text-xs font-medium uppercase tracking-wider">Asignación Masiva</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Selector de Plan con Descripción */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                            <LayoutGrid size={14} className="text-[#C2185B]" /> Tipo de Plan
                        </label>
                        <select
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#C2185B] outline-none"
                        >
                            <option value="">Selecciona el plan de destino...</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>
                                    {getPlanDisplayName(p)}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 ml-1 italic">Solo se muestran planes activos</p>
                    </div>

                    {/* Selector de Objetivo */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                            <Target size={14} className="text-[#C2185B]" /> Objetivo del Cliente
                        </label>
                        <select
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#C2185B] outline-none"
                        >
                            <option value="">Cualquier objetivo...</option>
                            {goalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* Fecha de Inicio */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                            <Calendar size={14} className="text-[#C2185B]" /> Fecha de Inicio
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#C2185B] outline-none"
                        />
                    </div>

                    {/* Resumen Informativo */}
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                        <div className="flex gap-3">
                            <Info className="text-[#C2185B] shrink-0" size={18} />
                            <div className="space-y-1">
                                <p className="text-sm text-gray-700 leading-tight">
                                    Esta rutina se asignará automáticamente a todos los alumnos activos en:
                                </p>
                                <ul className="text-xs font-semibold text-[#C2185B] space-y-0.5">
                                    <li>• Plan: {plans.find(p => p.id == selectedPlan) ? getPlanDisplayName(plans.find(p => p.id == selectedPlan)) : '---'}</li>
                                    <li>• Objetivo: {goal || 'Todos'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">
                        Cancelar
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || !selectedPlan}
                        className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 ${loading || !selectedPlan ? 'bg-gray-300' : 'bg-[#C2185B] hover:bg-[#ad1457]'
                            }`}
                    >
                        {loading ? 'Procesando...' : <><CheckCircle size={20} /> Publicar Rutina</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MassAssignmentModal;