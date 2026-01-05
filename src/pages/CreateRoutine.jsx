import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Save, Clock, BarChart, Dumbbell, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackModal from '../components/FeedbackModal';
const CreateRoutine = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Necesario si usas token

    // --- ESTADOS DE DATOS ---
    const [catalog, setCatalog] = useState([]); // Todos los ejercicios de la BD
    const [loading, setLoading] = useState(true);

    // --- ESTADO DEL FORMULARIO (RUTINA) ---
    const [routineName, setRoutineName] = useState('');
    const [routineLevel, setRoutineLevel] = useState('beginner');
    const [routineDuration, setRoutineDuration] = useState(60);
    // Estado del Modal de Feedback
    const [feedback, setFeedback] = useState({
        isOpen: false,
        type: 'success', // 'success' o 'error'
        title: '',
        message: ''
    });
    // --- ESTADO DE EJERCICIOS SELECCIONADOS (El "Carrito") ---
    const [selectedExercises, setSelectedExercises] = useState([]);

    // --- FILTROS IZQUIERDA ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('Todos');
    const closeFeedback = () => {
        setFeedback({ ...feedback, isOpen: false });
        // Si fue éxito, redirigimos al cerrar el modal
        if (feedback.type === 'success') {
            navigate('/rutinas');
        }
    };
    // 1. CARGAR EL BANCO DE EJERCICIOS
    useEffect(() => {
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
    }, []);

    // 2. FUNCIÓN PARA AGREGAR EJERCICIO AL PANEL DERECHO
    const addExercise = (exercise) => {
        // Creamos un objeto nuevo con valores por defecto (Series: 4, Reps: 10, etc)
        const newEntry = {
            ...exercise, // Copia datos base (id, nombre...)
            uniqueId: Date.now(), // ID temporal único por si agregas el mismo ejercicio 2 veces
            sets: 4,
            reps: 10,
            rest_time: 60,
            notes: ''
        };
        setSelectedExercises([...selectedExercises, newEntry]);
    };

    // 3. FUNCIÓN PARA ELIMINAR DEL PANEL DERECHO
    const removeExercise = (uniqueId) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.uniqueId !== uniqueId));
    };

    // 4. FUNCIÓN PARA ACTUALIZAR INPUTS (Series, Reps, etc)
    const updateExerciseField = (uniqueId, field, value) => {
        setSelectedExercises(selectedExercises.map(ex =>
            ex.uniqueId === uniqueId ? { ...ex, [field]: value } : ex
        ));
    };
    // --- HELPER: OBTENER PORTADA DE YOUTUBE ---
    const getYoutubeThumbnail = (url) => {
        if (!url) return null;
        // Expresión regular para sacar el ID (igual que la que usamos antes)
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        // Si encontramos ID, devolvemos la URL de la miniatura (mqdefault es calidad media, ideal para listas)
        return (match && match[2].length === 11)
            ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
            : null;
    };

    // 5. GUARDAR TODO EN EL BACKEND (VERSIÓN CORREGIDA)
    const handleSaveRoutine = async () => {
        // --- VALIDACIONES LOCALES ---
        if (!routineName.trim()) {
            setFeedback({
                isOpen: true, type: 'error', title: 'Falta información',
                message: 'Por favor, escribe un nombre para la rutina.'
            });
            return;
        }
        if (selectedExercises.length < 5) {
            setFeedback({
                isOpen: true, type: 'error', title: 'Rutina incompleta',
                message: 'Debes agregar al menos 5 ejercicios antes de guardar la rutina.'
            });
            return;
        }

        try {
            const durationInt = parseInt(routineDuration, 10) || 60;

            // 1. PREPARAR EL PAQUETE DE EJERCICIOS (Array limpio)
            const exercisesPayload = selectedExercises.map(ex => ({
                id: ex.id,
                sets: parseInt(ex.sets),
                reps: parseInt(ex.reps),
                rest_time: parseInt(ex.rest_time)
            }));

            // 2. ENVIAR TODO EN UNA SOLA PETICIÓN (Rutina + Ejercicios)
            await api.post('/routines', {
                name: routineName,
                level: routineLevel,
                estimated_duration: durationInt,
                description: `Rutina con ${selectedExercises.length} ejercicios.`,
                exercises: exercisesPayload, // <--- ¡ESTO ES LO QUE FALTABA!
            });

            // 3. ÉXITO
            setFeedback({
                isOpen: true,
                type: 'success',
                title: '¡Rutina Creada!',
                message: 'La rutina se ha guardado correctamente y sin errores.'
            });

        } catch (error) {
            console.error("Error capturado en el frontend:", error);

            let errorTitle = "Error de Servidor";
            let errorMsg = "Ocurrió un error inesperado.";

            if (error.response) {
                // Extraemos la respuesta del servidor
                const { status, data } = error.response;

                if (status === 422) {
                    errorTitle = "Datos Inválidos";
                    // Verificamos si vienen errores específicos de validación
                    if (data.errors) {
                        // Esto convierte {name: ["msg"]} en "msg" de forma segura
                        errorMsg = Object.values(data.errors).flat().join(" ");
                    } else {
                        errorMsg = data.message || "Error en los datos enviados.";
                    }
                } else if (status === 403) {
                    errorMsg = "No tienes permiso para realizar esta acción.";
                } else {
                    errorMsg = data.message || "Error interno del servidor.";
                }
            } else if (error.request) {
                errorMsg = "No se pudo conectar con el servidor. Revisa tu conexión.";
            }

            // ACTUALIZACIÓN DEL ESTADO: Esto es lo que abre el modal
            setFeedback({
                isOpen: true,
                type: 'error',
                title: errorTitle,
                message: errorMsg
            });
        }
    };

    // --- FILTRADO VISUAL ---
    const filteredCatalog = catalog.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscle = filterMuscle === 'Todos' || ex.muscle_group === filterMuscle;
        return matchesSearch && matchesMuscle;
    });

    const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Pierna', 'Brazos', 'Hombros', 'Abdominales'];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 flex h-full">

                {/* --- COLUMNA IZQUIERDA: BANCO DE EJERCICIOS (1/3 del ancho) --- */}
                <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-lg">

                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800 text-lg mb-4">Banco de Ejercicios</h2>

                        {/* Buscador */}
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

                        {/* Tags de Filtro */}
                        <div className="flex flex-wrap gap-2">
                            {muscleGroups.map(muscle => (
                                <button
                                    key={muscle}
                                    onClick={() => setFilterMuscle(muscle)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border
                    ${filterMuscle === muscle
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                >
                                    {muscle}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                        {loading ? <p className="text-center text-gray-400 text-sm">Cargando...</p> :
                            filteredCatalog.map(ex => (
                                <div key={ex.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-pink-200 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        {/* Thumbnail o Icono (CON LÓGICA DE FOTO) */}
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-200">
                                            {getYoutubeThumbnail(ex.video_url) ? (
                                                <img
                                                    src={getYoutubeThumbnail(ex.video_url)}
                                                    alt={ex.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Dumbbell size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-800">{ex.name}</h4>
                                            <p className="text-xs text-gray-500 uppercase">{ex.muscle_group}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addExercise(ex)}
                                        className="w-8 h-8 bg-[#C2185B] text-white rounded-lg flex items-center justify-center hover:bg-[#ad1457] shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: CONSTRUCTOR DE RUTINA (Resto del ancho) --- */}
                <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">

                    {/* Header del Constructor */}
                    <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm shrink-0">
                        <div className="max-w-4xl mx-auto">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre de la Rutina</label>
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
                                    <select
                                        value={routineLevel}
                                        onChange={e => setRoutineLevel(e.target.value)}
                                        className="bg-transparent text-sm text-gray-700 font-medium border-none focus:ring-0 p-0 cursor-pointer"
                                    >
                                        <option value="beginner">Nivel Principiante</option>
                                        <option value="intermediate">Nivel Intermedio</option>
                                        <option value="advanced">Nivel Avanzado</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    <Clock size={16} className="text-gray-500" />
                                    <input
                                        type="number"
                                        value={routineDuration}
                                        onChange={e => setRoutineDuration(e.target.value)}
                                        className="bg-transparent text-sm text-gray-700 font-medium border-none focus:ring-0 p-0 w-12 text-center"
                                    />
                                    <span className="text-sm text-gray-500">minutos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Area de Ejercicios (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-6">

                            {selectedExercises.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl">
                                    <Dumbbell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <h3 className="text-lg font-medium text-gray-500">Tu rutina está vacía</h3>
                                    <p className="text-gray-400">Selecciona ejercicios del panel izquierdo para comenzar.</p>
                                </div>
                            ) : (
                                selectedExercises.map((item, index) => (
                                    <div key={item.uniqueId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn relative group">
                                        {/* Botón Borrar (aparece en hover) */}
                                        <button
                                            onClick={() => removeExercise(item.uniqueId)}
                                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center text-[#C2185B] font-bold text-lg">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                                                <p className="text-xs text-gray-400 uppercase font-semibold">{item.muscle_group}</p>
                                            </div>
                                        </div>

                                        {/* Grid de Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Series</label>
                                                <input
                                                    type="number"
                                                    value={item.sets}
                                                    onChange={(e) => updateExerciseField(item.uniqueId, 'sets', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-medium focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Repeticiones</label>
                                                <input
                                                    type="number"
                                                    value={item.reps}
                                                    onChange={(e) => updateExerciseField(item.uniqueId, 'reps', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-medium focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Descanso (seg)</label>
                                                <input
                                                    type="number"
                                                    value={item.rest_time}
                                                    onChange={(e) => updateExerciseField(item.uniqueId, 'rest_time', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-medium focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Notas */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Notas Técnicas</label>
                                            <textarea
                                                rows="2"
                                                value={item.notes || ''}
                                                onChange={(e) => updateExerciseField(item.uniqueId, 'notes', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] outline-none resize-none"
                                                placeholder="Ej. Movimiento controlado, codos pegados..."
                                            ></textarea>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer de Acciones */}
                    <div className="bg-white p-6 border-t border-gray-200 shrink-0">
                        <div className="max-w-4xl mx-auto flex justify-end gap-4">
                            <button
                                onClick={() => navigate('/rutinas')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveRoutine}
                                className="px-8 py-3 bg-[#C2185B] text-white font-semibold rounded-xl hover:bg-[#ad1457] shadow-lg shadow-pink-900/20 transition-all flex items-center gap-2"
                            >
                                <Save size={20} />
                                Guardar Rutina
                            </button>
                        </div>
                    </div>

                </div>
                <FeedbackModal
                    isOpen={feedback.isOpen}
                    onClose={closeFeedback}
                    type={feedback.type}
                    title={feedback.title}
                    message={feedback.message}
                />
            </main>
        </div>
    );
};

export default CreateRoutine;