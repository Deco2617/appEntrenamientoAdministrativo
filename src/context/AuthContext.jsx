// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificamos si hay sesión guardada
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        // Restauramos la sesión desde el almacenamiento local
        setUser(JSON.parse(savedUser));
        // Opcional: Aquí podríamos validar contra el backend si el token sigue vivo
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Petición al endpoint de Laravel (Asegúrate de crearlo luego en Laravel)
      const response = await api.post('/auth/login', { email, password });
      
      // Asumimos que Laravel devuelve { token: "...", user: { ... } }
      const { token, user } = response.data; 

      if (!token) throw new Error("No se recibió token");

      // Guardar en el navegador
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Credenciales incorrectas' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Opcional: Llamar al endpoint /logout de Laravel
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);