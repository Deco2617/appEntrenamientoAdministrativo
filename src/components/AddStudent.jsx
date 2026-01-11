import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Eye, EyeOff, UserPlus, ChevronDown } from 'lucide-react';
import api from '../services/api';

export default function AddStudentModal({ isOpen, onClose, onSuccess }) {
  // 1. IMPORTANTE: Extraer 'setValue' para que handleNameChange funcione
  const { register, handleSubmit, formState: { errors }, reset, setValue, clearErrors } = useForm();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- BLOQUEOS FÍSICOS ---

  // Bloquea teclas inválidas en inputs numéricos (Peso, Altura, Teléfono)
  const blockInvalidNumberChars = (e) => {
    if (['e', 'E', '-', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };
  const blockNonNumericalChars = (e) => {
    const controlKeys = [
      'Backspace', 'Tab', 'Enter', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete'
    ]
    // 2. Si la tecla presionada está en la lista de control, permitirla
    if (controlKeys.includes(e.key)) {
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }
  const blockInvalidNumberCharsPoint = (e) => {
    if (['e', 'E', '-', '+', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };
  const blockSpace = (e) => {
    if ([' '].includes(e.key)) {
      e.preventDefault()
    }
  };
  // Validación de edad mínima (15 años)
  const validateAge = (value) => {
    const today = new Date();
    const birthDate = new Date(value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 15 || "El alumno debe tener al menos 15 años";
  };

  // Limpia nombres/apellidos en tiempo real (solo letras y tildes)
  const handleNameChange = (e, field) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setValue(field, value); // Ahora sí funcionará porque extrajimos setValue
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      const fetchPlans = async () => {
        try {
          const response = await api.get('/plans');
          const data = response.data.data || response.data;
          const activePlans = Array.isArray(data)
            ? data.filter(plan => plan.is_active === 1 || plan.is_active === true)
            : [];
          setPlans(activePlans);
        } catch (error) {
          setServerError("No se pudieron cargar los planes vigentes.");
        }
      };
      fetchPlans();
      window.addEventListener('keydown', handleKeyDown);
    } else {
      // ESTO ES LO NUEVO: Se ejecuta cuando el modal se cierra
      reset(); // Limpia los valores de los inputs
      clearErrors(); // Elimina todos los mensajes de error rojos (como "Campo obligatorio")
      setServerError(null); // Limpia errores del servidor si los hubiera
    }
    // 4. Limpieza del evento para evitar fugas de memoria
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      const payload = { ...data, role: 'client' };
      await api.post('/auth/register', payload);
      reset();
      alert(`¡Alumno registrado con éxito!\n\nSe han enviado las credenciales de acceso a: ${data.email}`);
      onSuccess();
      onClose();
    } catch (error) {
      setServerError(error.response?.data?.message || "Error al registrar alumno");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 my-auto">

        {/* Cabecera Uniforme */}
        <div className="px-8 py-5 bg-[#C2185B] flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Registrar Nuevo Alumno</h2>
              <p className="text-pink-100 text-xs font-medium uppercase tracking-wider">Ficha Técnica y Suscripción</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-5">

            {/* Nombre */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre</label>
              <input
                {...register("first_name", {
                  required: "Requerido",
                  maxLength: { value: 30, message: "La cantidad de caracteres permitida es 40." },
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "Solo letras" }
                })}
                maxLength={30}
                onChange={(e) => handleNameChange(e, 'first_name')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm"
                placeholder="Ej. Juan"

              />
              {errors.first_name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.first_name.message}</p>}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Apellido</label>
              <input
                {...register("last_name", {
                  required: "Requerido",
                  maxLength: { value: 30, message: "La cantidad permitida de caracteres es de 40." },
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "Solo letras" }
                })}
                maxLength={30}
                onChange={(e) => handleNameChange(e, 'last_name')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm"
                placeholder="Ej. Pérez"
              />
              {errors.last_name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.last_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
              <input
                onKeyDown={blockSpace}
                type="email"
                {...register("email", {
                  required: "Correo obligatorio",
                  maxLength: { value: 40, message: "La cantidad permitida de caracteres es de 40." }
                })}
                maxLength={40}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm"
                placeholder="tucorreo@email.com" />
              {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            {/* Teléfono: Bloqueo de puntos y signos */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Teléfono
              </label>
              <input
                type="text"
                onKeyDown={blockNonNumericalChars}
                onInput={(e) => {
                  if (e.target.value.length > 9) {
                    e.target.value = e.target.value.slice(0, 9);
                  }
                }}
                {...register("phone_number", {
                  required: "El teléfono es obligatorio",
                  minLength: { value: 9, message: "Debe tener exactamente 9 dígitos" },
                  maxLength: { value: 9, message: "Debe tener exactamente 9 dígitos" }
                })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm"
                placeholder="999888777"
              />
              {errors.phone_number && (
                <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.phone_number.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="w-full">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña</label>

              {/* 1. WRAPPER RELATIVO: Solo Input + Botón */}
              <div className="relative">
                <input
                  onKeyDown={blockSpace}
                  type={showPassword ? 'text' : 'password'}
                  {...register("password", {
                    required: "Contraseña obligatoria"
                  })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm"
                  placeholder="••••••"
                />

                {/* ¡AQUÍ BORRÉ EL ERROR QUE SOBRABA! */}

                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 2. ERROR: Aquí afuera es donde debe estar */}
              {errors.password && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Fecha Nacimiento */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha de Nacimiento</label>
              <input type="date" {
                ...register("birth_date", {
                  required: "Campo obligatorio",
                  validate: validateAge
                })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm" />
              {errors.birth_date && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{errors.birth_date.message}</p>}

            </div>

            {/* Género */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1">Género</label>
              <select
                {...register("gender",
                  {
                    required: "Campo obligatorio",
                  })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] appearance-none text-sm font-medium text-gray-700">
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              {errors.gender && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{errors.gender.message}</p>}

            </div>

            {/* Peso y Altura */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  onKeyDown={blockInvalidNumberChars}
                  placeholder="00.00"
                  // --- LÓGICA DE VALIDACIÓN VISUAL ---
                  onInput={(e) => {
                    const value = e.target.value;

                    // Si el usuario escribe un punto...
                    if (value.includes('.')) {
                      const parts = value.split('.'); // Separamos en [enteros, decimales]

                      // 1. Validar Enteros (índice 0): Máximo 3 caracteres
                      if (parts[0].length > 3) {
                        parts[0] = parts[0].slice(0, 3);
                      }

                      // 2. Validar Decimales (índice 1): Máximo 2 caracteres
                      if (parts[1].length > 2) {
                        parts[1] = parts[1].slice(0, 2);
                      }

                      // Reconstruimos el valor
                      e.target.value = parts.join('.');

                    } else {
                      // Si NO hay punto, solo validamos que los enteros no pasen de 3
                      if (value.length > 3) {
                        e.target.value = value.slice(0, 3);
                      }
                    }
                  }}

                  {...register("weight", {
                    required: "Requerido",
                    min: { value: 40.0, message: "El peso mínimo para registrar es de 40.0 Kg" },
                    max: { value: 150, message: "El peso máximo para registrar es de 150.0 Kg" },
                    // Agregamos un patrón Regex como seguridad extra para el formulario
                    pattern: {
                      value: /^\d{1,3}(\.\d{1,2})?$/,
                      message: "Formato inválido (Ej: 123.45)"
                    }
                  })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm text-center"
                />
                {errors.weight && <p className="text-[10px] text-red-500 mt-1">{errors.weight.message}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Altura (cm)</label>
                <input
                  type="number"
                  onKeyDown={blockInvalidNumberCharsPoint}
                  placeholder="000"
                  // 2. NUEVO: Limitamos a 5 caracteres (ej: 120.5) dinámicamente
                  onInput={(e) => {
                    if (e.target.value.length > 3) e.target.value = e.target.value.slice(0, 3);
                  }}
                  {...register("height", {
                    required: "Requerido",
                    min: { value: 140, message: "La altura mínima para registrar es de 140 cm" },
                    max: { value: 210, message: "La altura máxima para registrar es de 210 cm" },

                  })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] text-sm text-center"
                />
                {errors.height && <p className="text-[10px] text-red-500 mt-1">{errors.height.message}</p>}
              </div>
            </div>

            {/* Plan de Suscripción */}
            <div className="md:col-span-2 border-t border-gray-100 pt-4">
              <label
                className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1">Asignar Plan de Suscripción</label>
              <div
                className="relative">
                <select {
                  ...register("plan_id", {
                    required: "Selecciona el plan de suscripción."
                  })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] appearance-none text-sm font-medium text-gray-700">
                  <option value="">Selecciona un Plan Vigente</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — S/. {plan.price} ({plan.duration_days} días)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
              {/* Mensaje de error para el Plan */}
              {errors.plan_id && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{errors.plan_id.message}</p>
              )}
            </div>

            {/* Objetivo */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1">Objetivo Principal</label>
              <div className="relative">
                <select {...register("goals", {
                  required: "Selecciona el objetivo del entrenamiento."
                })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C2185B] appearance-none text-sm font-medium text-gray-700">
                  <option value="Perder Peso">Perder Peso</option>
                  <option value="Ganar Masa Muscular">Ganar Masa Muscular</option>
                  <option value="Aumentar Fuerza">Aumentar Fuerza</option>
                  <option value="Resistencia / Cardio">Resistencia / Cardio</option>
                  <option value="Mantenimiento/Salud General">Mantenimiento/Salud General</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />

              </div>
              {errors.goals && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{errors.goals.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-240 bg-gray-50">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${loading ? 'bg-gray-300' : 'bg-[#C2185B] hover:bg-[#ad1457] shadow-pink-200'
              }`}
          >
            {loading ? 'Procesando registro...' : 'Registrar Alumno y Activar Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}