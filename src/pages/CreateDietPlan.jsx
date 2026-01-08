import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Search, Plus, X, ChevronDown, ChevronRight,
  Flame, Save, ArrowLeft, Copy, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateDietPlan = () => {
  const navigate = useNavigate();

  // Datos del Plan
  const [planMeta, setPlanMeta] = useState({ name: '', goal: 'Perder Peso', description: '' });

  // Biblioteca Alimentos
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Constructor Semanal
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const [activeDay, setActiveDay] = useState('monday');

  // Estructura Base
  const initialDayState = [
    { type: 'breakfast', label: 'Desayuno', time: '08:00', foods: [] },
    { type: 'lunch', label: 'Almuerzo', time: '13:00', foods: [] },
    { type: 'snack', label: 'Snack', time: '16:00', foods: [] },
    { type: 'dinner', label: 'Cena', time: '20:00', foods: [] }
  ];

  // Estado principal del plan
  const [weekPlan, setWeekPlan] = useState(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: JSON.parse(JSON.stringify(initialDayState)) }), {})
  );

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState(null);
  const [addFormData, setAddFormData] = useState({ quantity: '100', unit: 'g', targetMeal: 'breakfast' });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/foods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoods(res.data);
      groupFoodsByCategory(res.data);
    } catch (error) {
      console.error("Error al cargar alimentos", error);
    }
  };

  const groupFoodsByCategory = (foodList) => {
    const groups = foodList.reduce((acc, item) => {
      const cat = item.category || 'Otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    setCategories(groups);
    if (Object.keys(groups).length > 0) setExpandedCategory(Object.keys(groups)[0]);
  };
  // --- LÓGICA DE AGREGAR ---
  const handleFoodClick = (food) => {
    setSelectedFoodToAdd(food);
    setAddFormData({ ...addFormData, quantity: '100' }); // Reset cantidad
    setModalOpen(true);
  };
  // --- SOLUCIÓN BUG DOBLE AGREGADO ---
  // Usamos map para crear nuevos arrays en lugar de push (mutación)
  const confirmAddFood = () => {
    if (!selectedFoodToAdd) return;

    const quantityStr = `${addFormData.quantity}${addFormData.unit}`;
    const calories = Math.round((selectedFoodToAdd.calories_per_100g * parseInt(addFormData.quantity)) / 100);

    const newFoodItem = {
      ...selectedFoodToAdd,
      quantity: quantityStr,
      calculatedCalories: calories
    };

    setWeekPlan(prev => {
      // 1. Copiamos el array de comidas del día actual
      const currentDayMeals = prev[activeDay].map(meal => {
        // 2. Si es la comida objetivo (ej: Desayuno), retornamos una copia con el nuevo alimento
        if (meal.type === addFormData.targetMeal) {
          return {
            ...meal,
            foods: [...meal.foods, newFoodItem] // Spread operator evita duplicados por StrictMode
          };
        }
        // 3. Si no, retornamos la comida tal cual
        return meal;
      });

      return { ...prev, [activeDay]: currentDayMeals };
    });

    setModalOpen(false);
  };

  const removeFood = (mealType, foodIndex) => {
    setWeekPlan(prev => {
      const currentDayMeals = prev[activeDay].map(meal => {
        if (meal.type === mealType) {
          const updatedFoods = [...meal.foods];
          updatedFoods.splice(foodIndex, 1);
          return { ...meal, foods: updatedFoods };
        }
        return meal;
      });
      return { ...prev, [activeDay]: currentDayMeals };
    });
  };

  // --- SOLUCIÓN AL "FASTIDIO": COPIAR DÍA ---
  const copyDayToAllWeek = () => {
    if (!confirm(`¿Quieres copiar el menú del ${activeDay} a TODOS los días de la semana? Esto sobrescribirá lo que tengas en otros días.`)) return;

    const dayToClone = weekPlan[activeDay];
    const newWeek = {};
    daysOfWeek.forEach(day => {
      // Deep copy para evitar referencias cruzadas
      newWeek[day] = JSON.parse(JSON.stringify(dayToClone));
    });
    setWeekPlan(newWeek);
  };

  const calculateDailyCalories = () => {
    let total = 0;
    weekPlan[activeDay].forEach(meal => {
      meal.foods.forEach(f => total += (f.calculatedCalories || 0));
    });
    return total;
  };

  const handleSavePlan = async () => {
    if (!planMeta.name) return alert("Por favor ingresa un nombre para el plan.");

    const payload = {
      name: planMeta.name,
      goal: planMeta.goal,
      description: planMeta.description,
      days: weekPlan
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/diet-plans', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("¡Plan creado exitosamente!");
      navigate('/nutricion');
    } catch (error) {
      console.error(error);
      alert("Error al guardar el plan.");
    }
  };

  const filteredCategories = Object.keys(categories).reduce((acc, cat) => {
    const filteredItems = categories[cat].filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filteredItems.length > 0) acc[cat] = filteredItems;
    return acc;
  }, {});

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 ml-64 p-6 overflow-hidden h-screen flex flex-col">

        {/* --- NUEVA CABECERA MÁS LIMPIA (SOLUCIÓN DISEÑO FRÍO) --- */}
        <header className="flex justify-between items-start mb-6 shrink-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/nutricion')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <input
                type="text"
                placeholder="Nombre del Plan (Ej: Hipertrofia Avanzada)"
                className="text-xl font-bold text-gray-800 placeholder-gray-300 border-none outline-none focus:ring-0 p-0 w-96 bg-transparent"
                value={planMeta.name}
                onChange={e => setPlanMeta({ ...planMeta, name: e.target.value })}
              />
              <div className="flex items-center gap-2 mt-1">
                <select
                  className="text-xs font-bold text-[#C2185B] bg-pink-50 border-none rounded py-1 pl-2 pr-6 cursor-pointer focus:ring-0"
                  value={planMeta.goal}
                  onChange={e => setPlanMeta({ ...planMeta, goal: e.target.value })}
                >
                  <option>Perder Peso</option>
                  <option>Ganar Masa Muscular</option>
                  <option>Aumentar Fuerza</option>
                  <option>Resistencia / Cardio</option>
                  <option>Mantenimiento/Salud General</option>
                </select>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-400">Duración sugerida: 1 semana (cíclica)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Card de Calorías */}
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Calorías Diarias ({activeDay})</span>
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={18} fill="currentColor" />
                <span className="text-2xl font-bold text-gray-800">{calculateDailyCalories()}</span>
                <span className="text-sm text-gray-400 font-medium">/ 2200</span>
              </div>
            </div>

            <button
              onClick={handleSavePlan}
              className="bg-[#C2185B] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-pink-100 hover:bg-[#A0134D] transition transform hover:-translate-y-0.5"
            >
              <Save size={18} /> Guardar Plan
            </button>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">

          {/* COLUMNA IZQUIERDA: BIBLIOTECA */}
          <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar ingredientes..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#C2185B] transition"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {Object.keys(filteredCategories).map(cat => (
                <div key={cat} className="mb-2">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                    className="w-full flex justify-between items-center p-3 text-sm font-bold text-gray-600 hover:bg-pink-50 rounded-lg transition"
                  >
                    <span>{cat}</span>
                    {expandedCategory === cat ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {expandedCategory === cat && (
                    <div className="pl-2 mt-1 space-y-1">
                      {filteredCategories[cat].map(food => (
                        <div
                          key={food.id}
                          onClick={() => handleFoodClick(food)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 cursor-pointer group transition-all"
                        >
                          <img src={food.image_url} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-700 truncate group-hover:text-[#C2185B]">{food.name}</p>
                            <p className="text-[10px] text-gray-400">{food.calories_per_100g} kcal</p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#C2185B] group-hover:text-white transition">
                            <Plus size={12} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: LIENZO DE PLANIFICACIÓN */}
          <div className="col-span-9 flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* Barra de Herramientas del Lienzo */}
            <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50/30">
              {/* Selector de Días */}
              <div className="flex gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeDay === day
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {day === 'wednesday' ? 'Mier' : day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Botón Mágico: Clonar Día */}
              <button
                onClick={copyDayToAllWeek}
                className="flex items-center gap-2 text-xs font-bold text-[#C2185B] bg-pink-50 px-3 py-2 rounded-lg hover:bg-pink-100 transition"
                title="Copiar las comidas de hoy a todos los días de la semana"
              >
                <Copy size={14} /> Copiar {activeDay} a toda la semana
              </button>
            </div>

            {/* Grid de Comidas */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#FAFAFA]">
              <div className="grid grid-cols-2 gap-6">
                {weekPlan[activeDay].map((meal, index) => (
                  <div key={meal.type} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">

                    {/* Cabecera de la Comida */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${['bg-yellow-400', 'bg-orange-500', 'bg-purple-500', 'bg-blue-500'][index]}`}></span>
                        {meal.label}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                        {meal.time}
                      </span>
                    </div>

                    {/* Lista de Alimentos Agregados */}
                    <div className="space-y-2 min-h-[120px]">
                      {meal.foods.length === 0 ? (
                        <div className="h-full border-2 border-dashed border-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-300 text-xs gap-2 py-4">
                          <Plus size={16} className="opacity-50" />
                          <span>Arrastra o selecciona alimentos</span>
                        </div>
                      ) : (
                        meal.foods.map((food, fIndex) => (
                          <div key={fIndex} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg group/item hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition">
                            <div className="flex items-center gap-3">
                              <img src={food.image_url} className="w-10 h-10 rounded-lg bg-white object-cover border border-gray-100" />
                              <div>
                                <p className="text-xs font-bold text-gray-700">{food.name}</p>
                                <div className="flex gap-2 text-[10px] text-gray-400 font-medium">
                                  <span>{food.quantity}</span>
                                  <span className="text-orange-400">{food.calculatedCalories} kcal</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFood(meal.type, fIndex)}
                              className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer de Totales */}
                    {meal.foods.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Bloque</span>
                        <span className="text-sm font-bold text-gray-800">
                          {meal.foods.reduce((acc, f) => acc + f.calculatedCalories, 0)} kcal
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* --- MODAL PARA CONFIRMAR ALIMENTO --- */}
        {modalOpen && selectedFoodToAdd && (
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Añadir Alimento</h3>
                  <p className="text-xs text-gray-500">Configura la porción para este plan</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <img src={selectedFoodToAdd.image_url} className="w-14 h-14 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-gray-800">{selectedFoodToAdd.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{selectedFoodToAdd.calories_per_100g} kcal <span className="text-gray-300">/</span> 100g</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Selecciona la Comida</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['breakfast', 'lunch', 'snack', 'dinner'].map(m => (
                      <button
                        key={m}
                        onClick={() => setAddFormData({ ...addFormData, targetMeal: m })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${addFormData.targetMeal === m
                          ? 'border-[#C2185B] bg-pink-50 text-[#C2185B]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                      >
                        {m === 'breakfast' ? 'Desayuno' : m === 'lunch' ? 'Almuerzo' : m === 'snack' ? 'Snack' : 'Cena'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Cantidad</label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-pink-100 font-bold text-center"
                      value={addFormData.quantity}
                      onChange={e => setAddFormData({ ...addFormData, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Unidad</label>
                    <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium text-center">
                      Gramos (g)
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={confirmAddFood}
                className="w-full mt-8 bg-[#C2185B] text-white py-3.5 rounded-xl font-bold hover:bg-[#A0134D] transition shadow-lg shadow-pink-100 flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={18} /> Confirmar y Añadir
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CreateDietPlan;