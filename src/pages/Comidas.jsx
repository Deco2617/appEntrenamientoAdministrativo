import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Search, Plus, Trash2, Edit2, Utensils, X, Flame, Image as ImageIcon, Tag } from 'lucide-react';

const Comidas = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Estados del formulario
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Proteína'); 
  const [calories, setCalories] = useState('');
  const [imageFile, setImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null); 

  // Categorías de Grupos Alimenticios
  const categories = [
    'Proteína',      // Carnes, Huevos
    'Cereal/Grano',  // Arroz, Avena
    'Fruta',         // Manzana
    'Verdura',       // Lechuga
    'Lácteo',        // Queso, Yogur
    'Grasa',         // Aceite, Nueces
    'Azúcar',        // Miel
    'Bebida',        // Agua
    'Otro'
  ];

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/foods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoods(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando alimentos", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (food = null) => {
    if (food) {
      setEditingFood(food);
      setName(food.name);
      setCategory(food.category);
      setCalories(food.calories_per_100g);
      setImagePreview(food.image_url); 
      setImageFile(null);
    } else {
      setEditingFood(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
      setName('');
      setCategory('Proteína');
      setCalories('');
      setImageFile(null);
      setImagePreview(null);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('calories_per_100g', calories);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const config = {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

      if (editingFood) {
        formData.append('_method', 'PUT'); 
        await axios.post(`http://127.0.0.1:8000/api/foods/${editingFood.id}`, formData, config);
      } else {
        await axios.post('http://127.0.0.1:8000/api/foods', formData, config);
      }
      
      setIsModalOpen(false);
      fetchFoods();
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Revisa los datos.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este alimento?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFoods();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (cat) => {
    switch(cat) {
        case 'Proteína': return 'bg-red-50 text-red-600 border-red-100';
        case 'Verdura': return 'bg-green-50 text-green-600 border-green-100';
        case 'Fruta': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'Cereal/Grano': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'Grasa': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Lácteo': return 'bg-blue-50 text-blue-600 border-blue-100';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Alimentos</h1>
            <p className="text-sm text-gray-500">Base de datos de ingredientes clasificados por tipo.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-lg hover:bg-pink-700 shadow-md transition">
            <Plus size={20} /> Nuevo Alimento
          </button>
        </header>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" placeholder="Buscar (ej: Arroz, Pollo)..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700"
          />
        </div>

        {/* TABLA */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">Imagen</th>
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6 text-center">Kcal (100g)</th>
                <th className="py-4 px-6 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                 <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredFoods.length === 0 ? (
                 <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay alimentos registrados.</td></tr>
              ) : (
                filteredFoods.map(food => (
                <tr key={food.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6">
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        <ImageIcon size={20}/>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-800">{food.name}</td>
                  <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(food.category)}`}>
                          {food.category}
                      </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded">
                       <Flame size={14} className="text-orange-500"/> {food.calories_per_100g}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-end space-x-2">
                    <button onClick={() => handleOpenModal(food)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(food.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Utensils size={18} className="text-pink-600"/> {editingFood ? 'Editar' : 'Registrar'} Alimento
                </h3>
                <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Previsualización de Imagen */}
                <div className="flex justify-center mb-2">
                    <div className="w-full h-40 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <ImageIcon className="mx-auto mb-2" size={32}/>
                                <p className="text-xs">Haga clic para subir imagen</p>
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/0 hover:bg-black/10 transition cursor-pointer flex items-center justify-center">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            {imagePreview && <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">Cambiar Imagen</span>}
                        </label>
                    </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre del Alimento</label>
                   <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Pechuga de Pollo" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Grupo Alimenticio</label>
                     <div className="relative">
                        <select 
                            value={category} onChange={e => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm appearance-none"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Tag size={14} />
                        </div>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kcal (por 100g)</label>
                     <input type="number" required value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-sm" />
                   </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium shadow-lg shadow-pink-200 transition">
                        {editingFood ? 'Guardar Cambios' : 'Registrar Alimento'}
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

export default Comidas;