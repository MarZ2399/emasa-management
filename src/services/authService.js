import api from './api';

export const authService = {
  login: async (correo, password) => {
    const { data } = await api.post('/auth/login', { correo, password });
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  }
};
