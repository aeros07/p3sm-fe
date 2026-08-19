import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ identifier: false, password: false });

  const navigate = useNavigate();
  const { auth, login } = useAuth();

  useEffect(() => {
    document.title = "P3SM | SIAP-AI Document Validation System";
    if (auth?.token) {
      navigate("/", { replace: true });
    }
  }, [auth, navigate]);

  useEffect(() => {
    if (showHero) {
      document.body.classList.add("show-hero");
    } else {
      document.body.classList.remove("show-hero");
    }
    return () => {
      document.body.classList.remove("show-hero");
    };
  }, [showHero]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    const errors = [];
    const newFieldErrors = { identifier: false, password: false };

    if (!trimmedIdentifier) {
      newFieldErrors.identifier = true;
      errors.push("Email atau username wajib diisi.");
    } else if (trimmedIdentifier.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier)) {
      newFieldErrors.identifier = true;
      errors.push("Format email tidak valid.");
    }

    if (!trimmedPassword) {
      newFieldErrors.password = true;
      errors.push("Password wajib diisi.");
    } else if (trimmedPassword.length < 6) {
      newFieldErrors.password = true;
      errors.push("Password minimal 6 karakter.");
    }

    setFieldErrors(newFieldErrors);

    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }

    setLoading(true);

    try {
      const response = await axiosClient.post("/login", {
        email: trimmedIdentifier,
        password: trimmedPassword,
      });

      const { access_token, user } = response.data;
      const token = access_token || response.data.token;

      login({
        token,
        user,
      });

      toast.success("Login berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login gagal. Periksa email dan password Anda.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-shell">
        {/* TOPBAR */}
        <header className="topbar d-flex align-items-center justify-content-between px-3 px-md-5 py-3">
          <div className="brand d-flex align-items-center gap-2">
            <img
              src="/assets/images/new-logo-p3sm.webp"
              alt="P3SM"
              className="brand-logo-img"
              onError={(e) => {
                e.target.src = "/assets/images/new-logo-p3sm.png";
              }}
            />
          </div>

          <button
            className="lang-switch btn btn-white rounded-pill border d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z" />
            </svg>
            ID
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </header>

        {/* HERO TOGGLE BUTTON (MOBILE / TABLET) */}
        <button
          className={`hero-toggle btn rounded-circle ${showHero ? "active" : ""}`}
          id="heroToggle"
          type="button"
          onClick={() => setShowHero(!showHero)}
          aria-label={showHero ? "Sembunyikan informasi" : "Tampilkan informasi"}
          aria-expanded={showHero}
        >
          <svg
            className={`icon-hero-info ${showHero ? "d-none" : ""}`}
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <svg
            className={`icon-hero-close ${!showHero ? "d-none" : ""}`}
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* MAIN CONTENT */}
        <main className="content container-fluid px-3 px-md-5 py-3 py-lg-0">
          <div className="row align-items-start gy-4">
            {/* HERO SECTION (LEFT) */}
            <section className="hero col-12 col-lg-7">
              <span className="badge-soft d-inline-flex align-items-center gap-2 mb-3">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="currentColor"
                >
                  <path d="M12 2l1.9 5.3L19 9l-5.1 1.7L12 16l-1.9-5.3L5 9l5.1-1.7z" />
                </svg>
                AI-Powered Validation
              </span>

              <h1 className="headline fw-800 mb-2">
                Validasi Cerdas.
                <br />
                Proses Otomatis.
                <br />
                Keputusan <span className="accent">Akurat.</span>
              </h1>

              <p className="lead-text text-secondary mb-2">
                SIAP-AI membantu P3SM/LSP memvalidasi dokumen sertifikasi
                kompetensi secara otomatis, cepat, dan akurat dengan teknologi
                Artificial Intelligence terdepan.
              </p>

              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 mb-3">
                <div className="col">
                  <div className="feature-card card border h-100">
                    <div className="card-body d-flex gap-2 align-items-start p-3">
                      <div className="feature-icon feature-icon-blue rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M7 3h7l5 5v13H7z" />
                          <path d="M14 3v5h5" />
                          <path d="M9 13l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="h6 fw-bold mb-1">Otomatis</h3>
                        <p className="small text-secondary mb-0">
                          Proses validasi dokumen secara otomatis menggunakan AI
                          &amp; OCR
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="feature-card card border h-100">
                    <div className="card-body d-flex gap-2 align-items-start p-3">
                      <div className="feature-icon feature-icon-green rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="h6 fw-bold mb-1">Akurat</h3>
                        <p className="small text-secondary mb-0">
                          Hasil validasi akurat berdasarkan rule LSP dan standar
                          BNSP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="feature-card card border h-100">
                    <div className="card-body d-flex gap-2 align-items-start p-3">
                      <div className="feature-icon feature-icon-orange rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 20V10M10 20V4M16 20v-7M22 20v-3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="h6 fw-bold mb-1">Terintegrasi</h3>
                        <p className="small text-secondary mb-0">
                          Terintegrasi dengan sistem P3SM dan ekosistem LSP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-panel border rounded-3 p-3 mb-2">
                <div className="row row-cols-2 row-cols-lg-4 g-3">
                  <div className="col d-flex align-items-center gap-2">
                    <div className="stat-icon stat-icon-purple rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21v-1a8 8 0 0116 0v1" />
                      </svg>
                    </div>
                    <div>
                      <strong className="d-block fw-800 stat-value">
                        12.560+
                      </strong>
                      <span className="d-block small text-secondary">
                        Dokumen Tervalidasi
                      </span>
                    </div>
                  </div>

                  <div className="col d-flex align-items-center gap-2">
                    <div className="stat-icon stat-icon-green rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <strong className="d-block fw-800 stat-value">
                        98.2%
                      </strong>
                      <span className="d-block small text-secondary">
                        Tingkat Akurasi
                      </span>
                    </div>
                  </div>

                  <div className="col d-flex align-items-center gap-2">
                    <div className="stat-icon stat-icon-orange rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="d-block fw-800 stat-value">5x</strong>
                      <span className="d-block small text-secondary">
                        Lebih Cepat Proses Validasi
                      </span>
                    </div>
                  </div>

                  <div className="col d-flex align-items-center gap-2">
                    <div className="stat-icon stat-icon-blue rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="d-block fw-800 stat-value">
                        24/7
                      </strong>
                      <span className="d-block small text-secondary">
                        Sistem Aktif &amp; Aman
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LOGIN PANEL (RIGHT) */}
            <section className="login-panel col-12 col-lg-5 d-flex justify-content-center">
              <div className="login-card card border-0 shadow-lg w-100">
                <div className="card-body">
                  <div className="login-illustration text-center" aria-hidden="true">
                    <img
                      src="/assets/images/Login Header Illustration.png"
                      alt=""
                      className="login-illustration-img img-fluid"
                    />
                  </div>

                  <h2 className="h5 fw-800 text-center mb-1">
                    Selamat Datang Kembali
                  </h2>
                  <p className="text-secondary text-center small mb-4">
                    Masuk untuk melanjutkan ke sistem SIAP-AI
                  </p>

                  <form id="loginForm" onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label
                        className="form-label small fw-semibold"
                        htmlFor="identifier"
                      >
                        Email / Username
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-secondary">
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21v-1a8 8 0 0116 0v1" />
                          </svg>
                        </span>
                        <input
                          id="identifier"
                          name="identifier"
                          type="text"
                          className={`form-control ${
                            fieldErrors.identifier ? "is-invalid" : ""
                          }`}
                          placeholder="Masukkan email atau username"
                          autoComplete="username"
                          value={identifier}
                          onChange={(e) => {
                            setIdentifier(e.target.value);
                            if (fieldErrors.identifier) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                identifier: false,
                              }));
                            }
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label small fw-semibold"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-secondary">
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="5" y="11" width="14" height="9" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" />
                          </svg>
                        </span>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${
                            fieldErrors.password ? "is-invalid" : ""
                          }`}
                          placeholder="Masukkan password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                password: false,
                              }));
                            }
                          }}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary toggle-pass"
                          id="togglePass"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                        >
                          {showPassword ? (
                            <svg
                              className="icon-eye-off"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-7-11-7a20.5 20.5 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a20.6 20.6 0 01-3.22 4.19M14.12 14.12a3 3 0 11-4.24-4.24" />
                              <path d="M1 1l22 22" />
                            </svg>
                          ) : (
                            <svg
                              className="icon-eye"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="remember"
                        >
                          Ingat saya
                        </label>
                      </div>
                      <a
                        href="#!"
                        className="link small fw-semibold text-decoration-none"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info(
                            "Fitur reset password tersedia melalui Administrator LSP."
                          );
                        }}
                      >
                        Lupa password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-gradient w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
                      id="submitBtn"
                      disabled={loading}
                    >
                      {loading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <svg
                          className="submit-arrow"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      )}
                      <span>
                        {loading ? "Memproses..." : "Masuk ke Sistem"}
                      </span>
                    </button>

                    <div className="d-flex align-items-center gap-2 text-secondary small my-3">
                      <hr className="flex-grow-1 my-0" />
                      <span className="text-nowrap">atau masuk dengan</span>
                      <hr className="flex-grow-1 my-0" />
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                      onClick={() =>
                        toast.info(
                          "Fitur Login Google SSO akan segera aktif."
                        )
                      }
                    >
                      <svg viewBox="0 0 48 48" width="18" height="18">
                        <path
                          fill="#FFC107"
                          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 6 29.6 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24 44c5.5 0 10.4-1.8 14.1-5l-6.5-5.4C29.7 35.3 27 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.6 5.1C9.7 39.6 16.3 44 24 44z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-2.9 5.1-5.3 6.6l6.5 5.4C40.5 36.7 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
                        />
                      </svg>
                      <span>Login dengan Google</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer border-top d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 px-3 px-md-5">
        <div className="footer-brand d-flex align-items-center gap-2">
          <img
            src="/assets/images/new-logo-p3sm.webp"
            alt="P3SM"
            className="brand-logo-img brand-logo-img-sm"
            onError={(e) => {
              e.target.src = "/assets/images/new-logo-p3sm.png";
            }}
          />
        </div>

        <p className="copyright small text-secondary text-center mb-0">
          © 2026 P3SM AI Document Validation System.
          <br className="d-md-none" /> All Rights Reserved.
        </p>

        <nav className="footer-links d-flex align-items-center small">
          <a href="#!" className="text-secondary text-decoration-none">
            Tentang Kami
          </a>
          <a href="#!" className="text-secondary text-decoration-none">
            Kebijakan Privasi
          </a>
          <a href="#!" className="text-secondary text-decoration-none">
            Syarat &amp; Ketentuan
          </a>
          <a
            href="#!"
            className="help-link text-secondary text-decoration-none d-flex align-items-center gap-1"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.1 9a3 3 0 115.8 1c0 2-2.9 2-2.9 4" />
              <path d="M12 17h.01" />
            </svg>
            Bantuan
          </a>
        </nav>
      </footer>

      <ToastContainer autoClose={2000} />
    </>
  );
};

export default LoginPage;
