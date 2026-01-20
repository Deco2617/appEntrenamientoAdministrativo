import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Clock, DollarSign, TrendingUp, Users, ChevronRight } from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();

  // Configuración de las tarjetas
  const reportCards = [
    {
      title: "Próximos Vencimientos",
      description: "Alumnos con planes por vencer en los próximos 7 días.",
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      path: "/reports/expiring", // Esta ruta lleva al reporte detallado
      color: "bg-orange-50 border-orange-100 hover:border-orange-300",
      textColor: "text-orange-700"
    },
    {
      title: "Reporte de Ingresos",
      description: "Próximamente: Desglose de ganancias mensuales.",
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      path: "#", // Aún no creado
      color: "bg-green-50 border-green-100 hover:border-green-300",
      textColor: "text-green-700"
    },
    // Puedes agregar más tarjetas aquí...
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Reportes</h1>
          <p className="text-gray-500 text-sm mt-1">Selecciona una categoría para ver estadísticas detalladas.</p>
        </header>

        {/* GRID DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {reportCards.map((card, index) => (
            <div 
              key={index}
              onClick={() => card.path !== '#' && navigate(card.path)}
              className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between group ${card.color} bg-white`}
            >
              <div className="flex items-start gap-5">
                <div className={`p-3 rounded-xl shadow-sm bg-white`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-lg group-hover:underline ${card.textColor}`}>
                    {card.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              
              <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}