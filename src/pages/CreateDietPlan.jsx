import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Search, Plus, X, ChevronDown, ChevronRight,
  Flame, Save, Calendar, ArrowLeft, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateDietPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Datos del Plan General
  const [planMeta, setPlanMeta] = useState({ name: '', goal: 'Perder Peso', description: '' });

  // Estado de Alimentos (Biblioteca)
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState({}); // { 'Fruta': [food1, food2], ... }
  const [expandedCategory, setExpandedCategory] = useState(null); // Para el acordeón

  // Estado del Constructor del Plan (Estructura Semanal)
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const [activeDay, setActiveDay] = useState('monday');

  // Estructura inicial: Un objeto con claves por día, y dentro array de comidas
  const initialDayState = [
    { type: 'breakfast', label: 'Desayuno', time: '08:00', foods: [] },
    { type: 'lunch', label: 'Almuerzo', time: '13:00', foods: [] },
    { type: 'snack', label: 'Snack', time: '16:00', foods: [] },
    { type: 'dinner', label: 'Cena', time: '20:00', foods: [] }
  ];

  const [weekPlan, setWeekPlan] = useState(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: JSON.parse(JSON.stringify(initialDayState)) }), {})
  );

  // Modal de Agregar Alimento
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
      setLoading(false);
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
    // Abrir la primera categoría por defecto
    if (Object.keys(groups).length > 0) setExpandedCategory(Object.keys(groups)[0]);
  };

  // --- LÓGICA DE AGREGAR ---
  const handleFoodClick = (food) => {
    setSelectedFoodToAdd(food);
    setAddFormData({ ...addFormData, quantity: '100' }); // Reset cantidad
    setModalOpen(true);
  };

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
      const currentDayMeals = [...prev[activeDay]];
      const mealIndex = currentDayMeals.findIndex(m => m.type === addFormData.targetMeal);

      if (mealIndex !== -1) {
        currentDayMeals[mealIndex].foods.push(newFoodItem);
      }
      return { ...prev, [activeDay]: currentDayMeals };
    });

    setModalOpen(false);
  };

  const removeFood = (mealType, foodIndex) => {
    setWeekPlan(prev => {
      const currentDayMeals = [...prev[activeDay]];
      const mealIndex = currentDayMeals.findIndex(m => m.type === mealType);
      currentDayMeals[mealIndex].foods.splice(foodIndex, 1);
      return { ...prev, [activeDay]: currentDayMeals };
    });
  };

  // --- CÁLCULOS ---
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
      days: weekPlan // Enviamos la estructura completa
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

  // Filtrado de la lista izquierda
  const filteredCategories = Object.keys(categories).reduce((acc, cat) => {
    const filteredItems = categories[cat].filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filteredItems.length > 0) acc[cat] = filteredItems;
    return acc;
  }, {});

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 ml-64 p-6 overflow-hidden h-screen flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/nutricion')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <ArrowLeft size={20} />
            </button>
            <div>
              <input
                type="text"
                placeholder="Nombre del Plan (Ej: Keto Principiante)"
                className="text-xl font-bold bg-transparent border-none outline-none placeholder-gray-300 w-96 focus:ring-0 p-0"
                value={planMeta.name}
                onChange={e => setPlanMeta({ ...planMeta, name: e.target.value })}
              />
              <div className="flex gap-2 text-xs mt-1">
                <select
                  className="bg-transparent text-gray-500 border-none p-0 focus:ring-0 cursor-pointer font-medium"
                  value={planMeta.goal}
                  onChange={e => setPlanMeta({ ...planMeta, goal: e.target.value })}
                >
                  <option value="lose_weight">Perder Peso</option>
                  <option value="gain_muscle">Ganar Masa Muscular</option>
                  <option value="strength">Aumentar Fuerza</option>
                  <option value="lose_weight">Resistencia / Cardio</option>
                  <option value="gain_muscle">Mantenimiento/Salud General</option>
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleSavePlan}
            className="bg-[#C2185B] text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-[#A0134D] transition"
          >
            <Save size={18} /> Guardar Plan
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL - GRID DE 2 COLUMNAS */}
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">

          {/* --- COLUMNA IZQUIERDA: BIBLIOTECA (Scrollable) --- */}
          <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-50 shrink-0">
              <h3 className="font-bold text-gray-700 mb-3">Alimentos Disponibles</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar alimentos..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#C2185B]"
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
                    className="w-full flex justify-between items-center p-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <span>{cat}</span>
                    {expandedCategory === cat ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {expandedCategory === cat && (
                    <div className="pl-2 pr-1 mt-1 space-y-1">
                      {filteredCategories[cat].map(food => (
                        <div
                          key={food.id}
                          onClick={() => handleFoodClick(food)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-50 cursor-pointer group border border-transparent hover:border-pink-100 transition"
                        >
                          <img src={food.image_url} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-700 truncate group-hover:text-[#C2185B]">{food.name}</p>
                            <p className="text-[10px] text-gray-400">{food.calories_per_100g} kcal</p>
                          </div>
                          <button className="p-1 rounded bg-white shadow-sm opacity-0 group-hover:opacity-100 text-[#C2185B]">
                            <Plus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* --- COLUMNA DERECHA: CONSTRUCTOR (Lienzo) --- */}
          <div className="col-span-9 flex flex-col overflow-hidden">

            {/* Barra Superior del Lienzo: Calorías y Días */}
            <div className="bg-[#880E4F] rounded-t-2xl p-4 text-white shadow-md shrink-0 flex justify-between items-center">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-80">Calorías Totales</p>
                  <p className="text-2xl font-bold">{calculateDailyCalories()} <span className="text-sm font-normal opacity-70">/ 2200 kcal</span></p>
                </div>
                <div className="h-10 w-px bg-white/20"></div>
                {/* Selector de Días Simplificado */}
                <div className="flex gap-1 items-center">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${activeDay === day ? 'bg-white text-[#880E4F]' : 'bg-white/10 hover:bg-white/20'}`}
                      title={day}
                    >
                      {day.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold capitalize">{activeDay}</p>
                <p className="text-[10px] opacity-70">Editando menú diario</p>
              </div>
            </div>

            {/* Área de Comidas (Scrollable) */}
            <div className="flex-1 bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                {weekPlan[activeDay].map((meal, index) => (
                  <div key={meal.type} className="border border-gray-100 rounded-xl p-4 hover:border-pink-100 transition shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-[#C2185B]' : 'bg-purple-600'}`}></span>
                        {meal.label}
                      </h4>
                      <button
                        onClick={() => {
                          setAddFormData(prev => ({ ...prev, targetMeal: meal.type }));
                          // Aquí podrías enfocar el buscador o abrir un modal directo
                          document.querySelector('input[placeholder="Buscar alimentos..."]').focus();
                        }}
                        className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold transition"
                      >
                        + Añadir
                      </button>
                    </div>

                    <div className="space-y-2 min-h-[100px]">
                      {meal.foods.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 text-xs italic py-4">
                          No hay alimentos
                        </div>
                      ) : (
                        meal.foods.map((food, fIndex) => (
                          <div key={fIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg group">
                            <div className="flex items-center gap-3">
                              <img src={food.image_url} className="w-8 h-8 rounded bg-white object-cover" />
                              <div>
                                <p className="text-xs font-bold text-gray-700">{food.name}</p>
                                <p className="text-[10px] text-gray-500">{food.quantity} • {food.calculatedCalories} kcal</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFood(meal.type, fIndex)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Totales de la comida */}
                    <div className="mt-3 pt-2 border-t border-gray-50 flex justify-end">
                      <span className="text-[10px] font-bold text-gray-400">
                        Total: {meal.foods.reduce((acc, f) => acc + f.calculatedCalories, 0)} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* --- MODAL PARA AGREGAR CANTIDAD --- */}
        {modalOpen && selectedFoodToAdd && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 transform transition-all">
              <div className="p-4 bg-[#C2185B] text-white flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Plus size={16} /> Agregar al Plan
                </h3>
                <button onClick={() => setModalOpen(false)} className="hover:bg-white/20 p-1 rounded"><X size={16} /></button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img src={selectedFoodToAdd.image_url} className="w-16 h-16 rounded-lg object-cover bg-gray-100 border" />
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{selectedFoodToAdd.name}</p>
                    <p className="text-xs text-gray-500">{selectedFoodToAdd.calories_per_100g} kcal / 100g</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Comida</label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500"
                      value={addFormData.targetMeal}
                      onChange={e => setAddFormData({ ...addFormData, targetMeal: e.target.value })}
                    >
                      <option value="breakfast">Desayuno</option>
                      <option value="lunch">Almuerzo</option>
                      <option value="snack">Snack</option>
                      <option value="dinner">Cena</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cantidad</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500"
                        value={addFormData.quantity}
                        onChange={e => setAddFormData({ ...addFormData, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Unidad</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50" disabled>
                        <option>gramos (g)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={confirmAddFood}
                  className="w-full mt-6 bg-[#C2185B] text-white py-3 rounded-lg font-bold shadow-lg shadow-pink-200 hover:bg-[#A0134D] transition"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CreateDietPlan;