import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    app_name: "Pro. AI Powered Certification Doc. Screening [P3SM]",
    app_email: "admin@p3sm.com",
    app_footer: "P3SM AI System 2026",
  });
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get("/settings");
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil pengaturan sistem:", error);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update document title dynamically whenever settings change
  useEffect(() => {
    if (settings.app_name) {
      document.title = settings.app_name;
    }
  }, [settings.app_name]);

  return (
    <SettingsContext.Provider value={{ settings, isSettingsLoading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
