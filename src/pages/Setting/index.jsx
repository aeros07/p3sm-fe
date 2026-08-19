import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./setting.css";

const SettingPage = () => {


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [formData, setFormData] = useState({
    app_name: "",
    app_email: "",
    app_footer: "",
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/settings");
      if (res.data?.success) {
        const data = res.data.data || {};
        setFormData({
          app_name: data.app_name || "",
          app_email: data.app_email || "",
          app_footer: data.app_footer || "",
        });
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await axiosClient.put("/settings", formData);
      if (res.data?.success) {
        setToastMessage(res.data.message || "Pengaturan berhasil disimpan!");
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999, marginTop: "70px" }}>
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2 fs-13 fw-medium">
                <i className="ti ti-circle-check fs-18"></i>
                {toastMessage}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToastMessage("")}></button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
            Pengaturan Sistem
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Kelola konfigurasi umum dan properti aplikasi
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4">
              {isLoading ? (
                <div className="text-center py-5">
                  <i className="ti ti-loader-2 ti-spin fs-28 text-primary mb-2"></i>
                  <p className="text-muted fs-13 mb-0">Memuat konfigurasi...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fs-13 fw-semibold text-dark">Nama Aplikasi / Instansi</label>
                    <input
                      type="text"
                      className="form-control fs-13 py-2"
                      placeholder="Masukkan nama aplikasi..."
                      required
                      value={formData.app_name}
                      onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                    />
                    <div className="form-text fs-12 mt-1">Nama ini akan digunakan pada notifikasi dan header sistem.</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fs-13 fw-semibold text-dark">Email Perusahaan / Sistem</label>
                    <input
                      type="email"
                      className="form-control fs-13 py-2"
                      placeholder="contoh@p3sm.com"
                      required
                      value={formData.app_email}
                      onChange={(e) => setFormData({ ...formData, app_email: e.target.value })}
                    />
                    <div className="form-text fs-12 mt-1">Email resmi untuk kontak pengirim notifikasi.</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fs-13 fw-semibold text-dark">Teks Footer (Hak Cipta)</label>
                    <input
                      type="text"
                      className="form-control fs-13 py-2"
                      placeholder="Teks footer..."
                      required
                      value={formData.app_footer}
                      onChange={(e) => setFormData({ ...formData, app_footer: e.target.value })}
                    />
                    <div className="form-text fs-12 mt-1">Tulisan hak cipta (*copyright*) yang muncul di bagian paling bawah halaman.</div>
                  </div>

                  <div className="d-flex justify-content-end mt-5 pt-3 border-top">
                    <button 
                      type="submit" 
                      className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold fs-13 shadow-sm rounded-3"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <><i className="ti ti-loader-2 ti-spin fs-16"></i> Menyimpan...</>
                      ) : (
                        <><i className="ti ti-device-floppy fs-16"></i> Simpan Pengaturan</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
