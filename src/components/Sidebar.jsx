import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

/* ─── CSS injected as <style> ────────────────────────────── */
const SIDEBAR_CSS = `
  /* ── Sidebar shell ───────────────────────── */
  .app-sidenav {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 260px;
    background-color: #ffffff;
    border-right: 1px solid #eef0f3;
    display: flex;
    flex-direction: column;
    z-index: 1100;
    overflow: hidden;
    transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Mobile: sembunyikan sidebar by default ── */
  @media (max-width: 991px) {
    .app-sidenav {
      width: 260px !important;
      transform: translateX(-100%);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    html.sidebar-enable .app-sidenav {
      transform: translateX(0);
    }
  }

  /* ── Logo area ───────────────────────────── */
  .app-sidenav .sidenav-logo {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-bottom: 1px solid #f3f4f6;
    overflow: hidden;
    min-height: 90px;
  }
  .app-sidenav .sidenav-logo a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  .app-sidenav .sidenav-logo img {
    width: 100%;
    max-width: 228px;
    height: auto;
    max-height: 80px;
    object-fit: contain;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  /* logo icon kecil saat collapsed */
  .app-sidenav .sidenav-logo-sm {
    height: 38px;
    width: auto;
    max-width: 44px;
    object-fit: contain;
    margin: auto;
    display: block;
    transition: opacity 0.2s;
  }

  /* ── Scrollable menu area ────────────────── */
  .app-sidenav .sidenav-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0 0 0;
    scrollbar-width: thin;
    scrollbar-color: #e0e0e0 transparent;
  }
  .app-sidenav .sidenav-scroll::-webkit-scrollbar { width: 4px; }
  .app-sidenav .sidenav-scroll::-webkit-scrollbar-thumb { background: #dde2e8; border-radius: 4px; }

  /* ── Section title ───────────────────────── */
  .app-sidenav .nav-section-title {
    font-size: 10.5px;
    font-weight: 700;
    color: #9aabbd;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    padding: 20px 24px 6px 24px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    transition: opacity 0.2s, padding 0.2s;
  }
  /* divider pengganti title saat collapsed */
  .app-sidenav .nav-section-divider {
    height: 1px;
    background: #eef0f3;
    margin: 12px 12px 6px 12px;
  }

  /* ── Nav items ───────────────────────────── */
  .app-sidenav .nav-list {
    list-style: none;
    margin: 0;
    padding: 0 12px;
  }
  .app-sidenav .nav-list li { margin: 2px 0; }

  /* ── Jarak vertikal antar icon saat collapsed ── */
  @media (min-width: 992px) {
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-list li {
      margin: 2px 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .app-sidenav .nav-link-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    text-decoration: none;
    color: #1b2f6b;
    font-size: 13.5px;
    font-weight: 600;
    transition: background 0.18s;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
  }
  .app-sidenav .nav-link-item:hover {
    background-color: #f5f6fb;
    color: #1b2f6b;
    text-decoration: none;
  }
  .app-sidenav .nav-link-item.active {
    background: linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(29,78,216,0.22);
  }
  .app-sidenav .nav-link-item .nav-icon {
    font-size: 19px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .app-sidenav .nav-link-item.active .nav-icon,
  .app-sidenav .nav-link-item.active { color: #ffffff; }

  .app-sidenav .nav-link-item .nav-label {
    flex: 1;
    transition: opacity 0.2s;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .app-sidenav .badge-ai {
    margin-left: auto;
    background-color: #dcfce7;
    color: #16a34a;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }

  /* ── Collapsed: icon-only mode (DESKTOP ONLY) ── */
  @media (min-width: 992px) {
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-section-title {
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      height: 0;
      overflow: hidden;
    }

    /* Reset padding list — icon center di sidebar 68px */
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-list {
      padding: 0;
    }

    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-link-item {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      padding: 0;
      margin: 0 auto;
      gap: 0;
      border-radius: 10px;
      overflow: visible;
    }

    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-link-item .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 20px;
    }

    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-link-item.active {
      background: linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%);
      box-shadow: 0 4px 14px rgba(29,78,216,0.30);
    }

    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-label {
      display: none;
    }
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .badge-ai {
      display: none;
    }
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .help-card {
      padding: 0;
      margin: 12px auto 18px auto;
      width: 44px;
      height: 44px;
      justify-content: center;
      align-items: center;
      gap: 0;
      border-radius: 10px;
    }
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .help-text,
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .help-arrow {
      display: none;
    }

    /* ── Tooltip hanya tampil saat collapsed tanpa hover ── */
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-link-item::after {
      content: attr(data-label);
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      background: #1b2f6b;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 6px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
      z-index: 9999;
    }
    html.sidebar-collapsed .app-sidenav:not(.sidebar-hovered) .nav-link-item:hover::after {
      opacity: 1;
    }

    /* ── Hover-to-peek: expand sidebar sementara saat dikursor ── */
    html.sidebar-collapsed .app-sidenav.sidebar-hovered {
      width: 260px;
      box-shadow: 6px 0 24px rgba(0,0,0,0.12);
      z-index: 1200;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-list {
      padding: 0 12px;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-list li {
      margin: 2px 0;
      display: block;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-link-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      height: auto;
      padding: 10px 14px;
      margin: 0;
      gap: 12px;
      border-radius: 10px;
      overflow: hidden;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-link-item .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: auto;
      height: auto;
      font-size: 19px;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-link-item.active {
      background: linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%);
      box-shadow: 0 4px 12px rgba(29,78,216,0.22);
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-label {
      display: block;
      flex: 1;
      opacity: 1;
      width: auto;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .badge-ai {
      display: inline-block;
      opacity: 1;
      width: auto;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-section-title {
      opacity: 1;
      height: auto;
      padding: 20px 24px 6px 24px;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .help-card {
      margin: 12px 16px 18px 16px;
      padding: 14px 16px;
      width: auto;
      height: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 12px;
    }
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .help-text,
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .help-arrow {
      display: block;
    }
    /* Sembunyikan tooltip saat peek terbuka (label sudah tampil) */
    html.sidebar-collapsed .app-sidenav.sidebar-hovered .nav-link-item::after {
      display: none;
    }
  }

  /* ── Help card ───────────────────────────── */
  .app-sidenav .help-card {
    margin: 12px 16px 18px 16px;
    padding: 14px 16px;
    border: 1px solid #eef0f3;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    overflow: hidden;
    transition: padding 0.2s, margin 0.2s;
  }
  .app-sidenav .help-icon {
    width: 36px; height: 36px; border-radius: 50%;
    background-color: #1b2f6b;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .app-sidenav .help-text { flex: 1; transition: opacity 0.2s; }
  .app-sidenav .help-text strong { display: block; font-size: 13px; font-weight: 700; color: #1b2f6b; }
  .app-sidenav .help-text span { font-size: 11.5px; color: #3b82f6; font-weight: 600; }
  .app-sidenav .help-arrow { color: #9aabbd; font-size: 16px; transition: opacity 0.2s; }
`;

