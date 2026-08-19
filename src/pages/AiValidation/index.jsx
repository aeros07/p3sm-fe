import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../Project/project.css";

const AiValidationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Read initial states directly from URL search parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const aiStatusParam = searchParams.get("ai_status") || "";
  const scoreRangeParam = searchParams.get("score_range") || "";

  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState({
    total_participants: 0,
    total_pass: 0,
    total_waiting_review: 0,
    total_fail: 0,
    total_need_fix: 0,
    total_pending: 0,
    avg_score: 0,
    pass_percentage: 0,
    waiting_review_percentage: 0,
    fail_percentage: 0,
    need_fix_percentage: 0,
    pending_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Local search box input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Pagination States
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Rules Detail State
  const [selectedValDoc, setSelectedValDoc] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("rules"); // "rules" or "json"
  const [isJsonCopied, setIsJsonCopied] = useState(false);

  useEffect(() => {
    document.title = "Validasi AI - AI Document Validation";
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchValidationData();
  }, [searchParams]);

  const fetchValidationData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageParam,
        per_page: perPageParam,
        search: searchParam,
        category: categoryParam,
        ai_status: aiStatusParam,
        score_range: scoreRangeParam,
      };

      // Call dedicated lightweight /ai-validation API
      const res = await axiosClient.get("/ai-validation", { params });
      if (res.data?.success) {
        setParticipants(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.meta) {
          setLastPage(res.data.meta.last_page);
          setTotalItems(res.data.meta.total);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data validasi AI:", err);
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

  const handleAiStatusFilterChange = (e) => {
    updateUrlParams({
      ai_status: e.target.value,
      page: 1,
    });
  };

  const handleScoreRangeFilterChange = (e) => {
    updateUrlParams({
      score_range: e.target.value,
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

  const handleCopyJson = (jsonObj) => {
    if (!jsonObj) return;
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setIsJsonCopied(true);
    setTimeout(() => setIsJsonCopied(false), 2000);
  };

  // Helper render Status AI Badge
  const renderAiStatusBadge = (item) => {
    const status = item.ai_result_status;
    if (item.review_status === "pass" || status === "pass") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 fw-bold">
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
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-12 fw-bold">
          Menunggu Review
        </span>
      );
    }
    if (status === "fail" || item.review_status === "fail") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-12 fw-bold">
          Tidak Sesuai (FAIL)
        </span>
      );
    }
    return (
      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fs-12 fw-semibold">
        Belum Diproses
      </span>
    );
  };

  return (
    <div className="container-fluid px-0">
      {/* 1. Header Title */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            Validasi AI
          </h4>
          <span className="text-muted fs-12">Dashboard / Validasi AI</span>
        </div>
      </div>

      {/* 2. Top 6 Metric Summary Cards (Compact, Icon Left) */}
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

        {/* Card 2: Sesuai (PASS) */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Sesuai
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

        {/* Card 3: Tidak Sesuai (FAIL) */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-alert-triangle fs-16"></i>
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

        {/* Card 4: Perlu Perbaikan */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning-subtle text-warning p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-adjustments-horizontal fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Perlu Perbaikan
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_need_fix?.toLocaleString("id-ID")}
                </h5>
                <span className="text-warning fs-10 fw-semibold text-truncate d-block">
                  {summary.need_fix_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Rata-rata Skor AI */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-purple-subtle text-purple p-2 rounded-3 flex-shrink-0"
                style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}
              >
                <i className="ti ti-chart-donut fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Rata-rata Skor AI
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.avg_score} <span className="fs-10 text-muted">/100</span>
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  Skor rata-rata
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Menunggu Review */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-secondary-subtle text-secondary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-clock fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Menunggu Review
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_pending?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  {summary.pending_percentage}% total
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
              value={aiStatusParam}
              onChange={handleAiStatusFilterChange}
            >
              <option value="">Semua Status Validasi</option>
              <option value="pass">Sesuai (PASS)</option>
              <option value="waiting_review">Menunggu Review Manual</option>
              <option value="need_fix">Perlu Perbaikan</option>
              <option value="fail">Tidak Sesuai (FAIL)</option>
              <option value="pending">Belum Diproses</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-2">
            <select
              className="form-select form-select-sm bg-light"
              value={scoreRangeParam}
              onChange={handleScoreRangeFilterChange}
            >
              <option value="">Semua Rentang Skor</option>
              <option value="100">100% Sempurna</option>
              <option value="80_99">80% - 99%</option>
              <option value="60_79">60% - 79%</option>
              <option value="under_60">&lt; 60%</option>
            </select>
          </div>

          <div className="col-12 col-sm-8 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Cari Peserta, NIK, ID Izin..."
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
        </form>
      </div>

      {/* 4. Master Data Table Validasi AI (10 Kolom) */}
      <div className="card project-card border-0 shadow-sm overflow-hidden mb-3 bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark mb-0 fs-13">Daftar Hasil Validasi AI</h6>
          <span className="text-muted fs-12">
            {totalItems.toLocaleString("id-ID")} dokumen ditemukan
          </span>
        </div>

        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0 fs-11" style={{ width: "100%" }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr className="text-muted fs-11 fw-bold text-uppercase align-middle">
                <th style={{ width: "35px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">No</th>
                <th style={{ width: "15%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>ID Izin</th>
                <th style={{ width: "20%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Nama Peserta</th>
                <th style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Jenis Dokumen</th>
                <th className="text-center" style={{ width: "6%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Skor AI</th>
                <th className="text-center" style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Status Validasi</th>
                <th className="text-center" style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Jumlah Temuan</th>
                <th style={{ width: "13%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Terakhir Divalidasi</th>
                <th className="text-center" style={{ width: "115px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <i className="ti ti-loader-2 ti-spin fs-28 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">
                      Memuat hasil evaluasi validasi AI...
                    </span>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <i className="ti ti-cpu-off fs-36 text-muted mb-2 d-block"></i>
                    <span className="fw-semibold text-dark fs-14">
                      Tidak ada data validasi ditemukan
                    </span>
                  </td>
                </tr>
              ) : (
                participants.map((item, idx) => {
                  const score = item.ai_result_pass_percentage;
                  const isPass = item.ai_result_status === "pass";
                  const errorCount = item.error_count || (item.ai_result_json?.error ? item.ai_result_json.error.length : 0);

                  return (
                    <tr key={item.id || item.uid}>
                      <td className="text-center text-muted fs-12">
                        {(pageParam - 1) * perPageParam + idx + 1}
                      </td>
                      <td className="fs-12 text-primary fw-semibold" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {item.id_izin || "-"}
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <div className="d-flex flex-column">
                          <Link
                            to={`/peserta/${item.uid || item.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                            className="fw-bold text-dark text-decoration-none hover-primary fs-12"
                          >
                            {item.name}
                          </Link>
                          <span className="text-muted fs-11">
                            NIK: <code>{item.nik || "-"}</code>
                          </span>
                        </div>
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <span className="badge bg-light text-dark border fs-11">
                          {item.category || "APL01"}
                        </span>
                      </td>
                      <td className="text-center">
                        {score !== null && score !== undefined ? (
                          <span
                            className={`fw-extrabold fs-12 ${
                              isPass ? "text-success" : "text-danger"
                            }`}
                          >
                            {Math.round(score)}%
                          </span>
                        ) : (
                          <span className="text-muted fs-12">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        {renderAiStatusBadge(item)}
                      </td>
                      <td className="text-center">
                        {errorCount > 0 ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle fs-11">
                            {errorCount} Temuan
                          </span>
                        ) : item.ai_result_status === "pass" ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle fs-11">
                            Sempurna
                          </span>
                        ) : (
                          <span className="text-muted fs-12">-</span>
                        )}
                      </td>
                      <td className="text-muted fs-12">
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="text-center" style={{ width: "115px", whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-primary py-0.5 px-1.5 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                            title="Rincian Aturan Validasi"
                            disabled={!item.ai_result_json}
                            onClick={() => {
                              setSelectedValDoc(item);
                              setActiveModalTab("rules");
                            }}
                          >
                            <i className="ti ti-file-analytics"></i> Rules
                          </button>
                          <Link
                            to={`/peserta/${item.uid || item.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                            className="btn btn-xs btn-outline-primary py-0.5 px-1.5 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                            title="Lihat Detail Peserta"
                          >
                            <i className="ti ti-eye"></i> Detail
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {!isLoading && participants.length > 0 && (
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

      {/* 6. Modal Rules Detail Inspector */}
      {selectedValDoc && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <i className="ti ti-cpu fs-20 text-primary"></i>
                  <h5 className="modal-title fw-bold text-dark fs-15">
                    Rincian Aturan Validasi AI: {selectedValDoc.name}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedValDoc(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Modal Tab Switcher */}
                <ul className="nav nav-tabs border-bottom mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeModalTab === "rules" ? "active fw-bold" : ""
                      }`}
                      onClick={() => setActiveModalTab("rules")}
                    >
                      <i className="ti ti-list-check me-1"></i> Rincian 6 Validator
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeModalTab === "json" ? "active fw-bold" : ""
                      }`}
                      onClick={() => setActiveModalTab("json")}
                    >
                      <i className="ti ti-code me-1"></i> Raw Result JSON
                    </button>
                  </li>
                </ul>

                {activeModalTab === "rules" ? (
                  <div className="d-flex flex-column gap-3">
                    {/* Header Score Info */}
                    <div className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                      <div>
                        <span className="text-muted fs-12 d-block">
                          Status Evaluasi AI:
                        </span>
                        {renderAiStatusBadge(selectedValDoc)}
                      </div>
                      <div className="text-end">
                        <span className="text-muted fs-12 d-block">
                          Skor Poin Kelulusan:
                        </span>
                        <h4 className="fw-extrabold text-primary mb-0">
                          {selectedValDoc.ai_result_pass_percentage ?? 0}%
                        </h4>
                        <span className="text-muted fs-11">
                          ({selectedValDoc.ai_result_json?.pass_count || 0}/27 Poin Terpenuhi)
                        </span>
                      </div>
                    </div>

                    {/* Error List Box if Fail */}
                    {(selectedValDoc.ai_result_json?.error || []).length > 0 && (
                      <div className="alert alert-danger border-danger-subtle mb-0 p-3 rounded-3">
                        <h6 className="fw-bold text-danger mb-2 d-flex align-items-center gap-1 fs-13">
                          <i className="ti ti-alert-triangle fs-16"></i> Ditemukan Ketidaksesuaian ({selectedValDoc.ai_result_json.error.length} Poin):
                        </h6>
                        <ul className="mb-0 ps-3 fs-12">
                          {selectedValDoc.ai_result_json.error.map((err, i) => (
                            <li key={i} className="text-danger fw-semibold">{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 6 Validator Cards Grid */}
                    <div className="row g-2">
                      {[
                        { key: "identity", title: "3.1 Identity Validator", desc: "Nama, NIK, Tempat/Tgl Lahir, Gender, Alamat, HP, Pendidikan (9 Poin)" },
                        { key: "certification", title: "3.2 Certification Validator", desc: "Judul Skema, Nomor Skema, Tujuan Asesmen (3 Poin)" },
                        { key: "unit_competency", title: "3.3 Unit Competency Validator", desc: "Kode Unit, Judul Unit, Standar Kerja (4 Poin)" },
                        { key: "attachment", title: "3.4 Attachment Validator", desc: "KTP, Ijazah, Foto 3x4, Asosiasi Jenjang 7-9 (4 Poin)" },
                        { key: "signature", title: "3.5 Signature Validator", desc: "TTD Asesi & TTD Admin LSP (6 Poin)" },
                        { key: "recommendation", title: "3.6 Recommendation Validator", desc: "Status Rekomendasi HARUS DITERIMA (1 Poin)" },
                      ].map((v) => {
                        const isPass = selectedValDoc.ai_result_json?.detail?.[v.key] === "PASS";
                        return (
                          <div key={v.key} className="col-12 col-md-6">
                            <div className={`p-3 rounded-3 border h-100 ${isPass ? "bg-success-subtle border-success-subtle" : "bg-danger-subtle border-danger-subtle"}`}>
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <strong className="fs-12 text-dark">{v.title}</strong>
                                <span className={`badge ${isPass ? "bg-success" : "bg-danger"} fs-11`}>
                                  {isPass ? "PASS" : "FAIL"}
                                </span>
                              </div>
                              <p className="text-muted fs-11 mb-0">{v.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted fs-11 fw-bold text-uppercase">
                        Raw Evaluation JSON from AI Claude:
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary fs-11"
                        onClick={() =>
                          handleCopyJson(selectedValDoc.ai_result_json)
                        }
                      >
                        {isJsonCopied ? (
                          <>
                            <i className="ti ti-check me-1"></i> Copied
                          </>
                        ) : (
                          <>
                            <i className="ti ti-copy me-1"></i> Copy JSON
                          </>
                        )}
                      </button>
                    </div>
                    <pre
                      className="bg-dark text-success p-3 rounded-3 fs-12 overflow-auto"
                      style={{ maxHeight: "350px", fontFamily: "monospace" }}
                    >
                      {JSON.stringify(selectedValDoc.ai_result_json, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm fs-12"
                  onClick={() => setSelectedValDoc(null)}
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiValidationPage;
