import React, { useState, useEffect } from "react";
import "./project.css";
import axiosClient from "../../api/axiosClient";

const ProjectPage = () => {
  document.title = "Data Project - AI Document Validation";

  const [projectList, setProjectList] = useState([]);
  const [summary, setSummary] = useState({
    total_projects: 0,
    total_jumlah_data: 0,
    total_sedang_diproses: 0,
    total_selesai_diproses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch projects from backend API
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/projects", {
        params: { search: searchTerm },
      });
      if (res.data?.success) {
        setProjectList(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data project dari API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm]);

  // Handle Upload Form Submit
  const handleSubmitNewData = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Harap pilih file Excel (.xlsx / .xls / .csv) untuk diupload.");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axiosClient.post("/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        setToastMessage(res.data.message || `File "${selectedFile.name}" berhasil diupload!`);
        setShowModal(false);
        setSelectedFile(null);
        fetchProjects();
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat mengupload file Excel.";
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to format item row display
  const formatProjectRow = (item) => {
    const uploaderName = item.user?.name || "Admin Operator";
    const uploaderRole = item.user?.role || "Admin";
    const initials = uploaderName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AO";

    const formattedDate = item.created_at
      ? new Date(item.created_at).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      : "-";

    const totalItems = item.total_items || 0;
    const processItems = item.process_items || 0;
    const passedItems = item.passed_items || 0;
    const failedItems = item.failed_items || 0;
    const selesaiDiproses = passedItems + failedItems;

    return {
      id: item.id,
      uid: item.uid,
      namaFile: item.file_name,
      uploadedBy: {
        name: uploaderName,
        role: uploaderRole,
        initials: initials,
        color: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
      },
      tglUpload: formattedDate,
      jumlahData: totalItems,
      sedangDiproses: processItems,
      selesaiDiproses: selesaiDiproses,
      status: item.status,
    };
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 9999, marginTop: "70px" }}
        >
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2 fs-13 fw-medium">
                <i className="ti ti-circle-check fs-18"></i>
                {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToastMessage("")}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Title */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
            Data Project
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Kelola dan pantau batch file data yang diupload dan diproses sistem
          </p>
        </div>
        {/* Single Top Tambah Data Button */}
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-sm rounded-3 fw-semibold fs-13"
          onClick={() => {
            setShowModal(true);
            setUploadError("");
          }}
        >
          <i className="ti ti-plus fs-16"></i> Tambah Data
        </button>
      </div>

      {/* TOP STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0">
            <div className="card-body project-stat-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-bg-primary-light me-3">
                  <i className="ti ti-folders"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Project File</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_projects} <span className="fs-12 text-muted fw-normal">File</span>
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-success fw-medium">
                <i className="ti ti-arrow-up-right me-1"></i>Aktif <span className="text-muted">dalam sistem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0">
            <div className="card-body project-stat-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-bg-purple-light me-3">
                  <i className="ti ti-database"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Jumlah Data</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_jumlah_data.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-muted fw-medium">
                Akumulasi seluruh record
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0">
            <div className="card-body project-stat-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-box-warning me-3">
                  <i className="ti ti-loader-2"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Sedang Di Proses</div>
                  <h4 className="fw-bold fs-20 mb-0 text-primary">
                    {summary.total_sedang_diproses.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-primary fw-medium">
                <i className="ti ti-refresh me-1"></i>Dalam antrean OCR/AI
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0">
            <div className="card-body project-stat-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-box-success me-3">
                  <i className="ti ti-circle-check"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Selesai Diproses</div>
                  <h4 className="fw-bold fs-20 mb-0 text-success">
                    {summary.total_selesai_diproses.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-success fw-medium">
                {((summary.total_selesai_diproses / (summary.total_jumlah_data || 1)) * 100).toFixed(1)}%{" "}
                <span className="text-muted">tingkat penyelesaian</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card project-card mb-4">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2 border-bottom">
          <div>
            <h5 className="fw-bold fs-15 mb-0 text-dark">Daftar File Project</h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Search Bar */}
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="ti ti-search fs-14"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light border-start-0 ps-0 fs-12"
                placeholder="Cari nama file / uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
            <table className="table table-hover align-middle table-project mb-0" style={{ width: "100%" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th className="text-center" style={{ width: "45px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>NO</th>
                  <th style={{ width: "26%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>NAMA FILE</th>
                  <th style={{ width: "22%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>DI UPLOAD OLEH</th>
                  <th style={{ width: "16%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>TGL UPLOAD</th>
                  <th className="text-end" style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>JUMLAH DATA</th>
                  <th className="text-end" style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>SEDANG DI PROSES</th>
                  <th className="text-end" style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>SELESAI DIPROSES</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted fs-13">
                      <i className="ti ti-loader-2 ti-spin fs-28 d-block mb-2 text-primary"></i>
                      Memuat data project...
                    </td>
                  </tr>
                ) : projectList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted fs-13">
                      <i className="ti ti-folder-off fs-32 d-block mb-2 text-secondary"></i>
                      Tidak ada data project ditemukan.
                    </td>
                  </tr>
                ) : (
                  projectList.map((rawItem, index) => {
                    const item = formatProjectRow(rawItem);
                    return (
                      <tr key={item.id}>
                        {/* NO */}
                        <td className="text-center fw-semibold text-muted fs-12">
                          {index + 1}.
                        </td>

                        {/* NAMA FILE */}
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="file-icon-box">
                              <i
                                className={
                                  item.namaFile.endsWith(".csv")
                                    ? "ti ti-file-text text-primary"
                                    : "ti ti-file-spreadsheet text-success"
                                }
                              ></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark fs-13 mb-0">{item.namaFile}</div>
                            </div>
                          </div>
                        </td>

                        {/* DI UPLOAD OLEH */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="user-avatar-circle"
                              style={{ background: item.uploadedBy.color }}
                            >
                              {item.uploadedBy.initials}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark fs-12 mb-0">
                                {item.uploadedBy.name}
                              </div>
                              <span className="text-muted fs-10">{item.uploadedBy.role}</span>
                            </div>
                          </div>
                        </td>

                        {/* TGL UPLOAD */}
                        <td>
                          <div className="d-flex align-items-center gap-1.5 text-secondary fs-12">
                            <i className="ti ti-calendar-event text-muted fs-14"></i>
                            <span>{item.tglUpload}</span>
                          </div>
                        </td>

                        {/* JUMLAH DATA */}
                        <td className="text-end">
                          <span className="badge-total-pill">
                            {item.jumlahData.toLocaleString("id-ID")} data
                          </span>
                        </td>

                        {/* SEDANG DI PROSES */}
                        <td className="text-end">
                          {item.sedangDiproses > 0 ? (
                            <span className="badge-in-progress-pill">
                              <i className="ti ti-loader-2 ti-spin fs-12"></i>
                              {item.sedangDiproses.toLocaleString("id-ID")} data
                            </span>
                          ) : (
                            <span className="text-muted fs-12 fw-medium">-</span>
                          )}
                        </td>

                        {/* SELESAI DIPROSES */}
                        <td className="text-end">
                          {item.selesaiDiproses > 0 ? (
                            <span className="badge-completed-pill">
                              <i className="ti ti-check fs-12"></i>
                              {item.selesaiDiproses.toLocaleString("id-ID")} data
                            </span>
                          ) : (
                            <span className="text-muted fs-12 fw-medium">0 data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Clean Standard Bootstrap Pagination Footer */}
          <div className="p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 bg-white">
            <span className="fs-12 text-muted fw-medium">
              Menampilkan <strong className="text-dark">{projectList.length > 0 ? 1 : 0} - {projectList.length}</strong> dari <strong className="text-dark">{summary.total_projects}</strong> file project
            </span>
            <nav aria-label="Project table pagination">
              <ul className="pagination pagination-sm mb-0 gap-1">
                <li className="page-item disabled">
                  <button className="page-link rounded border-0 px-2 py-1 fs-12">
                    <i className="ti ti-chevron-left"></i>
                  </button>
                </li>
                <li className="page-item active">
                  <button className="page-link rounded border-0 px-3 py-1 fs-12 fw-bold bg-primary text-white">
                    1
                  </button>
                </li>
                <li className="page-item disabled">
                  <button className="page-link rounded border-0 px-2 py-1 fs-12">
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH DATA PROJECT */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom py-3 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="icon-box-shape icon-bg-primary-light" style={{ width: "36px", height: "36px" }}>
                      <i className="ti ti-file-upload fs-18 text-primary"></i>
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold fs-16 text-dark mb-0">Tambah Data Project</h5>
                      <span className="text-muted fs-12">Upload file Excel data project baru</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={isUploading}
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFile(null);
                      setUploadError("");
                    }}
                  ></button>
                </div>

                <form onSubmit={handleSubmitNewData}>
                  <div className="modal-body p-4">
                    {uploadError && (
                      <div className="alert alert-danger py-2 px-3 fs-12 mb-3 d-flex align-items-center gap-2">
                        <i className="ti ti-alert-circle fs-16"></i>
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Drag & Drop File Upload Only */}
                    <div
                      className={`upload-dropzone ${selectedFile ? "upload-dropzone-active" : ""}`}
                      onClick={() => !isUploading && document.getElementById("excel-file-input").click()}
                    >
                      <i className={`ti ${selectedFile ? "ti-file-check text-success" : "ti-cloud-upload text-primary"} fs-40 d-block mb-2`}></i>
                      <h6 className="fw-bold text-dark fs-14 mb-1">
                        {selectedFile ? selectedFile.name : "Pilih atau seret file Excel ke sini"}
                      </h6>
                      <p className="text-muted fs-12 mb-0">
                        Format file: <strong>.XLSX, .XLS, .CSV</strong> (Maksimal 20MB)
                      </p>
                      <input
                        id="excel-file-input"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        disabled={isUploading}
                        className="d-none"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                            setUploadError("");
                          }
                        }}
                      />
                    </div>

                    {selectedFile && (
                      <div className="mt-3 p-2.5 bg-light rounded border d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <i className="ti ti-file-spreadsheet text-success fs-20"></i>
                          <div>
                            <div className="fs-12 fw-semibold text-dark mb-0">{selectedFile.name}</div>
                            <span className="fs-11 text-muted">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isUploading}
                          className="btn btn-sm text-danger p-0 border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          <i className="ti ti-x fs-16"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer bg-light border-top py-2.5 px-4 d-flex align-items-center justify-content-end gap-2">
                    <button
                      type="button"
                      disabled={isUploading}
                      className="btn btn-outline-secondary btn-sm px-3 fw-medium"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedFile(null);
                        setUploadError("");
                      }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="btn btn-primary btn-sm px-4 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                    >
                      {isUploading ? (
                        <>
                          <i className="ti ti-loader-2 ti-spin fs-14"></i> Mengupload...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-upload fs-14"></i> Upload &amp; Simpan
                        </>
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

export default ProjectPage;