const MENU_DATA = [
  { type: "title", label: "MAIN MENU" },
  { type: "item", label: "Dashboard",         icon: "ti ti-home",          to: "/dashboard" },
  { type: "item", label: "Data Project",       icon: "ti ti-archive",         to: "/project" },
  { type: "item", label: "Data Peserta",       icon: "ti ti-users",         to: "/data-peserta" },
  { type: "item", label: "Dokumen",            icon: "ti ti-file-description", to: "/dokumen" },
  { type: "item", label: "Screening OCR",      icon: "ti ti-scan",          to: "/screening-ocr", badge: "AI" },
  { type: "item", label: "Validasi AI",        icon: "ti ti-cpu",           to: "/validasi-ai" },
  { type: "item", label: "Hasil Validasi",     icon: "ti ti-file-check",    to: "/hasil-validasi" },
  { type: "item", label: "Rekomendasi",        icon: "ti ti-thumb-up",      to: "/rekomendasi" },
  { type: "item", label: "Monitoring Proses",  icon: "ti ti-activity",      to: "/monitoring-proses" },

  { type: "title", label: "LAPORAN & ANALYTICS" },
  { type: "item", label: "Laporan & Analytic", icon: "ti ti-chart-bar",     to: "/laporan/analytics" },
  { type: "item", label: "Export Data",        icon: "ti ti-file-export",   to: "/export-data" },
  { type: "item", label: "Penggunaan Token",   icon: "ti ti-coins",         to: "/penggunaan-token" },

  { type: "title", label: "MASTER DATA" },
  { type: "item", label: "Skema Sertifikasi",  icon: "ti ti-certificate",   to: "/skema-sertifikasi" },
  { type: "item", label: "Aturan Validasi",    icon: "ti ti-settings-2",    to: "/aturan-validasi" },
  { type: "item", label: "User & Role",        icon: "ti ti-user-check",    to: "/user-role" },
  { type: "item", label: "Pengaturan Sistem",  icon: "ti ti-adjustments",   to: "/pengaturan-sistem" },
];

