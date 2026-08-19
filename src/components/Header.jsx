import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { Dropdown } from "react-bootstrap";

const Header = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleCollapsed } = useSidebar();
  const isMobileOpen = useRef(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate("/login");
  };

  const handleProfile = (e) => {
    e.preventDefault();
    const psikologId = auth.user?.psikolog_id || 0;
    navigate("/psikolog/edit/" + psikologId);
  };

  const handleSidebarToggle = () => {
    const isMobile = window.innerWidth <= 991;

    if (isMobile) {
      // ── Mobile: slide in/out dengan backdrop ──
      const html = document.documentElement;
      const body = document.body;
      if (!isMobileOpen.current) {
        html.classList.add("sidebar-enable");
        const backdrop = document.createElement("div");
        backdrop.className = "offcanvas-backdrop fade show";
        backdrop.id = "sidebar-backdrop";
        backdrop.onclick = handleSidebarToggle;
        body.appendChild(backdrop);
        isMobileOpen.current = true;
      } else {
        html.classList.remove("sidebar-enable");
        const bd = document.getElementById("sidebar-backdrop");
        if (bd) bd.remove();
        isMobileOpen.current = false;
      }
    } else {
      // ── Desktop: collapse/expand via context ──
      toggleCollapsed();
    }
  };

  const userName = auth.user?.name || "Admin LSP";
  const userRole = auth.user?.role || "Super Admin";

  const getPageMeta = (pathname) => {
    switch (pathname) {
      case "/":
      case "/home":
      case "/dashboard":
        return {
          title: "Dashboard",
          sub: "Ringkasan aktivitas sistem P3SM",
        };
      case "/data-peserta":
        return { title: "Data Peserta", sub: "Manajemen data peserta" };
      case "/dokumen":
        return { title: "Dokumen", sub: "Manajemen dokumen" };
      case "/screening-ocr":
        return {
          title: "Screening OCR",
          sub: "Screening dokumen menggunakan AI OCR",
        };
      case "/validasi-ai":
        return { title: "Validasi AI", sub: "Proses validasi menggunakan AI" };
      case "/hasil-validasi":
        return {
          title: "Hasil Validasi",
          sub: "Laporan hasil validasi dokumen",
        };
      case "/rekomendasi":
        return { title: "Rekomendasi", sub: "Rekomendasi dari sistem AI" };
      case "/monitoring-proses":
        return {
          title: "Monitoring Proses",
          sub: "Pemantauan proses validasi berjalan",
        };
      case "/laporan":
        return { title: "Laporan", sub: "Laporan umum sistem" };
      case "/analytics":
        return { title: "Analytics", sub: "Analitik dan statistik data" };
      case "/export-data":
        return { title: "Export Data", sub: "Export data ke Excel/PDF" };
      case "/skema-sertifikasi":
        return {
          title: "Skema Sertifikasi",
          sub: "Manajemen skema sertifikasi",
        };
      case "/aturan-validasi":
        return { title: "Aturan Validasi", sub: "Aturan validasi sistem AI" };
      case "/user-role":
        return {
          title: "User & Role",
          sub: "Manajemen pengguna dan hak akses",
        };
      case "/pengaturan-sistem":
        return { title: "Pengaturan Sistem", sub: "Pengaturan sistem website" };
      default:
        if (pathname.startsWith("/psikolog/edit/")) {
          return {
            title: "Edit Profil Psikolog",
            sub: "Manajemen profil psikolog",
          };
        }
        return {
          title: "Dashboard Overview",
          sub: (
            <>
              Selamat datang, {userName}
              <span className="green-dot" />
            </>
          ),
        };
    }
  };

  const pageMeta = getPageMeta(location.pathname);

  return (
    <>
      <style>{`
        .app-header {
          position: fixed;
          top: 0;
          /* starts right after the 260px sidebar */
          left: 260px;
          right: 0;
          height: 64px;
          z-index: 999;
          background: #ffffff;
          border-bottom: 1px solid #eef0f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        /* hamburger btn */
        .topbar-menu-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #f5f6fa !important;
          border: 1px solid #eef0f3 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          color: #1b2f6b !important;
          flex-shrink: 0;
          transition: background 0.15s;
          position: static !important;   /* override any fixed/absolute from template */
          top: auto !important;
          left: auto !important;
          box-shadow: none !important;
          padding: 0 !important;
          z-index: auto !important;
        }
        .topbar-menu-btn:hover { background: #edf0f7 !important; }
        .topbar-menu-btn i { font-size: 20px; }

        /* title */
        .topbar-title h1 {
          font-weight: 700;
          font-size: 17px;
          color: #1b2f6b;
          margin: 0;
          line-height: 1.2;
        }
        .topbar-title .sub {
          font-size: 12px;
          color: #8898aa;
          font-weight: 500;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .topbar-title .green-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
        }

        /* right items */
        .topbar-right { display: flex; align-items: center; gap: 20px; }

        .bell-wrap {
          position: relative;
          cursor: pointer;
          color: #1b2f6b;
          display: flex;
          align-items: center;
        }
        .bell-wrap i { font-size: 22px; }
        .bell-badge {
          position: absolute;
          top: -6px; right: -8px;
          background: #ef4444;
          color: #fff;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border: 2px solid #fff;
          line-height: 1.4;
        }

        .profile-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .profile-wrap img {
          width: 36px; height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #eef0f3;
        }
        .profile-wrap .profile-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .profile-wrap .pname {
          font-weight: 700;
          font-size: 13px;
          color: #1b2f6b;
        }
        .profile-wrap .prole {
          font-size: 11px;
          color: #8898aa;
          font-weight: 500;
        }

        /* kill bootstrap toggle arrow */
        .topbar-toggle::after { display: none !important; }
        .topbar-toggle {
          background: none !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
          outline: none !important;
        }

        @media (max-width: 991px) {
          .app-header { left: 0; }
        }
      `}</style>

      <header className="app-header">
        {/* ── LEFT: Hamburger + Title ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          >
            <i className="ti ti-menu-2" />
          </button>

          <div className="topbar-title">
            <h1>{pageMeta.title}</h1>
            <span className="sub">{pageMeta.sub}</span>
          </div>
        </div>

        {/* ── RIGHT: Bell + Profile ── */}
        <div className="topbar-right">
          {/* Notification Bell */}
          <Dropdown align="end">
            <Dropdown.Toggle as="div" className="topbar-toggle bell-wrap">
              <i className="ti ti-bell" />
              <span className="bell-badge">0</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item style={{ fontSize: "13px", color: "#8898aa" }}>
                <i className="ti ti-bell-ringing me-2" />
                Tidak ada notifikasi baru
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Profile */}
          <Dropdown align="end">
            <Dropdown.Toggle as="div" className="topbar-toggle profile-wrap">
              {auth.user?.photo_url ? (
                <img
                  src={auth.user.photo_url}
                  alt={userName}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #eef0f3",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  className="profile-avatar-icon"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#1b2f6b",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    border: "2px solid #eef0f3",
                    flexShrink: 0,
                  }}
                >
                  <i className="ti ti-user" />
                </div>
              )}
              <div className="profile-text d-none d-md-flex">
                <span className="pname">{userName}</span>
                <span className="prole">{userRole}</span>
              </div>
              <i
                className="ti ti-chevron-down d-none d-md-block"
                style={{ color: "#8898aa", fontSize: "12px" }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {auth.user?.role === "Psikolog" && (
                <Dropdown.Item onClick={handleProfile}>
                  <i className="ti ti-user me-2" /> My Account
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="ti ti-power me-2" /> Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
    </>
  );
};

export default Header;
