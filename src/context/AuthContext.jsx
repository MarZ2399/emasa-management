// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Verificar sesión activa al cargar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('ems_user');
    const storedToken = localStorage.getItem('ems_access');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        // Si hay error, limpiar datos corruptos
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

      // ✅ Guardar token y datos del usuario
      localStorage.setItem('ems_access', data.accessToken);
      localStorage.setItem('ems_user', JSON.stringify(data.user));

      // Actualizar estado
      setUser(data.user);

      // Notificación de éxito
      toast.success(`¡Bienvenido, ${data.user.nombre_completo}!`, {
        duration: 3000,
        icon: '👋',
      });

      console.log('✅ Login exitoso, token guardado');

      return { success: true };
    } catch (error) {
      console.error('❌ Error en login:', error);

      // Manejo de errores específicos
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

      toast.error(message, {
        duration: 4000,
      });

      return { success: false, message };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      // Llamar al endpoint de logout (limpia refresh token en cookie)
      await authService.logout();
      
      console.log('✅ Logout ejecutado en servidor');
    } catch (error) {
      console.error('Error en logout:', error);
      // No mostrar error al usuario, solo limpiar sesión local
    } finally {
      // ✅ Limpiar localStorage y estado
      localStorage.removeItem('ems_access');
      localStorage.removeItem('ems_user');
      setUser(null);

      // Notificación
      toast.success('Sesión cerrada correctamente', {
        icon: '👋',
      });

      // Redirigir al login
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
    const updatedUser = { ...user, ...newUserData };
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
