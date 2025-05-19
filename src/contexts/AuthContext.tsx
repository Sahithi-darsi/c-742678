
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  id: '123',
  email: 'user@example.com',
  name: 'Demo User',
  preferences: {
    timeCapsuleMode: false,
    notificationsEnabled: true,
    backgroundAmbience: 'silence',
    highContrastMode: false
  },
  createdAt: new Date().toISOString()
};

// Mock database of registered users
const registeredUsers: Record<string, User> = {
  'user@example.com': mockUser,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage or session
    const checkAuth = async () => {
      try {
        // For demo, we'll simulate checking authentication
        const savedUser = localStorage.getItem('echoverse_user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if the user exists in our mock database
      const registeredUser = registeredUsers[email];
      
      if (!registeredUser) {
        throw new Error("User not registered. Please sign up first.");
      }
      
      // For demo, we'll use the registered user
      setUser(registeredUser);
      
      if (remember) {
        localStorage.setItem('echoverse_user', JSON.stringify(registeredUser));
      } else {
        sessionStorage.setItem('echoverse_user', JSON.stringify(registeredUser));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the user already exists
      if (registeredUsers[email]) {
        throw new Error("User already exists. Please login instead.");
      }
      
      // Create a new user
      const newUser = {
        ...mockUser,
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
        createdAt: new Date().toISOString()
      };
      
      // Add to our mock database
      registeredUsers[email] = newUser;
      
      setUser(newUser);
      localStorage.setItem('echoverse_user', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created."
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('echoverse_user');
    sessionStorage.removeItem('echoverse_user');
  };

  const resetPassword = async (email: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if the user exists
      if (!registeredUsers[email]) {
        throw new Error("Email not found. Please sign up first.");
      }
      
      // Mock implementation for demo purposes
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
