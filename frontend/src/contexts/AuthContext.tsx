import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  contact: string;  // Changed from email to contact
  role: 'admin' | 'patient';
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: string;
  contact: string;  // Changed from email to contact
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (contact: string, password: string, role: 'admin' | 'patient') => Promise<void>;
  signup: (userData: PatientSignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface PatientSignupData {
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  contact: string;  // Either email or phone number
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (contact: string, password: string, role: 'admin' | 'patient') => {
    try {
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/patient/login';
      const requestBody = role === 'admin' 
        ? { email: contact, password } 
        : { contact, password };
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Get user info
      const userResponse = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData: User = await userResponse.json();
        
        setToken(data.access_token);
        setUser(userData);
        
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData: PatientSignupData) => {
    try {
      const response = await fetch('http://localhost:8000/auth/patient/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
      }

      // Auto-login after successful signup
      await login(userData.contact, userData.password, 'patient');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 