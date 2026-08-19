import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./userrole.css";

const ROLES = ["Super Admin", "Admin LSP", "Asesor", "Viewer"];
const UNIT_KERJA = ["Sekretariat LSP", "Divisi Sertifikasi", "Divisi Asesor", "Divisi TI", "Divisi Keuangan"];
const STATUS_OPTIONS = ["aktif", "nonaktif"];

const UserRolePage = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    total_roles: 0,
    role_distribution: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterUnitKerja, setFilterUnitKerja] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "Admin LSP",
    unit_kerja: "",
    status: "aktif",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/users", {
        params: { search: searchTerm, role: filterRole, unit_kerja: filterUnitKerja, status: filterStatus, page: currentPage },
      });
      if (res.data?.success) {
        setUsers(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [searchTerm, filterRole, filterUnitKerja, filterStatus, page]);

  const handleOpenModal = (user = null) => {
    setErrorMsg("");
    setPhotoFile(null);
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        password: "", // Password dikosongkan saat edit
        role: user.role,
        unit_kerja: user.unit_kerja || "",
        status: user.status || "aktif",
      });
      setPhotoPreview(user.photo_url || "");
    } else {
      setFormData({
        id: null,
        name: "",
        email: "",
        password: "",
        role: "Admin LSP",
        unit_kerja: "",
        status: "aktif",
      });
      setPhotoPreview("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const bodyFormData = new FormData();
      bodyFormData.append("name", formData.name);
      bodyFormData.append("email", formData.email);
      if (formData.password) {
        bodyFormData.append("password", formData.password);
      }
      bodyFormData.append("role", formData.role);
      bodyFormData.append("unit_kerja", formData.unit_kerja || "");
      bodyFormData.append("status", formData.status);
      if (photoFile) {
        bodyFormData.append("photo", photoFile);
      }

      let res;
      if (formData.id) {
        // Update via POST with _method PUT for multipart/form-data
        bodyFormData.append("_method", "PUT");
        res = await axiosClient.post(`/users/${formData.id}`, bodyFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create
        res = await axiosClient.post("/users", bodyFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data?.success) {
        setToastMessage(res.data.message || "Berhasil menyimpan data user!");
        setShowModal(false);
        fetchUsers();
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      const res = await axiosClient.delete(`/users/${id}`);
      if (res.data?.success) {
        setToastMessage("User berhasil dihapus.");
        fetchUsers();
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus user.");
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole) params.append("role", filterRole);
      if (filterUnitKerja) params.append("unit_kerja", filterUnitKerja);
      if (filterStatus) params.append("status", filterStatus);

      const url = `/users/export?${params.toString()}`;
      
      const response = await axiosClient.get(url, {
        responseType: 'blob'
      });
      
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', `Data_User_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
    } catch (error) {
      console.error("Gagal export data:", error);
      alert("Gagal mengexport data!");
    }
  };

  const getRoleBadge = (roleName) => {
    let colorClass = "bg-primary text-white";
    if (roleName === "Super Admin") colorClass = "bg-danger text-white";
    else if (roleName === "Asesor") colorClass = "bg-success text-white";
    else if (roleName === "Viewer") colorClass = "bg-secondary text-white";

    return (
      <span className={`badge px-2 py-1 fs-11 fw-medium rounded-pill ${colorClass}`}>
        {roleName}
      </span>
    );
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
            Master User & Role
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Kelola daftar pengguna dan hak akses ke dalam sistem
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-sm rounded-3 fw-semibold fs-13"
            onClick={handleExport}
          >
            <i className="ti ti-file-spreadsheet fs-16"></i> Export Excel
          </button>
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-sm rounded-3 fw-semibold fs-13"
            onClick={() => handleOpenModal()}
          >
            <i className="ti ti-user-plus fs-16"></i> Tambah User
          </button>
        </div>
      </div>

      {/* TOP STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(29,78,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-users text-primary fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total User</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_users.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-user-check text-success fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">User Aktif</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.active_users.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-user-x text-danger fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">User Nonaktif</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.inactive_users.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-shield-lock text-purple fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Role Aktif</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_roles.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIE CHARTS */}
      <div className="row g-4 mb-4">
        {/* Distribusi Role */}
        <div className="col-xl-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold fs-16 mb-0 text-dark" style={{ color: '#1b2f6b' }}>Distribusi Role</h5>
              </div>
              <div className="row align-items-center h-100">
                <div className="col-5">
                  <div style={{ height: '130px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.role_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {summary.role_distribution.map((entry, index) => {
                            const colors = ['#6366f1', '#3b82f6', '#0ea5e9', '#f97316', '#22c55e', '#14b8a6', '#9ca3af'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'User']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <h3 className="fw-bold fs-20 mb-0 text-dark" style={{ color: '#1b2f6b' }}>{summary.total_users}</h3>
                      <div className="text-muted fs-10 fw-medium">Total User</div>
                    </div>
                  </div>
                </div>
                <div className="col-7">
                  <div className="d-flex flex-column gap-2 ps-2">
                    {summary.role_distribution.map((role, idx) => {
                      const colors = ['#6366f1', '#3b82f6', '#0ea5e9', '#f97316', '#22c55e', '#14b8a6', '#9ca3af'];
                      const percentage = summary.total_users > 0 ? ((role.count / summary.total_users) * 100).toFixed(1) : 0;
                      return (
                        <div key={idx} className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: colors[idx % colors.length] }}></div>
                            <span className="fs-13 fw-medium" style={{ color: '#1b2f6b' }}>{role.role}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold fs-13 text-dark">{role.count}</span>
                            <span className="text-muted fs-12">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status User */}
        <div className="col-xl-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold fs-16 mb-0 text-dark" style={{ color: '#1b2f6b' }}>Status User</h5>
              </div>
              <div className="row align-items-center h-100">
                <div className="col-5">
                  <div style={{ height: '130px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Aktif', count: summary.active_users },
                            { name: 'Nonaktif', count: summary.inactive_users }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'User']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <h3 className="fw-bold fs-20 mb-0 text-dark" style={{ color: '#1b2f6b' }}>{summary.total_users}</h3>
                      <div className="text-muted fs-10 fw-medium">Total User</div>
                    </div>
                  </div>
                </div>
                <div className="col-7">
                  <div className="d-flex flex-column gap-3 ps-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#22c55e' }}></div>
                        <span className="fs-13 fw-medium" style={{ color: '#1b2f6b' }}>Aktif</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold fs-13 text-dark">{summary.active_users}</span>
                        <span className="text-muted fs-12">({summary.total_users > 0 ? ((summary.active_users / summary.total_users) * 100).toFixed(1) : 0}%)</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#ef4444' }}></div>
                        <span className="fs-13 fw-medium" style={{ color: '#1b2f6b' }}>Nonaktif</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold fs-13 text-dark">{summary.inactive_users}</span>
                        <span className="text-muted fs-12">({summary.total_users > 0 ? ((summary.inactive_users / summary.total_users) * 100).toFixed(1) : 0}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* TABLE SECTION */}
        <div className="col-12">
          <div className="card project-card h-100 mb-0">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2 border-bottom">
              <h5 className="fw-bold fs-15 mb-0 text-dark">Daftar Pengguna</h5>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm bg-light text-muted fs-12 border-0"
                  style={{ width: "130px" }}
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Semua Role</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                  className="form-select form-select-sm bg-light text-muted fs-12 border-0"
                  style={{ width: "150px" }}
                  value={filterUnitKerja}
                  onChange={(e) => setFilterUnitKerja(e.target.value)}
                >
                  <option value="">Semua Unit Kerja</option>
                  {UNIT_KERJA.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <select
                  className="form-select form-select-sm bg-light text-muted fs-12 border-0"
                  style={{ width: "120px" }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'aktif' ? 'Aktif' : 'Nonaktif'}</option>)}
                </select>
                <div className="input-group input-group-sm" style={{ width: "200px" }}>
                  <span className="input-group-text bg-light border-end-0 text-muted border-0">
                    <i className="ti ti-search fs-14"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light border-start-0 ps-0 fs-12 border-0"
                    placeholder="Cari nama atau email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle table-project mb-0">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "60px" }}>NO</th>
                      <th>NAMA PENGGUNA</th>
                      <th>EMAIL</th>
                      <th>HAK AKSES (ROLE)</th>
                      <th>UNIT KERJA</th>
                      <th className="text-center">STATUS</th>
                      <th>TERAKHIR AKTIF</th>
                      <th className="text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted fs-13">
                          <i className="ti ti-loader-2 ti-spin fs-28 d-block mb-2 text-primary"></i>
                          Memuat data user...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted fs-13">
                          <i className="ti ti-users fs-32 d-block mb-2 text-secondary"></i>
                          Tidak ada user ditemukan.
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr key={user.id}>
                          <td className="text-center fw-semibold text-muted fs-12">{(page - 1) * 15 + index + 1}.</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {user.photo_url ? (
                                <img
                                  src={user.photo_url}
                                  alt={user.name}
                                  className="rounded-circle border"
                                  style={{ width: "36px", height: "36px", objectFit: "cover", flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-13 border"
                                  style={{ width: "36px", height: "36px", flexShrink: 0 }}
                                >
                                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold text-dark fs-13 mb-0">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted fs-13">{user.email}</div>
                          </td>
                          <td>
                            {getRoleBadge(user.role)}
                          </td>
                          <td>
                            <div className="fw-medium text-dark fs-12">{user.unit_kerja || "-"}</div>
                          </td>
                          <td className="text-center">
                            {user.status === 'aktif' ? (
                              <span className="badge bg-success-subtle text-success px-2 py-1 fs-11 fw-medium rounded-pill">Aktif</span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger px-2 py-1 fs-11 fw-medium rounded-pill">Nonaktif</span>
                            )}
                          </td>
                          <td>
                            <div className="text-muted fs-12">
                              {user.last_active_at ? new Date(user.last_active_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit' }) : "-"}
                            </div>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-light text-primary me-2 px-2 py-1 rounded"
                              onClick={() => handleOpenModal(user)}
                              title="Edit User"
                            >
                              <i className="ti ti-edit fs-14"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-light text-danger px-2 py-1 rounded"
                              onClick={() => handleDelete(user.id)}
                              title="Hapus User"
                            >
                              <i className="ti ti-trash fs-14"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {meta && (
                <div className="p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 bg-white" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <span className="fs-12 text-muted fw-medium">
                    Menampilkan <strong className="text-dark">{users.length > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0} - {(meta.current_page - 1) * meta.per_page + users.length}</strong> dari <strong className="text-dark">{meta.total}</strong> user
                  </span>
                  <nav>
                    <ul className="pagination pagination-sm mb-0 gap-1">
                      <li className={`page-item ${meta.current_page === 1 ? "disabled" : ""}`}>
                        <button className="page-link rounded border-0 px-2 py-1 fs-12" onClick={() => setPage(meta.current_page - 1)}>
                          <i className="ti ti-chevron-left"></i>
                        </button>
                      </li>
                      <li className="page-item active">
                        <button className="page-link rounded border-0 px-3 py-1 fs-12 fw-bold bg-primary text-white">
                          {meta.current_page}
                        </button>
                      </li>
                      <li className={`page-item ${meta.current_page === meta.last_page ? "disabled" : ""}`}>
                        <button className="page-link rounded border-0 px-2 py-1 fs-12" onClick={() => setPage(meta.current_page + 1)}>
                          <i className="ti ti-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT USER */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom py-3 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="icon-box-shape icon-bg-primary-light" style={{ width: "36px", height: "36px" }}>
                      <i className={`ti ${formData.id ? "ti-user-edit" : "ti-user-plus"} fs-18 text-primary`}></i>
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold fs-16 text-dark mb-0">
                        {formData.id ? "Edit User" : "Tambah User Baru"}
                      </h5>
                    </div>
                  </div>
                  <button type="button" className="btn-close" disabled={isSubmitting} onClick={handleCloseModal}></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    {errorMsg && (
                      <div className="alert alert-danger py-2 px-3 fs-12 mb-3 d-flex align-items-center gap-2">
                        <i className="ti ti-alert-circle fs-16"></i>
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Foto User Input with Live Preview */}
                    <div className="mb-3">
                      <label className="form-label fs-13 fw-semibold text-dark">Foto Profil User</label>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="flex-shrink-0 d-flex align-items-center justify-content-center border rounded-circle bg-light overflow-hidden"
                          style={{ width: "60px", height: "60px", border: "2px solid #eef0f3" }}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <i className="ti ti-user fs-28 text-muted"></i>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control fs-12"
                            onChange={handlePhotoChange}
                          />
                          <div className="form-text fs-11 mt-1 text-muted">
                            Format: JPG, PNG, WEBP (Max 5MB). Otomatis diunggah ke S3 Storage.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fs-13 fw-semibold text-dark">Nama Lengkap</label>
                      <input
                        type="text"
                        className="form-control fs-13"
                        placeholder="Masukkan nama"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fs-13 fw-semibold text-dark">Alamat Email</label>
                      <input
                        type="email"
                        className="form-control fs-13"
                        placeholder="contoh@email.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fs-13 fw-semibold text-dark">
                        Password {formData.id && <span className="text-muted fw-normal fs-11">(Kosongkan jika tidak ingin mengubah)</span>}
                      </label>
                      <input
                        type="password"
                        className="form-control fs-13"
                        placeholder="Masukkan password"
                        required={!formData.id}
                        minLength="6"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label fs-13 fw-semibold text-dark">Hak Akses (Role)</label>
                      <select
                        className="form-select fs-13"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fs-13 fw-semibold text-dark">Unit Kerja</label>
                      <select
                        className="form-select fs-13"
                        value={formData.unit_kerja}
                        onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                      >
                        <option value="">- Pilih Unit Kerja -</option>
                        {UNIT_KERJA.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label fs-13 fw-semibold text-dark">Status</label>
                      <select
                        className="form-select fs-13"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer bg-light border-top py-2.5 px-4 d-flex align-items-center justify-content-end gap-2">
                    <button type="button" disabled={isSubmitting} className="btn btn-outline-secondary btn-sm px-3 fw-medium" onClick={handleCloseModal}>
                      Batal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm px-4 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm">
                      {isSubmitting ? (
                        <><i className="ti ti-loader-2 ti-spin fs-14"></i> Menyimpan...</>
                      ) : (
                        <><i className="ti ti-device-floppy fs-14"></i> Simpan Data</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserRolePage;
