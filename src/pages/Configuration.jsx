import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { User, Lock, Camera, Trash2, Save, RefreshCw } from 'lucide-react';

const Configuration = () => {
    const [activeTab, setActiveTab] = useState('account'); // 'account' o 'appearance'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Estado para Datos del Perfil
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '', // Agrego apellido por si acaso
        email: '',
        photo_url: null,
        photo_file: null // Para enviar al backend
    });

    // Estado para Contraseña
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    // Cargar datos del usuario al entrar
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true); // Opcional: para feedback visual
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = response.data;

            // Restablecemos TODO el estado
            setProfile({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                photo_url: userData.profile_photo_url,
                photo_file: null // <--- ¡IMPORTANTE! Esto borra cualquier foto pendiente de subir
            });

            // También limpiamos los campos de contraseña
            setPasswords({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });

        } catch (error) {
            console.error("Error cargando perfil", error);
        } finally {
            setLoading(false);
        }
    };
    const handleDeletePhoto = async () => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")) return;

        try {
            const token = localStorage.getItem('token');
            // Llamamos al endpoint que acabamos de crear
            const response = await axios.delete('http://127.0.0.1:8000/api/auth/delete-profile-photo', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Actualizamos la interfaz con la imagen por defecto que nos devuelve el backend
            setProfile({
                ...profile,
                photo_url: response.data.photo_url,
                photo_file: null // Aseguramos que no haya nada pendiente
            });

            setMessage({ type: 'success', text: 'Foto eliminada correctamente.' });

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'No se pudo eliminar la foto.' });
        }
    };

    // Manejar cambio de foto
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile({
                ...profile,
                photo_file: file,
                photo_url: URL.createObjectURL(file) // Previsualización inmediata
            });
        }
    };

    // Guardar Cambios Generales
    const handleSaveProfile = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('first_name', profile.first_name);
            formData.append('last_name', profile.last_name);
            formData.append('email', profile.email);
            if (profile.photo_file) {
                formData.append('photo', profile.photo_file);
            }

            await axios.post('http://127.0.0.1:8000/api/auth/update-profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });

            // Si cambiaste contraseña también
            if (passwords.current_password && passwords.new_password) {
                await handleSavePassword(token);
            }

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil. Revisa los datos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePassword = async (token) => {
        await axios.put('http://127.0.0.1:8000/api/auth/update-password', passwords, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                    {/* Avatar pequeño de la esquina superior derecha */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                        {profile.photo_url ? (
                            <img src={profile.photo_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-full h-full p-2 text-gray-400" />
                        )}
                    </div>
                </header>

                <div className="flex gap-8">
                    {/* --- SIDEBAR INTERNO DE CONFIG --- */}
                    <div className="w-64 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <User size={18} /> Cuenta
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Camera size={18} /> Apariencia
                        </button>
                    </div>

                    {/* --- CONTENIDO DEL FORMULARIO --- */}
                    <div className="flex-1 max-w-3xl">
                        {activeTab === 'account' && (
                            <div className="space-y-6">

                                {/* 1. INFORMACIÓN DEL PERFIL */}
                                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">Información del Perfil</h2>
                                    <p className="text-sm text-gray-500 mb-6">Actualiza tu foto y detalles personales aquí.</p>

                                    {/* Foto de Perfil */}
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-2 border-pink-100">
                                            {profile.photo_url ? (
                                                <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl text-pink-300 font-bold">{profile.first_name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition shadow-sm">
                                                Cambiar foto de perfil
                                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                            </label>
                                            <button
                                                onClick={handleDeletePhoto} // <--- Conectar aquí
                                                className="text-sm text-red-500 hover:text-red-700 font-medium">
                                                Eliminar foto
                                            </button>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    value={profile.first_name}
                                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                                    placeholder="Tu Nombre"
                                                />
                                                <input
                                                    type="text"
                                                    value={profile.last_name}
                                                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                                    placeholder="Tu Apellido"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico de contacto</label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. CAMBIAR CONTRASEÑA */}
                                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">Cambiar Contraseña</h2>
                                    <p className="text-sm text-gray-500 mb-6">Asegúrate de usar una contraseña segura.</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                                            <input
                                                type="password"
                                                value={passwords.current_password}
                                                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                                            <input
                                                type="password"
                                                value={passwords.new_password}
                                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
                                            <input
                                                type="password"
                                                value={passwords.new_password_confirmation}
                                                onChange={(e) => setPasswords({ ...passwords, new_password_confirmation: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* BOTONES DE ACCIÓN */}
                                <div className="flex items-center justify-end gap-4 pt-4">
                                    {message.text && (
                                        <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {message.text}
                                        </span>
                                    )}
                                    <button
                                        onClick={fetchUserData} // Resetear valores
                                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
                                    >
                                        Restablecer valores
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-200 transition-all flex items-center gap-2"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Configuration;