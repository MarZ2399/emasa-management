// src/services/authService.js
import api from './api';

export const authService = {
  /**
   * Login - Autenticar usuario
   * @param {string} correo - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} { success, accessToken, user }
   */
  login: async (correo, password) => {
    const { data } = await api.post('/auth/login', { correo, password });
    return data;
  },

  /**
   * Logout - Cerrar sesión
   * Limpia el refresh token en el servidor (cookie)
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * Refresh Token - Renovar access token
   * Se llama automáticamente desde api.js cuando el token expira
   * @returns {Promise<Object>} { success, accessToken }
   */
  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },

  /**
   * Forgot Password - Solicitar recuperación de contraseña
   * @param {string} correo - Email del usuario
   * @returns {Promise<Object>} { success, message }
   */
  forgotPassword: async (correo) => {
    const { data } = await api.post('/auth/forgot-password', { correo });
    return data;
  },

  /**
   * Reset Password - Cambiar contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} { success, message }
   */
  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return data;
  },

  /**
   * Verify Reset Token - Verificar si un token es válido
   * @param {string} token - Token a verificar
   * @returns {Promise<Object>} { valid, message }
   */
  verifyResetToken: async (token) => {
    const { data } = await api.get(`/auth/verify-reset-token/${token}`);
    return data;
  }
};
