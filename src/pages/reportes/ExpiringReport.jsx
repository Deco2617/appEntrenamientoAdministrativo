import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // Asegúrate que la ruta sea correcta
import api from '../../services/api';
import { ArrowLeft, AlertCircle, Calendar } from 'lucide-react';

export default function ExpiringReport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expiringClients, setExpiringClients] = useState([]);

    useEffect(() => {
        fetchExpiringClients();
    }, []);

    const fetchExpiringClients = async () => {
        try {
            // Reusamos el endpoint de alumnos que ya tienes funcionando
            const response = await api.get('/trainer/my-students');
            const allClients = response.data;

            // LÓGICA DE FILTRADO: Vence en los próximos 7 días
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);

            const filtered = allClients.filter(client => {
                const sub = client.subscriptions?.[0];
                // Solo alumnos con suscripción activa (status 1 o 'active')
                if (!sub || (sub.status !== 1 && sub.status !== 'active')) return false;

                const endDate = new Date(sub.end_date);

                // Retorna verdadero si la fecha de fin es mayor a hoy Y menor a 7 días
                return endDate >= today && endDate <= nextWeek;
            });

            setExpiringClients(filtered);
        } catch (error) {
            console.error("Error al cargar reporte:", error);
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
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Próximos Vencimientos
                            <AlertCircle className="text-orange-500" />

                        </h1>
                        <p className="text-gray-500 text-sm">Alumnos cuya suscripción vence en los próximos 7 días.</p>
                    </div>
                </header>

                {/* TABLA DE RESULTADOS */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100 uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Alumno</th>
                                <th className="px-6 py-4 font-medium">Plan Actual</th>
                                <th className="px-6 py-4 font-medium">Fecha Vencimiento</th>
                                <th className="px-6 py-4 font-medium">Días Restantes</th>
                                <th className="px-6 py-4 font-medium text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Calculando fechas...</td></tr>
                            ) : expiringClients.length > 0 ? (
                                expiringClients.map((client) => {
                                    const sub = client.subscriptions[0];
                                    const endDate = new Date(sub.end_date);
                                    const today = new Date();
                                    const diffTime = Math.abs(endDate - today);
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={client.id} className="hover:bg-orange-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                                                <img
                                                    src={client.profile_photo ? `http://localhost:8000/storage/${client.profile_photo}` : `https://ui-avatars.com/api/?name=${client.first_name}`}
                                                    className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                                                    alt="avatar"
                                                />
                                                {client.first_name} {client.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {sub.plan?.name || 'Sin nombre'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-orange-600">
                                                {sub.end_date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                                                    {diffDays} días
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs bg-[#C2185B] text-white px-3 py-1.5 rounded hover:bg-[#ad1457] transition">
                                                    Notificar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                                        <Calendar className="w-8 h-8 opacity-20" />
                                        <span>¡Todo en orden! No hay vencimientos próximos.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}