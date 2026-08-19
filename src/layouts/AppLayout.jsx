import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useSettings } from "../context/SettingsContext";

const LAYOUT_CSS = `
  /* ── Reset & base ─────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    background-color: #f5f6fa;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }

  /* ── Sidebar fixed, lebar default 260px ────── */
  .app-sidenav {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 260px;
    z-index: 1100;
    transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Main content: pushed right by sidebar ── */
  .main-content {
    margin-left: 260px;
    padding-top: 64px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f6fa;
    transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  .main-content-inner {
    flex: 1;
    padding: 24px 28px;
  }

  /* ── Footer ───────────────────────────────── */
  .app-footer {
    background-color: #ffffff;
    border-top: 1px solid #eef0f3;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .app-footer p {
    margin: 0;
    font-size: 12px;
    color: #9aabbd;
    font-weight: 500;
  }
  .app-footer .version {
    font-size: 12px;
    color: #9aabbd;
    font-weight: 600;
  }

  /* ── Header base ────────────────────────────── */
  .app-header {
    left: 260px;
    transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Collapsed mode: DESKTOP ONLY ───────────── */
  @media (min-width: 992px) {
    html.sidebar-collapsed .app-sidenav {
      width: 68px;
    }
    html.sidebar-collapsed .main-content {
      margin-left: 68px;
    }
    html.sidebar-collapsed .app-header {
      left: 68px;
    }
  }

  /* ── Mobile responsive ────────────────────── */
  @media (max-width: 991px) {
    .app-sidenav {
      width: 260px !important;
      transform: translateX(-100%);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    html.sidebar-enable .app-sidenav {
      transform: translateX(0);
    }
    .main-content {
      margin-left: 0 !important;
    }
    .app-header {
      left: 0 !important;
    }
  }

  /* ── Flatpickr custom theme ─────────────────── */
  .flatpickr-calendar {
    border-radius: 10px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid #eef0f3 !important;
    font-family: inherit !important;
  }
  .flatpickr-day.selected,
  .flatpickr-day.selected:hover,
  .flatpickr-day.selected:focus {
    background: #1b2f6b !important;
    border-color: #1b2f6b !important;
  }
  .flatpickr-day:hover {
    background: #f1f5f9 !important;
  }
`;

/* Inner layout — bisa akses useSidebar karena sudah di dalam Provider */
const LayoutInner = () => {
  const { collapsed } = useSidebar();
  const { settings } = useSettings();

  // Sync class ke <html> supaya CSS global bisa bereaksi
  React.useEffect(() => {
    const html = document.documentElement;
    if (collapsed) {
      html.classList.add("sidebar-collapsed");
    } else {
      html.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  return (
    <>
      <style>{LAYOUT_CSS}</style>

      {/* Sidebar — fixed position */}
      <Sidebar />

      {/* Header — fixed position */}
      <Header />

      {/* Scrollable main area */}
      <div className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>© 2026 P3SM - AI Document Validation System. All rights reserved.</p>
          <span className="version">Versi 2.6.0</span>
        </footer>
      </div>
    </>
  );
};

const AppLayout = () => (
  <SidebarProvider>
    <LayoutInner />
  </SidebarProvider>
);

export default AppLayout;
