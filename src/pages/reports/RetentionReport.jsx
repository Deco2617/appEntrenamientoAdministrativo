import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, Users } from 'lucide-react';
// IMPORTAMOS GRÁFICOS
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function RetentionReport() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colores: Verde para activo, Rojo suave para inactivo
  const COLORS = ['#4CAF50', '#EF5350'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/trainer/my-students');
      const clients = response.data;
      
      let active = 0;
      let inactive = 0;

      clients.forEach(c => {
        const sub = c.subscriptions?.[0];
        if (sub && (sub.status === 1 || sub.status === 'active')) {
          active++;
        } else {
          inactive++;
        }
      });

      // Formato para Recharts
      setChartData([
        { name: 'Activos', value: active },
        { name: 'Inactivos', value: inactive }
      ]);

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
            <Users className="text-blue-500" /> Retención de Clientes
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* GRÁFICO DE DONA */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-96">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Estado de la Cartera</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80} // Esto hace que sea una Dona
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* DATOS EXPLICADOS */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
             <h3 className="font-bold text-gray-800 text-xl mb-6">Detalle</h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="font-medium text-gray-700">Clientes Activos</span>
                    </div>
                    <span className="text-2xl font-bold text-green-700">
                        {chartData[0]?.value || 0}
                    </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="font-medium text-gray-700">Inactivos / Sin Plan</span>
                    </div>
                    <span className="text-2xl font-bold text-red-700">
                        {chartData[1]?.value || 0}
                    </span>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}