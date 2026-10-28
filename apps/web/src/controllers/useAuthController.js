import { useState } from 'react';
import { authModel } from '../models/authModel.js';

export function useAuthController() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('civicai_user')) || { name: 'Public Citizen', role: 'Citizen' };
    } catch { return { name: 'Public Citizen', role: 'Citizen' }; }
  });
  const login = user => {
    setCurrentUser(user);
    localStorage.setItem('civicai_user', JSON.stringify(user));
  };
  const logout = () => {
    authModel.logout();
    setCurrentUser({ name: 'Public Citizen', role: 'Citizen' });
  };
  return { currentUser, login, logout };
}
