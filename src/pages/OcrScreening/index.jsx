import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../Project/project.css";

const OcrScreeningPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Read initial states from URL search parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const ocrStatusParam = searchParams.get("ocr_status") || "";
  const aiStatusParam = searchParams.get("ai_status") || "";

  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState({
    total_participants: 0,
    total_ocr_success: 0,
    total_ocr_failed: 0,
    total_ocr_pending: 0,
    total_ai_analyzed: 0,
    total_ai_pending: 0,
    ocr_success_percentage: 0,
    ocr_failed_percentage: 0,
    ocr_pending_percentage: 0,
    ai_analyzed_percentage: 0,
    ai_pending_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Local search box input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Pagination States
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State for Inspector
  const [selectedOcrDoc, setSelectedOcrDoc] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("cards"); // "cards" or "json"
  const [isJsonCopied, setIsJsonCopied] = useState(false);

  useEffect(() => {
    document.title = "Screening OCR AI - AI Document Validation";
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchOcrData();
  }, [searchParams]);

  const fetchOcrData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageParam,
        per_page: perPageParam,
        search: searchParam,
        category: categoryParam,
        ocr_status: ocrStatusParam,
        ai_status: aiStatusParam,
      };

      // Call dedicated lightweight /ocr-screening API
      const res = await axiosClient.get("/ocr-screening", { params });
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
      console.error("Gagal memuat data screening OCR:", err);
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

  const handleOcrStatusFilterChange = (e) => {
    updateUrlParams({
      ocr_status: e.target.value,
      page: 1,
    });
  };

  const handleAiStatusFilterChange = (e) => {
    updateUrlParams({
      ai_status: e.target.value,
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

  // Helper render Status OCR Badge
  const renderOcrStatusBadge = (item) => {
    if (item.has_ocr_data || item.extracted_ocr_data) {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 fw-semibold">
          Berhasil
        </span>
      );
    }
    if (item.status === "screening_ocr" && item.failure_reason) {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-12 fw-semibold">
          Gagal
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-12 fw-semibold">
        Belum
      </span>
    );
  };

  // Helper render Status AI Badge
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
        Menunggu
      </span>
    );
  };

  // Helper render Rekomendasi LSP Badge
  const renderRecommendationBadge = (recommend) => {
    const recStr = String(recommend || "").toUpperCase();
    if (recStr.includes("DITERIMA") && !recStr.includes("TIDAK")) {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 fw-semibold">
          <i className="ti ti-check me-1"></i> DITERIMA
        </span>
      );
    }
    if (recStr.includes("TIDAK DITERIMA")) {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-12 fw-semibold">
          <i className="ti ti-x me-1"></i> TIDAK DITERIMA
        </span>
      );
    }
    return (
      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fs-12 fw-semibold">
        -
      </span>
    );
  };

  // Helper render Signature Badge
  const renderSignatureBadge = (ttdData) => {
    if (!ttdData || !ttdData["Tipe TTD"] || ttdData["Tipe TTD"] === "-") {
      return <span className="badge bg-secondary-subtle text-secondary fs-12">-</span>;
    }
    if (ttdData["Tipe TTD"] === "QR Code") {
      return (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-12">
          <i className="ti ti-qrcode me-1"></i> QR Code
        </span>
      );
    }
    return (
      <span className="badge bg-info-subtle text-info border border-info-subtle fs-12">
        <i className="ti ti-pencil me-1"></i> Biasa
      </span>
    );
  };

  return (
    <div className="container-fluid px-0">
      {/* 1. Header Title */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            Screening OCR AI
          </h4>
          <span className="text-muted fs-12">Dashboard / Screening OCR AI</span>
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

        {/* Card 2: Berhasil OCR */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-scan fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Berhasil OCR
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_ocr_success?.toLocaleString("id-ID")}
                </h5>
                <span className="text-success fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-up-right me-1"></i>{summary.ocr_success_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Gagal OCR */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-alert-triangle fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Gagal OCR
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_ocr_failed?.toLocaleString("id-ID")}
                </h5>
                <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-down-right me-1"></i>{summary.ocr_failed_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Belum OCR */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-secondary-subtle text-secondary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-clock fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Belum OCR
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_ocr_pending?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  {summary.ocr_pending_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Sudah AI Analysis */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-purple-subtle text-purple p-2 rounded-3 flex-shrink-0"
                style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}
              >
                <i className="ti ti-cpu fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Sudah AI Analysis
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_ai_analyzed?.toLocaleString("id-ID")}
                </h5>
                <span className="text-success fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-up-right me-1"></i>{summary.ai_analyzed_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Menunggu AI */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning-subtle text-warning p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-hourglass fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Menunggu AI
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_ai_pending?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  {summary.ai_pending_percentage}% total
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
              value={ocrStatusParam}
              onChange={handleOcrStatusFilterChange}
            >
              <option value="">Semua Status OCR</option>
              <option value="berhasil">OCR Berhasil</option>
              <option value="gagal">OCR Gagal</option>
              <option value="belum">Belum OCR</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-2">
            <select
              className="form-select form-select-sm bg-light"
              value={aiStatusParam}
              onChange={handleAiStatusFilterChange}
            >
              <option value="">Semua Status AI</option>
              <option value="pass">Sesuai (PASS)</option>
              <option value="waiting_review">Menunggu Review Manual</option>
              <option value="fail">Tidak Sesuai (FAIL)</option>
              <option value="pending">Menunggu AI</option>
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

      {/* 4. Master Data Table OCR (11 Kolom) */}
      <div className="card project-card border-0 shadow-sm overflow-hidden mb-3 bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark mb-0 fs-13">Daftar Dokumen Screening OCR</h6>
          <span className="text-muted fs-12">
            {totalItems.toLocaleString("id-ID")} dokumen ditemukan
          </span>
        </div>

        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0 fs-11" style={{ width: "100%" }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr className="text-muted fs-11 fw-bold text-uppercase align-middle">
                <th style={{ width: "35px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">No</th>
                <th style={{ width: "14%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>ID Izin</th>
                <th style={{ width: "17%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Nama Peserta</th>
                <th style={{ width: "11%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Jenis Dokumen</th>
                <th style={{ width: "11%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Tanggal Upload</th>
                <th className="text-center" style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Link</th>
                <th className="text-center" style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Buka</th>
                <th className="text-center" style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>OCR</th>
                <th className="text-center" style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Status AI</th>
                <th className="text-center" style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Skor AI</th>
                <th className="text-center" style={{ width: "110px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <i className="ti ti-loader-2 ti-spin fs-28 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">
                      Memuat hasil ekstraksi data OCR AI...
                    </span>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <i className="ti ti-scan-off fs-36 text-muted mb-2 d-block"></i>
                    <span className="fw-semibold text-dark fs-14">
                      Tidak ada data OCR ditemukan
                    </span>
                  </td>
                </tr>
              ) : (
                participants.map((item, idx) => {
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
                      <td className="text-muted fs-12">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="text-center">
                        {item.report_url ? (
                          <a
                            href={item.report_url}
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
                        {item.md_s3_url ? (
                          <a
                            href={item.md_s3_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success"
                            title="Buka MD S3 File"
                          >
                            <i className="ti ti-circle-check text-success fs-16"></i>
                          </a>
                        ) : item.is_complete_process ? (
                          <i className="ti ti-circle-x text-danger fs-16" title="Gagal Render MD"></i>
                        ) : (
                          <i className="ti ti-clock text-warning fs-16" title="Menunggu Proses"></i>
                        )}
                      </td>
                      <td className="text-center">
                        {renderOcrStatusBadge(item)}
                      </td>
                      <td className="text-center">
                        {renderAiValidationBadge(item)}
                      </td>
                      <td className="text-center fw-bold fs-12 text-dark">
                        {item.ai_result_pass_percentage !== null &&
                        item.ai_result_pass_percentage !== undefined
                          ? `${Math.round(item.ai_result_pass_percentage)}%`
                          : "-"}
                      </td>
                      <td className="text-center" style={{ width: "110px", whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-purple py-0.5 px-1.5 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                            style={{ borderColor: "#c084fc", color: "#7e22ce" }}
                            title="Inspeksi JSON OCR"
                            disabled={!item.extracted_ocr_data}
                            onClick={() => {
                              setSelectedOcrDoc(item);
                              setActiveModalTab("cards");
                            }}
                          >
                            <i className="ti ti-scan"></i> OCR
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

      {/* 6. Modal Inspector JSON & Cards OCR */}
      {selectedOcrDoc && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <i
                    className="ti ti-scan fs-20 text-purple"
                    style={{ color: "#7e22ce" }}
                  ></i>
                  <h5 className="modal-title fw-bold text-dark fs-15">
                    Hasil Ekstraksi OCR: {selectedOcrDoc.name}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOcrDoc(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Modal Tab Switcher */}
                <ul className="nav nav-tabs border-bottom mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeModalTab === "cards" ? "active fw-bold" : ""
                      }`}
                      onClick={() => setActiveModalTab("cards")}
                    >
                      <i className="ti ti-layout-grid me-1"></i> Tampilan Terstruktur
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeModalTab === "json" ? "active fw-bold" : ""
                      }`}
                      onClick={() => setActiveModalTab("json")}
                    >
                      <i className="ti ti-code me-1"></i> Raw JSON Code
                    </button>
                  </li>
                </ul>

                {activeModalTab === "cards" ? (
                  <div className="d-flex flex-column gap-3">
                    {/* Data Pribadi Card */}
                    <div className="border rounded-3 p-3 bg-light">
                      <h6 className="fw-bold text-primary mb-2 border-bottom pb-2 d-flex align-items-center gap-2 fs-13">
                        <i className="ti ti-user"></i> 1. Data Pribadi
                      </h6>
                      <div className="row g-2 fs-12">
                        {Object.entries(
                          selectedOcrDoc.extracted_ocr_data?.["Data Pribadi"] || {}
                        ).map(([key, val]) => (
                          <div key={key} className="col-12 col-sm-6">
                            <span className="text-muted d-block fs-11">{key}:</span>
                            <strong className="text-dark">{val || "-"}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data Sertifikasi Card */}
                    <div className="border rounded-3 p-3 bg-light">
                      <h6 className="fw-bold text-primary mb-2 border-bottom pb-2 d-flex align-items-center gap-2 fs-13">
                        <i className="ti ti-certificate"></i> 2. Data Sertifikasi
                      </h6>
                      <div className="row g-2 fs-12">
                        {Object.entries(
                          selectedOcrDoc.extracted_ocr_data?.["Data Sertifikasi"] || {}
                        ).map(([key, val]) => (
                          <div key={key} className="col-12 col-sm-6">
                            <span className="text-muted d-block fs-11">{key}:</span>
                            <strong className="text-dark">{val || "-"}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bukti Kelengkapan & Rekomendasi */}
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="border rounded-3 p-3 bg-light h-100">
                          <h6 className="fw-bold text-primary mb-2 border-bottom pb-2 d-flex align-items-center gap-2 fs-13">
                            <i className="ti ti-checkbox"></i> 3. Bukti Kelengkapan [✓]
                          </h6>
                          <div className="d-flex flex-wrap gap-1 mt-2">
                            {(
                              selectedOcrDoc.extracted_ocr_data?.["Bukti Kelengkapan"] || []
                            ).length > 0 ? (
                              selectedOcrDoc.extracted_ocr_data[
                                "Bukti Kelengkapan"
                              ].map((item, i) => (
                                <span
                                  key={i}
                                  className="badge bg-success-subtle text-success border border-success-subtle fs-11 p-2"
                                >
                                  <i className="ti ti-check me-1"></i> {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted fs-12">
                                Tidak ada dokumen tercentang
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded-3 p-3 bg-light h-100">
                          <h6 className="fw-bold text-primary mb-2 border-bottom pb-2 d-flex align-items-center gap-2 fs-13">
                            <i className="ti ti-thumb-up"></i> 4. Rekomendasi &amp; TTD
                          </h6>
                          <div className="fs-12 d-flex flex-column gap-2">
                            <div>
                              <span className="text-muted fs-11 d-block">
                                Rekomendasi LSP:
                              </span>
                              {renderRecommendationBadge(
                                selectedOcrDoc.extracted_ocr_data?.[
                                  "Rekomendasi LSP"
                                ]
                              )}
                            </div>
                            <div className="border-top pt-2">
                              <span className="text-muted fs-11 d-block">
                                TTD Asesi:
                              </span>
                              <strong className="text-dark me-2">
                                {selectedOcrDoc.extracted_ocr_data?.["TTD Asesi"]?.[
                                  "Tanggal"
                                ] || "-"}
                              </strong>
                              {renderSignatureBadge(
                                selectedOcrDoc.extracted_ocr_data?.["TTD Asesi"]
                              )}
                            </div>
                            <div className="border-top pt-2">
                              <span className="text-muted fs-11 d-block">
                                TTD Pemohon (Admin LSP):
                              </span>
                              <strong className="text-dark me-2">
                                {selectedOcrDoc.extracted_ocr_data?.[
                                  "TTD Pemohon"
                                ]?.["Tanggal"] || "-"}
                              </strong>
                              {renderSignatureBadge(
                                selectedOcrDoc.extracted_ocr_data?.["TTD Pemohon"]
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted fs-11 fw-bold text-uppercase">
                        Raw JSON Response from AI Claude:
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary fs-11"
                        onClick={() =>
                          handleCopyJson(selectedOcrDoc.extracted_ocr_data)
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
                      {JSON.stringify(
                        selectedOcrDoc.extracted_ocr_data,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm fs-12"
                  onClick={() => setSelectedOcrDoc(null)}
                >
                  Tutup Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrScreeningPage;
