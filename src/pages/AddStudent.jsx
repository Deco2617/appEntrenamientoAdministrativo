import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios'; // Asegúrate de tener axios configurado
// Si usas un componente de Layout o Navbar, impórtalo aquí
// import Layout from '../components/Layout'; 
import { useNavigate } from 'react-router-dom';


export default function AddStudent() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate(); // <--- 2. INICIALIZAR EL HOOK
  // 1. CARGAR LOS PLANES AL INICIAR
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Asegúrate que esta ruta exista en tu api.php
        const response = await axios.get('http://127.0.0.1:8000/api/plans'); 
        // Si tu respuesta viene envuelta en 'data', usa response.data.data o ajusta según tu backend
        setPlans(response.data); 
      } catch (error) {
        console.error("Error cargando planes", error);
        setServerError("No se pudieron cargar los planes de suscripción.");
      }
    };
    fetchPlans();
  }, []);

  // 2. ENVIAR FORMULARIO
  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    try {
      // Preparamos los datos tal como los espera el AuthController
      const payload = {
        ...data,
        role: 'client',       // Forzamos que sea cliente
        profile_photo: 'default.png',
        // plan_id ya viene en 'data' gracias al register del select
      };

      // 1. RECUPERAR EL TOKEN DEL ENTRENADOR
      // Asumo que guardaste el token en localStorage al hacer login
      // Si usaste otro nombre (ej. 'auth_token'), cámbialo aquí.
      const token = localStorage.getItem('token'); 

      // 2. CONFIGURAR LA CABECERA (El "Carnet")
      const config = {
        headers: {
          Authorization: `Bearer ${token}` // <--- ESTO ES LA CLAVE
        }
      };

      // 3. ENVIAR LA PETICIÓN CON EL CONFIG
      // Nota: axios.post(url, datos, config)
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/register', 
        payload, 
        config // <--- Pasamos la configuración aquí
      );

      alert('¡Alumno registrado y asignado a ti correctamente!');
      // Ajusta '/trainer/my-students' a la ruta REAL que tengas en tu App.js para el panel
      navigate('/clientes');
    } catch (error) {
      console.error("Error en registro", error);
      if (error.response && error.response.data) {
        // Muestra el mensaje de error que devuelve Laravel (ej. Email duplicado)
        setServerError(error.response.data.message || "Error al registrar");
      } else {
        setServerError("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl border border-gray-100">
        
        <h2 className="text-3xl font-extrabold text-[#C2185B] mb-6 text-center">
          Registrar Nuevo Alumno
        </h2>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NOMBRE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
              <input
                {...register("first_name", { required: "El nombre es obligatorio" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] focus:border-transparent outline-none"
                placeholder="Ej. Juan"
              />
              {errors.first_name && <span className="text-red-500 text-xs">{errors.first_name.message}</span>}
            </div>

            {/* APELLIDO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
              <input
                {...register("last_name", { required: "El apellido es obligatorio" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] focus:border-transparent outline-none"
                placeholder="Ej. Pérez"
              />
              {errors.last_name && <span className="text-red-500 text-xs">{errors.last_name.message}</span>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                {...register("email", { required: "El email es obligatorio" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] focus:border-transparent outline-none"
                placeholder="juan@ejemplo.com"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

             {/* TELÉFONO */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
              <input
                {...register("phone_number")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] focus:border-transparent outline-none"
                placeholder="Ej. 999888777"
              />
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] focus:border-transparent outline-none"
                placeholder="******"
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>

            {/* FECHA NACIMIENTO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                {...register("birth_date", { required: "Fecha requerida" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] focus:border-transparent outline-none"
              />
              {errors.birth_date && <span className="text-red-500 text-xs">{errors.birth_date.message}</span>}
            </div>

            {/* GÉNERO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
              <select
                {...register("gender", { required: "Selecciona un género" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] outline-none bg-white"
              >
                <option value="">-- Seleccionar --</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
            </div>

            {/* PESO Y ALTURA (En una misma fila visual) */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("weight", { required: "Requerido" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] outline-none"
                />
                {errors.weight && <span className="text-red-500 text-xs">{errors.weight.message}</span>}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("height", { required: "Requerido" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] outline-none"
                />
                {errors.height && <span className="text-red-500 text-xs">{errors.height.message}</span>}
              </div>
            </div>

            {/* === SECCIÓN ESPECIAL: PLAN DE SUSCRIPCIÓN === */}
            <div className="md:col-span-2 bg-pink-50 p-4 rounded-xl border border-pink-200">
              <label className="block text-lg font-bold text-[#C2185B] mb-2">
                Asignar Plan de Suscripción
              </label>
              <p className="text-xs text-gray-500 mb-3">La suscripción se activará automáticamente al registrarse.</p>
              
              <select 
                {...register("plan_id", { required: "Debes seleccionar un plan obligatorio" })}
                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] outline-none bg-white text-gray-700 font-medium"
              >
                <option value="">-- Selecciona un Plan --</option>
                {plans.length > 0 ? (
                  plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                       {plan.name} — S/. {plan.price} (Duración: {plan.duration_days} días)
                    </option>
                  ))
                ) : (
                  <option disabled>Cargando planes o no hay planes disponibles...</option>
                )}
              </select>
              {errors.plan_id && <span className="text-red-600 font-bold text-sm mt-1">{errors.plan_id.message}</span>}
            </div>

            {/* OBJETIVO (Requerido por RF-04) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Objetivo Principal (Ficha Técnica)
              </label>
              <select
                {...register("goals", { required: "Este dato es requerido por la ficha técnica" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2185B] outline-none bg-white"
              >
                <option value="">-- Seleccionar Objetivo --</option>
                {/* Opciones genéricas para cumplir RF-04 sin complicar */}
                <option value="lose_weight">Perder Peso / Definición</option>
                <option value="gain_muscle">Ganar Masa Muscular (Hipertrofia)</option>
                <option value="strength">Ganar Fuerza</option>
                <option value="endurance">Resistencia / Cardio</option>
                <option value="maintenance">Mantenimiento / Salud General</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                * Este dato aparecerá en la ficha técnica del alumno (RF-04).
              </p>
              {errors.goals && <span className="text-red-500 text-xs">{errors.goals.message}</span>}
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all duration-300 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C2185B] hover:bg-[#A0134B] hover:shadow-lg'}`}
          >
            {loading ? 'Procesando...' : 'Registrar Alumno y Activar Plan'}
          </button>

        </form>
      </div>
    </div>
  );
}