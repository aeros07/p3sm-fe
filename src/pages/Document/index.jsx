import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../Project/project.css";

const DocumentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Sync with URL Query Parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const statusParam = searchParams.get("status") || "";

  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({
    total_participants: 0,
    total_can_open: 0,
    total_cannot_open: 0,
    total_pass: 0,
    total_fail: 0,
    total_in_progress: 0,
    can_open_percentage: 0,
    cannot_open_percentage: 0,
    pass_percentage: 0,
    fail_percentage: 0,
    in_progress_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Local Search Input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Pagination & Meta
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    document.title = "Dokumen - AI Document Validation System";
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchDocuments();
  }, [searchParams]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageParam,
        per_page: perPageParam,
        search: searchParam,
        category: categoryParam,
        status: statusParam,
      };

      // Call dedicated lightweight /documents API
      const res = await axiosClient.get("/documents", { params });
      if (res.data?.success) {
        setDocuments(res.data.data || []);

        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.meta) {
          setLastPage(res.data.meta.last_page);
          setTotalItems(res.data.meta.total);
        }
      }
    } catch (err) {
      console.error("Gagal memuat repositori dokumen:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlParams = (updatedParams) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updatedParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        newParams.set(key, val);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    updateUrlParams({
      search: val,
      page: 1,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({
      search: searchInput,
      page: 1,
    });
  };

  const handleCategoryFilterChange = (e) => {
    updateUrlParams({
      category: e.target.value,
      page: 1,
    });
  };

  const handleStatusFilterChange = (e) => {
    updateUrlParams({
      status: e.target.value,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({
      page: newPage,
    });
  };

  // Helper render Status AI Validasi Badge
  const renderAiValidationBadge = (item) => {
    const status = item.ai_result_status;
    if (item.review_status === "pass" || status === "pass") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 fw-semibold">
          Sesuai (PASS)
        </span>
      );
    }
    if (item.review_status === "need_repair") {
      return (
        <span className="badge bg-warning text-white px-2 py-1 fs-12 fw-bold rounded-pill">
          Perlu Perbaikan
        </span>
      );
    }
    if (status === "waiting_review") {
      return (
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-12 fw-semibold">
          Menunggu Review
        </span>
      );
    }
    if (status === "fail" || item.review_status === "fail") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-12 fw-semibold">
          Tidak Sesuai (FAIL)
        </span>
      );
    }
    return (
      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fs-12 fw-semibold">
        Menunggu Proses
      </span>
    );
  };

  return (
    <div className="container-fluid px-0">
      {/* 1. Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            Dokumen
          </h4>
          <span className="text-muted fs-12">Dashboard / Dokumen</span>
        </div>
      </div>

      {/* 2. Top 6 Metric Summary Cards */}
      <div className="row g-2 mb-2">
        {/* Card 1: Total Dokumen */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary-subtle text-primary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-folder fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Total Dokumen
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_participants?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  Total peserta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Dokumen Bisa Dibuka */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Bisa Dibuka
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_can_open?.toLocaleString("id-ID")}
                </h5>
                <span className="text-success fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-up-right me-1"></i>{summary.can_open_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Dokumen Tidak Bisa Dibuka */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-folder-off fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Tdk Bisa Dibuka
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_cannot_open?.toLocaleString("id-ID")}
                </h5>
                <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-down-right me-1"></i>{summary.cannot_open_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Dokumen Sesuai */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-purple-subtle text-purple p-2 rounded-3 flex-shrink-0"
                style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}
              >
                <i className="ti ti-file-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Dokumen Sesuai
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_pass?.toLocaleString("id-ID")}
                </h5>
                <span className="text-success fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-up-right me-1"></i>{summary.pass_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Dokumen Tidak Sesuai */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning-subtle text-warning p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-file-alert fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Tidak Sesuai
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_fail?.toLocaleString("id-ID")}
                </h5>
                <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-down-right me-1"></i>{summary.fail_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Menunggu Proses */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-secondary-subtle text-secondary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-clock fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Menunggu Proses
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_in_progress?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  {summary.in_progress_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Actions */}
      <div className="card project-card border-0 p-2 px-3 shadow-sm mb-3 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-sm-4 col-md-3">
            <select
              className="form-select form-select-sm bg-light"
              value={categoryParam}
              onChange={handleCategoryFilterChange}
            >
              <option value="">Semua Jenis Dokumen</option>
              <option value="APL01">APL01 - Form Permohonan</option>
              <option value="APL.01">APL.01</option>
              <option value="APL.02">APL.02 - Asesmen Mandiri</option>
              <option value="MAPA">MAPA - Merencanakan Asesmen</option>
              <option value="AK.01">AK.01 - AK.07 Persetujuan Asesmen</option>
              <option value="IA.01">IA.01 - IA.10 Perangkat Asesmen</option>
              <option value="Dokumentasi">Dokumentasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-2">
            <select
              className="form-select form-select-sm bg-light"
              value={statusParam}
              onChange={handleStatusFilterChange}
            >
              <option value="">Semua Status</option>
              <option value="pass">Dokumen Sesuai (PASS)</option>
              <option value="waiting_review">Menunggu Review Manual</option>
              <option value="fail">Dokumen Tidak Sesuai (FAIL)</option>
              <option value="bisa_dibuka">Bisa Dibuka</option>
              <option value="tidak_bisa_dibuka">Tidak Bisa Dibuka</option>
              <option value="menunggu">Menunggu Proses</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Cari dokumen, ID Izin, NIK, atau Nama Peserta..."
                value={searchInput}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="col-6 col-md-1">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100 fs-12 d-flex align-items-center justify-content-center gap-1"
              onClick={handleResetFilters}
            >
              <i className="ti ti-refresh"></i> Reset
            </button>
          </div>

          <div className="col-6 col-md-2 text-end">
            <Link
              to="/project"
              className="btn btn-primary btn-sm w-100 fs-12 fw-bold d-flex align-items-center justify-content-center gap-1"
            >
              <i className="ti ti-plus"></i> Upload / Import
            </Link>
          </div>
        </form>
      </div>

      {/* 4. Master Data Table Dokumen */}
      <div className="card project-card border-0 shadow-sm overflow-hidden mb-3 bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark mb-0 fs-13">Daftar Dokumen</h6>
          <span className="text-muted fs-12">
            {totalItems.toLocaleString("id-ID")} dokumen ditemukan
          </span>
        </div>

        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0 fs-11" style={{ width: "100%" }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr className="text-muted fs-11 fw-bold text-uppercase align-middle">
                <th style={{ width: "35px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">No</th>
                <th style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Jenis Dokumen</th>
                <th style={{ width: "15%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>ID Izin</th>
                <th style={{ width: "20%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Nama Peserta</th>
                <th style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Tanggal Upload</th>
                <th className="text-center" style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Link</th>
                <th className="text-center" style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Buka</th>
                <th className="text-center" style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>OCR</th>
                <th className="text-center" style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Validasi AI</th>
                <th className="text-center" style={{ width: "6%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Skor AI</th>
                <th className="text-center" style={{ width: "75px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <i className="ti ti-loader-2 ti-spin fs-28 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">
                      Memuat data dokumen...
                    </span>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <i className="ti ti-folder-off fs-36 text-muted mb-2 d-block"></i>
                    <span className="fw-semibold text-dark fs-14">
                      Tidak ada dokumen ditemukan
                    </span>
                  </td>
                </tr>
              ) : (
                documents.map((doc, idx) => {
                  return (
                    <tr key={doc.id || doc.uid}>
                      <td className="text-center text-muted fs-12">
                        {(pageParam - 1) * perPageParam + idx + 1}
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <span className="badge bg-light text-dark border fs-11">
                          {doc.category || "APL01"}
                        </span>
                      </td>
                      <td className="fs-12 text-primary fw-semibold" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {doc.id_izin || "-"}
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <span className="fw-bold text-dark fs-12">
                          {doc.name}
                        </span>
                      </td>
                      <td className="text-muted fs-12">
                        {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="text-center">
                        {doc.report_url ? (
                          <a
                            href={doc.report_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                            title="Buka Report URL"
                          >
                            <i className="ti ti-link fs-16"></i>
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        {doc.md_s3_url ? (
                          <a
                            href={doc.md_s3_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success"
                            title="Buka MD S3 File"
                          >
                            <i className="ti ti-circle-check text-success fs-16"></i>
                          </a>
                        ) : doc.is_complete_process ? (
                          <i className="ti ti-circle-x text-danger fs-16" title="Gagal Render MD"></i>
                        ) : (
                          <i className="ti ti-clock text-warning fs-16" title="Menunggu Proses"></i>
                        )}
                      </td>
                      <td className="text-center">
                        {doc.has_ocr_data ? (
                          <i className="ti ti-circle-check text-success fs-16" title="OCR Ekstrak Berhasil"></i>
                        ) : doc.is_complete_process ? (
                          <i className="ti ti-circle-x text-danger fs-16" title="OCR Belum/Gagal"></i>
                        ) : (
                          <i className="ti ti-clock text-warning fs-16" title="Menunggu Process"></i>
                        )}
                      </td>
                      <td className="text-center">
                        {renderAiValidationBadge(doc)}
                      </td>
                      <td className="text-center fw-bold fs-12 text-dark">
                        {doc.ai_result_pass_percentage !== null &&
                        doc.ai_result_pass_percentage !== undefined
                          ? `${Math.round(doc.ai_result_pass_percentage)}%`
                          : "-"}
                      </td>
                      <td className="text-center" style={{ width: "75px", whiteSpace: "nowrap" }}>
                        <Link
                          to={`/peserta/${doc.uid || doc.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                          className="btn btn-xs btn-outline-primary py-0.5 px-2 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                          title="Lihat Detail Peserta"
                        >
                          <i className="ti ti-eye"></i> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && documents.length > 0 && (
          <div className="card-footer bg-white border-top p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
            <span className="text-muted fs-12">
              Menampilkan {(pageParam - 1) * perPageParam + 1} -{" "}
              {Math.min(pageParam * perPageParam, totalItems)} dari{" "}
              {totalItems.toLocaleString("id-ID")} data
            </span>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pageParam === 1}
                onClick={() => handlePageChange(Math.max(pageParam - 1, 1))}
              >
                <i className="ti ti-chevron-left me-1"></i> Prev
              </button>

              <span className="fs-12 fw-semibold px-2">
                Halaman {pageParam} dari {lastPage}
              </span>

              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pageParam >= lastPage}
                onClick={() => handlePageChange(Math.min(pageParam + 1, lastPage))}
              >
                Next <i className="ti ti-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPage;
