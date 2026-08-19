import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // INITIAL STATE langsung baca dari localStorage
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.name === "Admin TBI") {
          user.name = "Admin LSP";
          localStorage.setItem("user", JSON.stringify(user));
        }
        return { token, user };
      } catch (e) {
        console.error("Failed to parse user", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_role");
        return { token: null, user: null };
      }
    }

    if (token || userJson) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth_role");
    }

    return { token: null, user: null };
  });

  // Verifikasi keaktifan token ke backend /me saat pertama kali dipasang
  useEffect(() => {
    if (auth.token) {
      axiosClient
        .get("/me")
        .then((res) => {
          if (res.data?.user) {
            const updatedUser = res.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setAuth((prev) => ({ ...prev, user: updatedUser }));
          }
        })
        .catch(() => {
          // Token tidak valid di backend -> logout paksa
          logout();
        });
    }
  }, []);

  const login = ({ token, user }) => {
    setAuth({ token, user });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    if (user?.role_slug) {
      localStorage.setItem("auth_role", user.role_slug);
    } else if (user?.role) {
      localStorage.setItem("auth_role", user.role);
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_role");

    axiosClient.post("/logout").catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
