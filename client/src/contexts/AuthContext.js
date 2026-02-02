import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user data
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Request OTP
  const requestOTP = async (phoneNumber, language = 'ar') => {
    const res = await axios.post('/api/auth/phone/request-otp', {
      phoneNumber,
      language
    });
    return res.data;
  };

  // Verify OTP and login
  const verifyOTP = async (phoneNumber, otp, language = 'ar') => {
    const res = await axios.post('/api/auth/phone/verify-otp', {
      phoneNumber,
      otp,
      language
    });
    
    const { token: newToken, user: userData } = res.data;
    
    // Save token
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user profile
  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(res.data.user);
    return res.data;
  };

  const value = {
    user,
    loading,
    token,
    isAuthenticated: !!user,
    requestOTP,
    verifyOTP,
    logout,
    updateProfile,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
