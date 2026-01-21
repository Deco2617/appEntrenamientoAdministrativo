import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, Target } from 'lucide-react';
// IMPORTAMOS GRÁFICOS
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function GoalsReport() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paleta de colores variada
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/trainer/my-students');
      const clients = response.data;
      
      const counts = {};
      
      clients.forEach(client => {
        const goal = client.goals ? client.goals.trim().toLowerCase() : 'sin especificar';
        
        let category = 'Otros';
        if (goal.includes('peso') || goal.includes('adelgazar') || goal.includes('grasa')) category = 'Pérdida de Peso';
        else if (goal.includes('musculo') || goal.includes('hipertrofia') || goal.includes('volumen')) category = 'Ganancia Muscular';
        else if (goal.includes('fuerza')) category = 'Fuerza';
        else if (goal.includes('salud') || goal.includes('mantener')) category = 'Salud / Mantenimiento';
        else if (goal === 'sin especificar') category = 'Sin Especificar';

        if (!counts[category]) counts[category] = 0;
        counts[category]++;
      });

      const data = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key]
      }));

      setChartData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/reports')} className="p-2 bg-white border rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-purple-500" /> Objetivos de Alumnos
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
          {/* GRÁFICO DE PASTEL */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} // Muestra % adentro
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: "20px" }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* TABLA DE APOYO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-700">Detalle Numérico</h3>
            </div>
            <table className="w-full text-left">
                <tbody>
                    {chartData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            <td className="p-4 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {item.name}
                            </td>
                            <td className="p-4 font-bold text-right">{item.value} alumnos</td>
                        </tr>
                    ))}
                    {chartData.length === 0 && !loading && (
                        <tr><td colSpan="2" className="p-8 text-center text-gray-400">Sin datos</td></tr>
                    )}
                </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}