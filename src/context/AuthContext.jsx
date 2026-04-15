// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { logActivity, EVENTOS } from '../services/activityLogService';

export const AuthContext = createContext();

// ── Normaliza los campos del usuario para uso uniforme en toda la app ──
const normalizeUser = (raw) => ({
  ...raw,
  nombreCompleto: raw.nombre_completo || raw.nombreCompleto || raw.username || 'Usuario',
  email:         raw.correo          || raw.email          || raw.username || '',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  // ✅ Verificar sesión activa al cargar la app
  useEffect(() => {
    const storedUser  = localStorage.getItem('ems_user');
    const storedToken = localStorage.getItem('ems_access');

    if (storedUser && storedToken) {
      try {
        // ← normalizar al leer del localStorage
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('ems_user');
        localStorage.removeItem('ems_access');
      }
    }

    setLoading(false);
  }, []);

  /**
   * Login
   */
  const login = async (correo, password) => {
    try {
      const data = await authService.login(correo, password);

      console.log('🔍 data.user raw:', data.user);

      // ← normalizar antes de guardar
      const normalizedUser = normalizeUser(data.user);

      localStorage.setItem('ems_access', data.accessToken);
      localStorage.setItem('ems_user', JSON.stringify(normalizedUser));

      setUser(normalizedUser);

      await logActivity(EVENTOS.LOGIN);

      // ← usar el campo ya normalizado
      toast.success(`¡Bienvenido, ${normalizedUser.nombreCompleto}!`, {
        duration: 3000,
        icon: '👋',
      });

      console.log('✅ Login exitoso, token guardado');

      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('❌ Error en login:', error);

      let message = 'Error al iniciar sesión';

      if (error.response?.status === 401) {
        message = 'Credenciales incorrectas';
      } else if (error.response?.status === 403) {
        message = 'Usuario sin empresa asignada';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message === 'Network Error') {
        message = 'No se pudo conectar con el servidor';
      }

      toast.error(message, { duration: 4000 });

      return { success: false, message };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await logActivity(EVENTOS.LOGOUT);
      await authService.logout();
      console.log('✅ Logout ejecutado en servidor');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('ems_access');
      localStorage.removeItem('ems_user');
      setUser(null);

      toast.success('Sesión cerrada correctamente', { icon: '👋' });

      navigate('/login');

      console.log('✅ Sesión local limpiada');
    }
  };

  /**
   * Verificar si el usuario está autenticado
   */
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('ems_access');
  };

  /**
   * Obtener token actual
   */
  const getToken = () => {
    return localStorage.getItem('ems_access');
  };

  /**
   * Actualizar datos del usuario sin hacer logout
   */
  const updateUser = (newUserData) => {
    const updatedUser = normalizeUser({ ...user, ...newUserData });
    setUser(updatedUser);
    localStorage.setItem('ems_user', JSON.stringify(updatedUser));
    console.log('✅ Datos de usuario actualizados');
  };

  /**
   * Limpiar sesión (útil cuando el token expira)
   */
  const clearSession = () => {
    localStorage.removeItem('ems_access');
    localStorage.removeItem('ems_user');
    setUser(null);
    navigate('/login');
    toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', {
      duration: 5000,
    });
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    getToken,
    updateUser,
    clearSession,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
