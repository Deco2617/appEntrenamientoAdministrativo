import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Si tienes tu logo en la carpeta public, úsalo. Si no, usaremos un icono temporal.
import { Dumbbell } from 'lucide-react'; 

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError('');
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setLoginError('Credenciales incorrectas. Intenta de nuevo.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8">
        
        {/* ENCABEZADO: Logo y Títulos */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#C2185B] mb-2">appEntrenamiento</h1>
          
          {/* Aquí iría tu logo real <img src="/logo.png" ... /> */}
          <div className="bg-gradient-to-r from-[#C2185B] to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">G</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900">Bienvenido</h2>
          <p className="text-gray-500 text-sm mt-1">Tu compañero de entrenamiento personal.</p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input 
              type="email"
              {...register("email", { required: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none text-gray-700"
              placeholder="email@ejemplo.com"
            />
            {errors.email && <span className="text-red-500 text-xs">El email es requerido</span>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password"
              {...register("password", { required: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#C2185B] focus:border-[#C2185B] outline-none text-gray-700"
              placeholder="••••••••"
            />
          </div>

          {/* Olvidaste contraseña */}
          <div className="text-right">
            <a href="#" className="text-xs text-[#C2185B] hover:underline font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Mensaje de Error */}
          {loginError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {loginError}
            </div>
          )}

          {/* Botón Principal */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#C2185B] hover:bg-[#ad1457] text-white font-medium py-3 rounded shadow-sm transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </button>

        </form>
      </div>
    </div>
  );
}