const Sidebar = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const styleRef = useRef(null);

  // Deteksi mobile agar tidak pernah tampil icon-only di mobile
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 991);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 991);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Collapsed hanya berlaku di desktop
  const isCollapsed = collapsed && !isMobile;

  // Hover-to-peek: saat hover di collapsed sidebar, expand sementara
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => { if (isCollapsed) setIsHovered(true); };
  const handleMouseLeave = () => setIsHovered(false);

  // Tampilkan full sidebar jika: tidak collapsed, atau sedang di-hover
  const showFull = !isCollapsed || isHovered;

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = SIDEBAR_CSS;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => { if (styleRef.current) document.head.removeChild(styleRef.current); };
  }, []);

  const isActive = (path) =>
    location.pathname === path || (path === "/dashboard" && (location.pathname === "/" || location.pathname === "/home"));

  return (
    <aside
      className={`app-sidenav${isHovered && isCollapsed ? " sidebar-hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div className="sidenav-logo">
        {isCollapsed && !isHovered ? (
          <Link to="/">
            <img src="/assets/images/logo-sm.png" alt="P3SM Logo" className="sidenav-logo-sm" />
          </Link>
        ) : (
          <Link to="/">
            <img src="/assets/images/logo.png" alt="P3SM Logo" />
          </Link>
        )}
      </div>

      {/* Menu */}
      <div className="sidenav-scroll">
        {MENU_DATA.map((item, idx) => {
          if (item.type === "title") {
            return !showFull
              ? <div key={idx} className="nav-section-divider" />
              : <p key={idx} className="nav-section-title">{item.label}</p>;
          }
          return (
            <ul key={idx} className="nav-list" style={{ paddingBottom: 0, paddingTop: 0 }}>
              <li>
                <Link
                  to={item.to}
                  className={`nav-link-item${isActive(item.to) ? " active" : ""}`}
                  data-label={item.label}
                  title={isCollapsed && !isHovered ? item.label : undefined}
                >
                  <span className="nav-icon"><i className={item.icon} /></span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="badge-ai">{item.badge}</span>}
                </Link>
              </li>
            </ul>
          );
        })}
      </div>

      {/* Help card */}
      <div className="help-card">
        <div className="help-icon">
          <i className="ti ti-help" />
        </div>
        <div className="help-text">
          <strong>Butuh Bantuan?</strong>
          <span>Panduan &amp; Support</span>
        </div>
        <i className="ti ti-chevron-right help-arrow" />
      </div>
    </aside>
  );
};

export default Sidebar;
