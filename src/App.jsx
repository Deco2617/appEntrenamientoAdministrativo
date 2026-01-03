// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // <--- IMPORTANTE
import Clients from './pages/Clients';
import AddStudent from './pages/AddStudent';
import Plans from './pages/Plans';
import Rutinas from './pages/Rutinas';
import Exercises from './pages/Exercises';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Ruta del Dashboard protegida */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard /> {/* <--- AQUÍ SE MUESTRA TU NUEVA INTERFAZ */}
            </ProtectedRoute>
          } />
          {/* --- RUTA DE CLIENTES --- */}
          <Route path="/clientes" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          {/* ----------------------------- */}
          {/* 2. ASEGURA QUE ESTA RUTA EXISTA Y SEA EXACTA: */}
          <Route path="/clientes/nuevo" element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          } />
          <Route path="/planes" element={
            <ProtectedRoute> {/* O como llames a tu protección de rutas */}
              <Plans />
            </ProtectedRoute>
          } />
          {/* <--- 2. AÑADE LA NUEVA RUTA PARA RUTINAS */}
          <Route path="/rutinas" element={
            <ProtectedRoute>
              <Rutinas />
            </ProtectedRoute>
          } />
          <Route path="/ejercicios" element={
            <ProtectedRoute>
              <Exercises />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;