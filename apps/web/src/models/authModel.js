import axios from 'axios';

export const authModel = {
  async login(credentials) {
    const { data } = await axios.post('/api/auth/login', credentials);
    if (data.token) localStorage.setItem('civicai_token', data.token);
    return data.user;
  },
  logout() {
    localStorage.removeItem('civicai_token');
    localStorage.removeItem('civicai_user');
  }
};
