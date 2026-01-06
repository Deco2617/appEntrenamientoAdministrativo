import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Save, Clock, BarChart, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackModal from '../components/FeedbackModal';

const CreateRoutine = () => {
    const { id } = useParams(); 
    const isEditing = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();

    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    const [routineName, setRoutineName] = useState('');
    const [routineLevel, setRoutineLevel] = useState('beginner');
    const [routineDuration, setRoutineDuration] = useState(60);
    const [feedback, setFeedback] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [selectedExercises, setSelectedExercises] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('Todos');

    // Estandarización de grupos musculares basada en referencia
    const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Abdomen', 'Cardio', 'Full Body'];

    const closeFeedback = () => {
        setFeedback({ ...feedback, isOpen: false });
        if (feedback.type === 'success') navigate('/rutinas');
    };

    useEffect(() => {
        const loadRoutineData = async () => {
            if (isEditing) {
                try {
                    const response = await api.get(`/routines/${id}`);
                    const routine = response.data.data || response.data;
                    setRoutineName(routine.name);
                    setRoutineLevel(routine.level);
                    setRoutineDuration(routine.estimated_duration);
                    
                    const mappedExercises = routine.exercises.map(ex => ({
                        ...ex,
                        uniqueId: ex.id + Date.now() + Math.random(),
                        sets: ex.pivot?.sets || 4,
                        reps: ex.pivot?.reps || 10,
                        rest_time: ex.pivot?.rest_time || 60,
                        notes: ex.pivot?.notes || '' // Carga de notas técnicas
                    }));
                    setSelectedExercises(mappedExercises);
                } catch (error) {
                    console.error("Error cargando rutina:", error);
                }
            }
        };

        const fetchExercises = async () => {
            try {
                const response = await api.get('/exercises');
                const data = response.data;
                setCatalog(Array.isArray(data) ? data : data.data || []);
            } catch (error) {
                console.error("Error cargando banco:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
        loadRoutineData();
    }, [id, isEditing]);

    const addExercise = (exercise) => {
        const newEntry = {
            ...exercise,
            uniqueId: Date.now() + Math.random(),
            sets: 4,
            reps: 10,
            rest_time: 60,
            notes: '' // Valor inicial vacío para notas
        };
        setSelectedExercises([...selectedExercises, newEntry]);
    };

    const removeExercise = (uniqueId) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.uniqueId !== uniqueId));
    };

    const updateExerciseField = (uniqueId, field, value) => {
        setSelectedExercises(selectedExercises.map(ex =>
            ex.uniqueId === uniqueId ? { ...ex, [field]: value } : ex
        ));
    };

    const getYoutubeThumbnail = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
    };

    const handleSaveRoutine = async () => {
        if (!routineName.trim()) {
            setFeedback({ isOpen: true, type: 'error', title: 'Falta información', message: 'Escribe un nombre.' });
            return;
        }
        if (selectedExercises.length < 1) {
            setFeedback({ isOpen: true, type: 'error', title: 'Rutina vacía', message: 'Añade al menos un ejercicio.' });
            return;
        }

        try {
            const payload = {
                name: routineName,
                level: routineLevel,
                estimated_duration: parseInt(routineDuration, 10),
                description: `Rutina con ${selectedExercises.length} ejercicios.`,
                exercises: selectedExercises.map(ex => ({
                    id: ex.id,
                    sets: parseInt(ex.sets),
                    reps: parseInt(ex.reps),
                    rest_time: parseInt(ex.rest_time),
                    notes: ex.notes // Envío de notas técnicas al servidor
                }))
            };

            if (isEditing) {
                await api.put(`/routines/${id}`, payload);
            } else {
                await api.post('/routines', payload);
            }

            setFeedback({
                isOpen: true,
                type: 'success',
                title: isEditing ? '¡Rutina Actualizada!' : '¡Rutina Creada!',
                message: 'Los cambios se han guardado correctamente.'
            });

        } catch (error) {
            setFeedback({ isOpen: true, type: 'error', title: 'Error', message: 'No se pudo guardar la rutina.' });
        }
    };

    const filteredCatalog = catalog.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscle = filterMuscle === 'Todos' || ex.muscle_group === filterMuscle;
        return matchesSearch && matchesMuscle;
    });

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 flex h-full">
                {/* COLUMNA IZQUIERDA: BANCO DE EJERCICIOS */}
                <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-lg">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800 text-lg mb-4">Banco de Ejercicios</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar ejercicio..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                            />
                        </div>
                        {/* Filtros estandarizados */}
                        <div className="flex flex-wrap gap-2">
                            {muscleGroups.map(muscle => (
                                <button key={muscle} onClick={() => setFilterMuscle(muscle)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterMuscle === muscle ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                >
                                    {muscle}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                        {loading ? <p className="text-center text-gray-400 text-sm">Cargando...</p> :
                            filteredCatalog.map(ex => (
                                <div key={ex.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-pink-200 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-200">
                                            {getYoutubeThumbnail(ex.video_url) ? (
                                                <img src={getYoutubeThumbnail(ex.video_url)} alt={ex.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Dumbbell size={20} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-800">{ex.name}</h4>
                                            <p className="text-xs text-gray-500 uppercase">{ex.muscle_group}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => addExercise(ex)} className="w-8 h-8 bg-[#C2185B] text-white rounded-lg flex items-center justify-center hover:bg-[#ad1457] transition-transform active:scale-95">
                                        <Plus size={18} />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* COLUMNA DERECHA: CONSTRUCTOR DE RUTINA */}
                <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
                    <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm shrink-0">
                        <div className="max-w-4xl mx-auto">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                {isEditing ? "Modificando Rutina" : "Nombre de la Rutina"}
                            </label>
                            <input
                                type="text"
                                value={routineName}
                                onChange={e => setRoutineName(e.target.value)}
                                className="text-3xl font-bold text-gray-800 placeholder-gray-300 w-full bg-transparent border-none focus:ring-0 p-0"
                                placeholder="Ej. Nueva Rutina de Fuerza"
                            />
                            <div className="flex gap-6 mt-4">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <BarChart size={16} className="text-gray-500" />
                                    <select value={routineLevel} onChange={e => setRoutineLevel(e.target.value)} className="bg-transparent text-sm text-gray-700 font-medium border-none outline-none p-0 cursor-pointer">
                                        <option value="beginner">Nivel Principiante</option>
                                        <option value="intermediate">Nivel Intermedio</option>
                                        <option value="advanced">Nivel Avanzado</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <Clock size={16} className="text-gray-500" />
                                    <input type="number" value={routineDuration} onChange={e => setRoutineDuration(e.target.value)} className="bg-transparent text-sm text-gray-700 font-medium border-none outline-none p-0 w-12 text-center" />
                                    <span className="text-sm text-gray-500">minutos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {selectedExercises.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl">
                                    <Dumbbell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <h3 className="text-lg font-medium text-gray-500">Tu rutina está vacía</h3>
                                </div>
                            ) : (
                                selectedExercises.map((item, index) => (
                                    <div key={item.uniqueId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group">
                                        <button onClick={() => removeExercise(item.uniqueId)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center text-[#C2185B] font-bold text-lg">{index + 1}</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                                                <p className="text-xs text-gray-400 uppercase font-semibold">{item.muscle_group}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Series</label>
                                                <input type="number" value={item.sets} onChange={(e) => updateExerciseField(item.uniqueId, 'sets', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#C2185B]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Repeticiones</label>
                                                <input type="number" value={item.reps} onChange={(e) => updateExerciseField(item.uniqueId, 'reps', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#C2185B]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Descanso (s)</label>
                                                <input type="number" value={item.rest_time} onChange={(e) => updateExerciseField(item.uniqueId, 'rest_time', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#C2185B]" />
                                            </div>
                                        </div>
                                        {/* Recuadro de Notas Técnicas */}
                                        <div className="mt-4">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notas Técnicas</label>
                                            <textarea
                                                rows="2"
                                                value={item.notes || ''}
                                                onChange={(e) => updateExerciseField(item.uniqueId, 'notes', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none resize-none bg-gray-50/30"
                                                placeholder="Ej. Movimiento controlado, codos pegados..."
                                            ></textarea>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 border-t border-gray-200 shrink-0">
                        <div className="max-w-4xl mx-auto flex justify-end gap-4">
                            <button onClick={() => navigate('/rutinas')} className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Cancelar</button>
                            <button onClick={handleSaveRoutine} className="px-8 py-3 bg-[#C2185B] text-white font-semibold rounded-xl hover:bg-[#ad1457] shadow-lg flex items-center gap-2">
                                <Save size={20} /> {isEditing ? 'Guardar Cambios' : 'Guardar Rutina'}
                            </button>
                        </div>
                    </div>
                </div>
                <FeedbackModal isOpen={feedback.isOpen} onClose={closeFeedback} type={feedback.type} title={feedback.title} message={feedback.message} />
            </main>
        </div>
    );
};

export default CreateRoutine;