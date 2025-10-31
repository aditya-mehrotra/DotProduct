"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
} from "../types";
import { apiClient } from "../lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get("/auth/user/");
        setUser(response.data);
      } catch (error) {
        // User not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Login request
      const loginResponse = await apiClient.post("/auth/login/", credentials);

      // Get user data
      const userResponse = await apiClient.get("/auth/user/");
      setUser(userResponse.data);

      // Store session cookie (handled by Django)
      Cookies.set("sessionid", loginResponse.data.sessionid, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      Cookies.set("csrftoken2", loginResponse.data.csrf_token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);

      // Register request
      await apiClient.post("/auth/register/", credentials);

      // Auto-login after registration
      await login({
        username: credentials.username,
        password: credentials.password,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout/");
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      Cookies.remove("sessionid");
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
