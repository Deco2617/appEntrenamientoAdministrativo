import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, DollarSign } from 'lucide-react';
// 1. IMPORTAMOS LOS COMPONENTES DE LA GRÁFICA
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function IncomeReport() {
  const navigate = useNavigate();
  // Estado para los datos de la gráfica y el total
  const [chartData, setChartData] = useState([]); 
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  // Colores para las barras (Rosa, Azul, Verde, Amarillo)
  const COLORS = ['#C2185B', '#1976D2', '#388E3C', '#FBC02D'];

  useEffect(() => {
    calculateIncome();
  }, []);

  const calculateIncome = async () => {
    try {
      const response = await api.get('/trainer/my-students');
      const clients = response.data;
      
      let total = 0;
      const planGroups = {}; // Aquí agruparemos: { "Plan Pro": 1500, "Plan Básico": 500 }

      clients.forEach(client => {
        const sub = client.subscriptions?.[0];
        // Solo sumamos si la suscripción está ACTIVA (status 1 o 'active')
        if (sub && (sub.status === 1 || sub.status === 'active')) {
          const price = parseFloat(sub.plan?.price || 0);
          const planName = sub.plan?.name || 'Desconocido';

          total += price;
          
          // Sumamos al acumulador del plan correspondiente
          if (!planGroups[planName]) planGroups[planName] = 0;
          planGroups[planName] += price;
        }
      });

      // 2. TRANSFORMAMOS LOS DATOS PARA LA GRÁFICA
      // Recharts necesita un array de objetos: [{ name: 'Plan X', value: 100 }, ...]
      const data = Object.keys(planGroups).map((key, index) => ({
        name: key,
        value: planGroups[key],
        color: COLORS[index % COLORS.length] // Asignamos un color cíclico
      }));

      setChartData(data);
      setTotalIncome(total);
    } catch (error) {
      console.error("Error calculando ingresos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/reports')} 
            className="p-2 bg-white border rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-green-500" /> Reporte de Ingresos
            </h1>
            <p className="text-gray-500 text-sm">Distribución de ganancias mensuales por tipo de plan activo.</p>
          </div>
        </header>

        {/* TARJETA GIGANTE CON EL TOTAL */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 text-center">
          <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Ingreso Mensual Recurrente</p>
          <h2 className="text-6xl font-extrabold text-[#C2185B] mt-4">
            ${totalIncome.toLocaleString()}
          </h2>
          <p className="text-gray-400 text-xs mt-2">Basado en {chartData.length} tipos de planes activos</p>
        </div>

        {/* 3. AQUÍ ESTÁ LA GRÁFICA VISUAL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-700 mb-6 border-b border-gray-100 pb-2">
            Desglose por Plan
          </h3>
          
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Cargando datos...</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{fill: '#666', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{fill: '#999', fontSize: 12}} 
                />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value) => [`$${value}`, 'Ingresos']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No hay ingresos registrados aún.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}