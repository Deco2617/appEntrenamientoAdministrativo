import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react'; // Importamos los iconos

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
    // 1. Fondo general gris suave para contraste
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* 2. Tarjeta contenedora con sombra y bordes redondeados */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Decoración superior (línea de color) */}
        <div className="h-2 bg-[#C2185B]"></div>

        <div className="p-8">
          {/* ENCABEZADO */}
          <div className="text-center mb-8">
            {/* Logo Real */}
            <img 
              src="/CM LOGO.png" 
              alt="Logo App" 
              className="w-24 h-24 mx-auto mb-2 object-contain" 
            />
            
            <h1 className="text-2xl font-bold text-[#C2185B]">appEntrenamiento</h1>
            <h2 className="text-lg font-medium text-gray-600 mt-1">¡Bienvenido de nuevo!</h2>
            <p className="text-gray-400 text-sm">Tu compañero de entrenamiento personal.</p>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email con Icono */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input 
                  type="email"
                  {...register("email", { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all text-sm text-gray-700 placeholder-gray-400"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
              {errors.email && <span className="text-red-500 text-xs mt-1 block">El email es requerido</span>}
            </div>

            {/* Password con Icono */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                <a href="#" className="text-xs text-[#C2185B] font-semibold hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input 
                  type="password"
                  {...register("password", { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all text-sm text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {loginError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2">
                <span>⚠️ {loginError}</span>
              </div>
            )}

            {/* Botón Principal */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#C2185B] hover:bg-[#ad1457] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer del login (Opcional) */}
          <p className="text-center mt-8 text-sm text-gray-500">
            ¿No tienes acceso? <span className="text-[#C2185B] font-bold cursor-pointer hover:underline">Contacta a tu entrenador</span>
          </p>
        </div>
      </div>
    </div>
  );
}