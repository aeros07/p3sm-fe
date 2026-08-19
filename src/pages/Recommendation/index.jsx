import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./recommendation.css";
import "../Project/project.css";

const RecommendationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Read initial states directly from URL search parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const recStatusParam = searchParams.get("rec_status") || "";

  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState({
    total_rekomendasi: 0,
    total_waiting_review: 0,
    total_need_repair: 0,
    total_pass: 0,
    total_fail: 0,
    total_reviewed: 0,
    waiting_review_percentage: 0,
    need_repair_percentage: 0,
    pass_percentage: 0,
    fail_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParam);

  // Modal Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    review_status: "pass",
    review_note: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Pagination States
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    document.title = "Rekomendasi AI - AI Document Validation";
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchRecommendationData();
  }, [searchParams]);

  const fetchRecommendationData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageParam,
        per_page: perPageParam,
        search: searchParam,
        category: categoryParam,
        rec_status: recStatusParam,
      };

      const res = await axiosClient.get("/recommendation", { params });
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
      console.error("Gagal memuat data rekomendasi AI:", err);
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

  const handleRecStatusFilterChange = (e) => {
    updateUrlParams({
      rec_status: e.target.value,
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

  // Open Modal Review
  const handleOpenReviewModal = (participant) => {
    setSelectedParticipant(participant);
    setReviewForm({
      review_status: participant.review_status || "pass",
      review_note: participant.review_note || "",
    });
    setShowReviewModal(true);
  };

  // Submit Review
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    setIsSubmittingReview(true);
    try {
      const res = await axiosClient.put(
        `/recommendation/${selectedParticipant.id}/review`,
        reviewForm
      );
      if (res.data?.success) {
        setToastMessage("Hasil review peserta berhasil diperbarui!");
        setShowReviewModal(false);
        fetchRecommendationData();
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Render Status AI Badge
  const renderAiStatusBadge = (item) => {
    if (item.ai_result_status === "pass") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-11 fw-bold">
          <i className="ti ti-robot me-1"></i> PASS (AI)
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-11 fw-bold">
        <i className="ti ti-clock-pause me-1"></i> WAITING REVIEW
      </span>
    );
  };

  // Render Status Review Badge
  const renderReviewStatusBadge = (item) => {
    if (item.review_status === "pass") {
      return (
        <span className="badge bg-success text-white px-2 py-1 fs-11 fw-bold rounded-pill">
          <i className="ti ti-circle-check me-1"></i> PASS
        </span>
      );
    }
    if (item.review_status === "need_repair") {
      return (
        <span className="badge bg-warning text-white px-2 py-1 fs-11 fw-bold rounded-pill">
          <i className="ti ti-adjustments-horizontal me-1"></i> PERLU PERBAIKAN
        </span>
      );
    }
    if (item.review_status === "fail") {
      return (
        <span className="badge bg-danger text-white px-2 py-1 fs-11 fw-bold rounded-pill">
          <i className="ti ti-circle-x me-1"></i> FAIL
        </span>
      );
    }
    return (
      <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 fs-11 fw-semibold rounded-pill">
        Belum Direview
      </span>
    );
  };

  // Prepare Pie Chart Data
  const pieData = [
    { name: "Diterima", count: summary.total_pass || 0, color: "#22c55e" },
    { name: "Perlu Perbaikan", count: summary.total_need_repair || 0, color: "#f59e0b" },
    { name: "Ditolak", count: summary.total_fail || 0, color: "#ef4444" },
    { name: "Menunggu Review", count: summary.total_waiting_review || 0, color: "#6366f1" },
  ];

  return (
    <div className="container-fluid px-0">
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

      {/* Header Title */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            Rekomendasi
          </h4>
          <span className="text-muted fs-12">Dashboard / Rekomendasi</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 — TOP 6 STATS CARDS                                              */}
      {/* ========================================================================= */}
      <div className="row g-2 mb-2">
        {/* Card 1: Total Rekomendasi */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary-subtle text-primary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-file-description fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Total Rekomendasi
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_rekomendasi?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  Dalam sistem
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Rekomendasi Diterima */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Diterima (PASS)
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

        {/* Card 3: Perlu Perbaikan */}
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
                  {summary.total_need_repair?.toLocaleString("id-ID")}
                </h5>
                <span className="text-warning fs-10 fw-semibold text-truncate d-block">
                  {summary.need_repair_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Ditolak / FAIL */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-x fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Ditolak (FAIL)
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_fail?.toLocaleString("id-ID")}
                </h5>
                <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                  {summary.fail_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Menunggu Review */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-purple-subtle text-purple p-2 rounded-3 flex-shrink-0"
                style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "#6366f1" }}
              >
                <i className="ti ti-clock-pause fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Menunggu Review
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_waiting_review?.toLocaleString("id-ID")}
                </h5>
                <span className="text-purple fs-10 fw-semibold text-truncate d-block" style={{ color: "#6366f1" }}>
                  {summary.waiting_review_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Selesai Direview */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-info-subtle text-info p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-user-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Selesai Direview
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_reviewed?.toLocaleString("id-ID")}
                </h5>
                <span className="text-info fs-10 fw-semibold text-truncate d-block">
                  Oleh Reviewer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 — RINGKASAN REKOMENDASI (PIE CHART & STATUS PROGRESS BARS)      */}
      {/* ========================================================================= */}
      <div className="row g-4 mb-4">
        {/* Left Column: Donut Pie Chart */}
        <div className="col-12 col-xl-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold fs-16 mb-0 text-dark" style={{ color: '#1b2f6b' }}>Ringkasan Rekomendasi</h5>
              </div>
              <div className="row align-items-center py-2">
                <div className="col-12 col-sm-5 text-center mb-3 mb-sm-0">
                  <div style={{ height: "140px", position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={62}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Dokumen"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      className="position-absolute top-50 start-50 translate-middle text-center"
                      style={{ pointerEvents: "none" }}
                    >
                      <h3
                        className="fw-bold mb-0 lh-1 fs-20"
                        style={{ color: "#1b2f6b" }}
                      >
                        {summary.total_rekomendasi}
                      </h3>
                      <span className="text-muted fs-10 fw-medium">Total</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-7">
                  <div className="d-flex flex-column gap-2 ps-sm-2">
                    {pieData.map((item, idx) => {
                      const percentage =
                        summary.total_rekomendasi > 0
                          ? ((item.count / summary.total_rekomendasi) * 100).toFixed(1)
                          : 0;
                      return (
                        <div
                          key={idx}
                          className="d-flex align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "4px",
                                backgroundColor: item.color,
                                flexShrink: 0,
                              }}
                            ></div>
                            <span
                              className="fs-13 fw-medium"
                              style={{ color: "#1b2f6b" }}
                            >
                              {item.name}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold fs-13 text-dark">
                              {item.count.toLocaleString("id-ID")}
                            </span>
                            <span className="text-muted fs-12 font-monospace">
                              ({percentage}%)
                            </span>
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

        {/* Right Column: Status Tindak Lanjut Progress Bars */}
        <div className="col-12 col-xl-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold fs-16 mb-0 text-dark" style={{ color: '#1b2f6b' }}>Status Tindak Lanjut</h5>
              </div>
              <div className="d-flex flex-column gap-3 justify-content-center py-2">
                {/* Progress Item 1 */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1 fs-13">
                    <span className="fw-semibold text-dark">Diterima (PASS)</span>
                    <span className="fw-bold text-success">
                      {summary.total_pass?.toLocaleString("id-ID")} ({summary.pass_percentage}%)
                    </span>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "8px", backgroundColor: "#eef0f3" }}
                  >
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${summary.pass_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Item 2 */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1 fs-13">
                    <span className="fw-semibold text-dark">Menunggu Review</span>
                    <span className="fw-bold" style={{ color: "#6366f1" }}>
                      {summary.total_waiting_review?.toLocaleString("id-ID")} ({summary.waiting_review_percentage}%)
                    </span>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "8px", backgroundColor: "#eef0f3" }}
                  >
                    <div
                      className="progress-bar"
                      style={{
                        width: `${summary.waiting_review_percentage}%`,
                        backgroundColor: "#6366f1",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Progress Item 3 */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1 fs-13">
                    <span className="fw-semibold text-dark">Perlu Perbaikan (NEED REPAIR)</span>
                    <span className="fw-bold text-warning">
                      {summary.total_need_repair?.toLocaleString("id-ID")} ({summary.need_repair_percentage}%)
                    </span>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "8px", backgroundColor: "#eef0f3" }}
                  >
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${summary.need_repair_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Item 4 */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1 fs-13">
                    <span className="fw-semibold text-dark">Ditolak (FAIL)</span>
                    <span className="fw-bold text-danger">
                      {summary.total_fail?.toLocaleString("id-ID")} ({summary.fail_percentage}%)
                    </span>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "8px", backgroundColor: "#eef0f3" }}
                  >
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${summary.fail_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3 — FILTER BAR & MASTER DATA TABLE REKOMENDASI                    */}
      {/* ========================================================================= */}
      {/* 3. Filter Bar & Actions (Identik dengan Monitoring Proses) */}
      <div className="card project-card border-0 p-2 px-3 shadow-sm mb-3 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-sm-4 col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              value={recStatusParam}
              onChange={handleRecStatusFilterChange}
            >
              <option value="">Status: Menunggu & Perlu Perbaikan (Default)</option>
              <option value="waiting_review">Status: Menunggu Review</option>
              <option value="need_repair">Status: Perlu Perbaikan (NEED REPAIR)</option>
              <option value="pass">Status: Disetujui (PASS)</option>
              <option value="fail">Status: Ditolak (FAIL)</option>
              <option value="all">Semua Status Peserta</option>
            </select>
          </div>

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

          <div className="col-12 col-sm-8 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Cari ID Izin, Nama Peserta, NIK..."
                value={searchInput}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="col-6 col-md-1 ms-auto">
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

      {/* 4. Master Data Table Rekomendasi (Identik dengan Monitoring Proses) */}
      <div className="card project-card border-0 shadow-sm overflow-hidden mb-3 bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark mb-0 fs-13">Daftar Rekomendasi Hasil Validasi AI</h6>
          <span className="text-muted fs-12">
            {totalItems.toLocaleString("id-ID")} rekomendasi ditemukan
          </span>
        </div>
        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0 fs-11" style={{ width: "100%" }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr className="text-muted fs-11 fw-bold text-uppercase align-middle">
                <th style={{ width: "35px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">No</th>
                <th style={{ width: "22%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>ID Izin / Peserta</th>
                <th style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Dokumen</th>
                <th style={{ width: "25%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Temuan Utama (AI)</th>
                <th className="text-center" style={{ width: "11%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Status AI</th>
                <th className="text-center" style={{ width: "11%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Status Review</th>
                <th style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Tgl Diproses</th>
                <th className="text-center" style={{ width: "115px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <i className="ti ti-loader-2 ti-spin fs-28 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">
                      Memuat data rekomendasi...
                    </span>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <i className="ti ti-bulb-off fs-36 text-muted mb-2 d-block"></i>
                    <span className="fw-semibold text-dark fs-14 d-block">
                      Tidak ada rekomendasi ditemukan
                    </span>
                    <span className="text-muted fs-12">Semua dokumen dengan status ini telah diproses atau tidak ditemukan data.</span>
                  </td>
                </tr>
              ) : (
                participants.map((item, idx) => {
                  const firstError = item.ai_result_json?.error?.[0] || null;
                  const errorCount = item.error_count || (item.ai_result_json?.error ? item.ai_result_json.error.length : 0);
                  const processedDate = item.complete_process_at || item.updated_at;

                  return (
                    <tr key={item.id || item.uid}>
                      <td className="text-center text-muted fs-12">
                        {(pageParam - 1) * perPageParam + idx + 1}
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
                            ID Izin: <code className="text-primary">{item.id_izin || "-"}</code> | NIK: <code>{item.nik || "-"}</code>
                          </span>
                        </div>
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <span className="badge bg-light text-dark border fs-11">
                          {item.category || "APL01"}
                        </span>
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {firstError ? (
                          <div className="d-flex align-items-center gap-1.5 text-danger fs-12">
                            <i className="ti ti-alert-triangle flex-shrink-0 fs-14"></i>
                            <span className="text-truncate" style={{textWrap: "wrap"}} title={firstError}>
                              {firstError} {errorCount > 1 && `(+${errorCount - 1} lainnya)`}
                            </span>
                          </div>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle fs-11">
                            Sempurna (0 Error)
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {renderAiStatusBadge(item)}
                      </td>
                      <td className="text-center">
                        {renderReviewStatusBadge(item)}
                      </td>
                      <td className="text-muted fs-12">
                        {processedDate
                          ? new Date(processedDate).toLocaleString("id-ID", {
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
                          {item.review_status !== "need_repair" && (
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-primary py-0.5 px-1.5 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                              onClick={() => handleOpenReviewModal(item)}
                              title="Lakukan Review Manual"
                            >
                              <i className="ti ti-edit"></i> Review
                            </button>
                          )}
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

        {/* 5. Pagination Footer (Identik dengan Monitoring Proses) */}
        {!isLoading && participants.length > 0 && (
          <div className="card-footer bg-white border-top p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
            <span className="text-muted fs-12">
              Menampilkan {(pageParam - 1) * perPageParam + 1} -{" "}
              {Math.min(pageParam * perPageParam, totalItems)} dari{" "}
              {totalItems.toLocaleString("id-ID")} rekomendasi
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

      {/* MODAL REVIEW MANUAL */}
      {showReviewModal && selectedParticipant && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom py-3 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="icon-box-shape icon-bg-primary-light" style={{ width: "36px", height: "36px" }}>
                      <i className="ti ti-user-check fs-18 text-primary"></i>
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold fs-16 text-dark mb-0">
                        Review Manual Peserta
                      </h5>
                      <span className="text-muted fs-12">
                        {selectedParticipant.name} (ID: {selectedParticipant.id_izin || "-"})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={isSubmittingReview}
                    onClick={() => setShowReviewModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleSaveReview}>
                  <div className="modal-body p-4">
                    {/* Participant Summary Box */}
                    <div className="p-3 bg-light rounded-3 mb-4 border">
                      <div className="row g-2 fs-13">
                        <div className="col-6 col-md-3">
                          <span className="text-muted fs-11 d-block">ID IZIN</span>
                          <span className="fw-semibold text-primary">{selectedParticipant.id_izin || "-"}</span>
                        </div>
                        <div className="col-6 col-md-3">
                          <span className="text-muted fs-11 d-block">NIK</span>
                          <span className="fw-semibold text-dark">{selectedParticipant.nik || "-"}</span>
                        </div>
                        <div className="col-6 col-md-3">
                          <span className="text-muted fs-11 d-block">DOKUMEN</span>
                          <span className="badge bg-secondary text-white fs-11">{selectedParticipant.category || "APL01"}</span>
                        </div>
                        <div className="col-6 col-md-3">
                          <span className="text-muted fs-11 d-block">SKOR AI</span>
                          <span className="fw-bold text-dark">{Math.round(selectedParticipant.ai_result_pass_percentage || 0)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Findings / Errors */}
                    {selectedParticipant.ai_result_json?.error && selectedParticipant.ai_result_json.error.length > 0 && (
                      <div className="mb-4">
                        <label className="form-label fs-13 fw-semibold text-danger d-flex align-items-center gap-1 mb-2">
                          <i className="ti ti-alert-circle fs-16"></i> Catatan Temuan AI ({selectedParticipant.ai_result_json.error.length} Error):
                        </label>
                        <ul className="list-group list-group-flush border rounded-3 overflow-hidden">
                          {selectedParticipant.ai_result_json.error.map((errItem, i) => (
                            <li key={i} className="list-group-item bg-danger-subtle text-danger fs-12 py-2 border-bottom">
                              <i className="ti ti-point me-1"></i> {errItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Keputusan Review Selection */}
                    <div className="mb-4">
                      <label className="form-label fs-13 fw-bold text-dark mb-2">
                        Pilih Keputusan Review Manual <span className="text-danger">*</span>
                      </label>
                      <div className="row g-2">
                        <div className="col-md-4">
                          <label
                            className={`card p-3 border cursor-pointer text-center h-100 ${
                              reviewForm.review_status === "pass"
                                ? "border-success bg-success-subtle shadow-sm"
                                : "bg-white"
                            }`}
                            style={{ borderRadius: "10px", transition: "all 0.15s" }}
                          >
                            <input
                              type="radio"
                              name="review_status"
                              value="pass"
                              className="d-none"
                              checked={reviewForm.review_status === "pass"}
                              onChange={(e) => setReviewForm({ ...reviewForm, review_status: e.target.value })}
                            />
                            <i className="ti ti-circle-check fs-24 text-success mb-1"></i>
                            <div className="fw-bold fs-13 text-success">PASS</div>
                            <span className="text-muted fs-11 mt-1">Dokumen Disetujui</span>
                          </label>
                        </div>

                        <div className="col-md-4">
                          <label
                            className={`card p-3 border cursor-pointer text-center h-100 ${
                              reviewForm.review_status === "need_repair"
                                ? "border-warning bg-warning-subtle shadow-sm"
                                : "bg-white"
                            }`}
                            style={{ borderRadius: "10px", transition: "all 0.15s" }}
                          >
                            <input
                              type="radio"
                              name="review_status"
                              value="need_repair"
                              className="d-none"
                              checked={reviewForm.review_status === "need_repair"}
                              onChange={(e) => setReviewForm({ ...reviewForm, review_status: e.target.value })}
                            />
                            <i className="ti ti-adjustments-horizontal fs-24 text-warning mb-1"></i>
                            <div className="fw-bold fs-13 text-warning">NEED REPAIR</div>
                            <span className="text-muted fs-11 mt-1">Perlu Perbaikan</span>
                          </label>
                        </div>

                        <div className="col-md-4">
                          <label
                            className={`card p-3 border cursor-pointer text-center h-100 ${
                              reviewForm.review_status === "fail"
                                ? "border-danger bg-danger-subtle shadow-sm"
                                : "bg-white"
                            }`}
                            style={{ borderRadius: "10px", transition: "all 0.15s" }}
                          >
                            <input
                              type="radio"
                              name="review_status"
                              value="fail"
                              className="d-none"
                              checked={reviewForm.review_status === "fail"}
                              onChange={(e) => setReviewForm({ ...reviewForm, review_status: e.target.value })}
                            />
                            <i className="ti ti-circle-x fs-24 text-danger mb-1"></i>
                            <div className="fw-bold fs-13 text-danger">FAIL</div>
                            <span className="text-muted fs-11 mt-1">Dokumen Ditolak</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Reviewer */}
                    <div className="mb-2">
                      <label className="form-label fs-13 fw-semibold text-dark">
                        Catatan Reviewer <span className="text-muted fw-normal fs-11">(Opsional)</span>
                      </label>
                      <textarea
                        className="form-control fs-13"
                        rows="3"
                        placeholder="Masukkan catatan pendukung atau instruksi perbaikan untuk peserta ini..."
                        value={reviewForm.review_note}
                        onChange={(e) => setReviewForm({ ...reviewForm, review_note: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="modal-footer bg-light border-top py-2.5 px-4 d-flex align-items-center justify-content-end gap-2">
                    <button
                      type="button"
                      disabled={isSubmittingReview}
                      className="btn btn-outline-secondary btn-sm px-3 fw-medium"
                      onClick={() => setShowReviewModal(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn btn-primary btn-sm px-4 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                    >
                      {isSubmittingReview ? (
                        <><i className="ti ti-loader-2 ti-spin fs-14"></i> Menyimpan...</>
                      ) : (
                        <><i className="ti ti-device-floppy fs-14"></i> Simpan Hasil Review</>
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

export default RecommendationPage;
