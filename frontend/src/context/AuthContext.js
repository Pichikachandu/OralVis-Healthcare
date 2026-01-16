import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, load token and verify
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const patientID = localStorage.getItem('patientID');

    const verifyToken = async () => {
      try {
        if (token) {
          // optimistic UI
          setUser({
            role: role || '',
            name: userName || 'User',
            email: userEmail || '',
            _id: userId || '',
            patientID: patientID || ''
          });
          const response = await api.get('/auth/verify');
          if (response.data?.user) {
            const { name, email, role: freshRole, _id, patientID: freshPID } = response.data.user;
            // update localStorage
            localStorage.setItem('role', freshRole);
            if (name) localStorage.setItem('userName', name);
            if (email) localStorage.setItem('userEmail', email);
            if (_id) localStorage.setItem('userId', _id);
            if (freshPID) localStorage.setItem('patientID', freshPID);
            setUser({
              role: freshRole,
              name: name || userName || 'User',
              email: email || userEmail || '',
              _id: _id || userId || '',
              patientID: freshPID || patientID || ''
            });
          }
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        // clear on failure
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('patientID');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyToken(); else setLoading(false);
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if (data.name) localStorage.setItem('userName', data.name);
      if (data.email) localStorage.setItem('userEmail', data.email);
      if (data._id) localStorage.setItem('userId', data._id);
      if (data.patientID) localStorage.setItem('patientID', data.patientID);
      if (rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      setUser({
        role: data.role,
        name: data.name || '',
        email: data.email || '',
        _id: data._id || '',
        patientID: data.patientID || ''
      });
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.response?.data?.message || 'Invalid credentials' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('patientID');
    setUser(null);
    navigate('/login');
  };

  const value = { user, loading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Export hook separately
