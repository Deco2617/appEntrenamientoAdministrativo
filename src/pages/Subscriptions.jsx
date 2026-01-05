import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Users, DollarSign, Search, Filter, Eye, Trash2, Edit } from 'lucide-react';

const Subscriptions = () => {
  const [stats, setStats] = useState({
    mrr: 0,
    activeSubs: 0
  });

  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      // Asegúrate de que la ruta sea correcta según tu api.php
      const response = await axios.get('http://127.0.0.1:8000/api/subscriptions/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.stats);
      setSubscriptionsData(response.data.table_data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando resumen:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
        Activo
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
        Inactivo
      </span>
    );
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
          <p className="text-sm text-gray-500">Gestión de ingresos y suscriptores por plan</p>
        </header>

        {/* --- TARJETAS DE MÉTRICAS (KPIs) - AHORA SOLO 2 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Card 1: Ingresos Recurrentes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <DollarSign size={24} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Mensual</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Totales (Estimado)</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">S/. {stats.mrr.toLocaleString()}</h3>
            </div>
          </div>

          {/* Card 2: Suscripciones Activas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Users size={24} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Total</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Suscripciones Activas</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeSubs}</h3>
            </div>
          </div>

        </div>

        {/* --- FILTROS Y TABLA --- */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">

          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800">Detalle por Plan</h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Nombre del Plan</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Precio</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Ciclo</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-center">Clientes</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-center">Estado</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Ingresos Totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">Cargando datos...</td>
                  </tr>
                ) : subscriptionsData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">No hay planes con suscripciones aún.</td>
                  </tr>
                ) : (
                  subscriptionsData
                    .filter((item) =>
                      item.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.plan_name}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">S/. {Number(item.price).toFixed(2)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{item.cycle}</td>
                        <td className="py-4 px-6 text-sm text-gray-900 font-bold text-center">{item.clients_count}</td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                          S/. {item.total_revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Subscriptions;