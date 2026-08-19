import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "../Project/project.css";
import "./participant.css";
import axiosClient from "../../api/axiosClient";

const ParticipantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get("from");

  const handleBack = () => {
    if (fromParam) {
      navigate(fromParam);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/data-peserta");
    }
  };

  const [participant, setParticipant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchParticipantDetail = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const res = await axiosClient.get(`/participants/${id}`);
        if (res.data?.success) {
          setParticipant(res.data.data);
          document.title = `Detail Peserta: ${res.data.data.name} - AI Document Validation`;
        }
      } catch (err) {
        console.error("Gagal mengambil detail peserta:", err);
        setErrorMsg(err.response?.data?.message || "Data peserta tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchParticipantDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <i className="ti ti-loader-2 ti-spin fs-32 text-primary d-block mb-2"></i>
        <span className="text-muted fs-13">Memuat detail data peserta...</span>
      </div>
    );
  }

  if (errorMsg || !participant) {
    return (
      <div className="card project-card border-0 p-5 text-center my-4">
        <i className="ti ti-alert-triangle text-warning fs-40 mb-3 d-block"></i>
        <h5 className="fw-bold text-dark">Data Peserta Tidak Ditemukan</h5>
        <p className="text-muted fs-13 mb-4">{errorMsg || "ID/UID peserta tidak valid."}</p>
        <div>
          <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleBack}>
            <i className="ti ti-arrow-left fs-16"></i> Kembali
          </button>
        </div>
      </div>
    );
  }

  const aiResult = participant.ai_result_json || {};
  const aiStatus = participant.ai_result_status;
  const hasAiExecuted = Boolean(aiStatus && aiStatus !== "null" && aiStatus !== "");
  const isPass = aiStatus === "pass";
  const isFail = aiStatus === "fail";
  const isWaitingReview = aiStatus === "waiting_review";
  const isNeedRepair = participant.review_status === "need_repair";
  const isReviewPass = participant.review_status === "pass";
  const isReviewFail = participant.review_status === "fail";
  const passScore = participant.ai_result_pass_percentage ?? (aiResult.pass_percentage ?? 0);

  // Parse failure reason array if present
  let parsedFailureReasons = [];
  if (participant.failure_reason) {
    try {
      const parsed = JSON.parse(participant.failure_reason);
      parsedFailureReasons = Array.isArray(parsed) ? parsed : [participant.failure_reason];
    } catch (e) {
      parsedFailureReasons = [participant.failure_reason];
    }
  }

  // Category labels and descriptions
  const categoryLabels = {
    identity: { title: "3.1 Identity Validator", desc: "Nama, NIK, Tempat/Tgl Lahir, Gender, Alamat, HP, Pendidikan" },
    certification: { title: "3.2 Certification Validator", desc: "Judul Skema, Nomor Skema, Tujuan Asesmen" },
    unit_competency: { title: "3.3 Unit Competency Validator", desc: "Kode Unit, Judul Unit, Standar Kompetensi Kerja" },
    attachment: { title: "3.4 Attachment Validator", desc: "Ijazah, KTP, Pas Foto 3x4, Bukti Keanggotaan Asosiasi" },
    signature: { title: "3.5 Signature Validator", desc: "TTD, Tanggal & Nama (Asesi & Admin LSP)" },
    recommendation: { title: "3.6 Recommendation Validator", desc: "Status Rekomendasi HARUS SESUAI" },
  };

  const detailCategories = aiResult.detail || {};

  // Helper to render Pipeline Process Status Stage Badge for detail card
  const renderPipelineStageBadge = () => {
    const isFailedPipeline = participant.is_complete_process && participant.failure_reason && participant.status !== "done";

    if (isFailedPipeline) {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle fs-13 px-3 py-2">
          <i className="ti ti-alert-triangle me-1"></i> GAGAL PROSES ({participant.status})
        </span>
      );
    }

    switch (participant.status) {
      case "done":
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle fs-13 px-3 py-2">
            <i className="ti ti-circle-check me-1"></i> PROSES SELESAI
          </span>
        );
      case "validation_ai":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-13 px-3 py-2">
            <i className="ti ti-brain me-1"></i> VALIDASI AI
          </span>
        );
      case "screening_ocr":
        return (
          <span className="badge bg-purple-subtle text-purple border border-purple-subtle fs-13 px-3 py-2" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}>
            <i className="ti ti-scan me-1"></i> SCREENING OCR
          </span>
        );
      case "rendering_md":
        return (
          <span className="badge bg-info-subtle text-info border border-info-subtle fs-13 px-3 py-2">
            <i className="ti ti-file-code me-1"></i> RENDER MD
          </span>
        );
      case "queued":
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle fs-13 px-3 py-2">
            <i className="ti ti-clock me-1"></i> ANTREAN PROSES
          </span>
        );
    }
  };

  return (
    <div>
      {/* Back Button & Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: "36px", height: "36px" }}
            onClick={handleBack}
            title="Kembali"
          >
            <i className="ti ti-arrow-left fs-18"></i>
          </button>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
              Detail Peserta: {participant.name}
            </h2>
            <span className="text-muted fs-13">
              ID Izin: <strong className="text-dark">{participant.id_izin || "-"}</strong> | Project: <strong className="text-dark">{participant.project?.file_name || "-"}</strong>
            </span>
          </div>
        </div>

        {/* Action Link Buttons */}
        <div className="d-flex align-items-center gap-2">
          {participant.report_url && (
            <a
              href={participant.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary fw-semibold px-3 d-inline-flex align-items-center gap-2 fs-12"
              style={{ borderRadius: "8px" }}
            >
              <i className="ti ti-file-text text-primary fs-16"></i>
              Lihat Report Asli
            </a>
          )}

          {participant.md_s3_url && (
            <a
              href={participant.md_s3_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary fw-semibold px-3 d-inline-flex align-items-center gap-2 fs-12"
              style={{ borderRadius: "8px" }}
            >
              <i className="ti ti-external-link fs-16"></i>
              Lihat File MD (S3)
            </a>
          )}
        </div>
      </div>

      {/* SYSTEM PROCESS FAILURE ALERT (If Pipeline Failed before AI Validation) */}
      {parsedFailureReasons.length > 0 && !hasAiExecuted && (
        <div className="alert alert-warning border-warning-subtle shadow-sm mb-4 p-4" style={{ borderRadius: "12px", backgroundColor: "#fffbe8" }}>
          <h6 className="fw-bold text-warning-emphasis mb-2 d-flex align-items-center gap-2">
            <i className="ti ti-alert-triangle fs-18 text-warning"></i>
            Kegagalan Proses System Pipeline (Tahap: {participant.status}):
          </h6>
          <ul className="mb-0 ps-3">
            {parsedFailureReasons.map((reason, idx) => (
              <li key={idx} className="fw-medium text-dark mb-1 fs-13">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MANUAL REVIEW INFO BANNER / SECTION */}
      {participant.review_status && (
        <div
          className={`card border-0 shadow-sm mb-4 overflow-hidden ${
            isReviewPass
              ? "bg-success-subtle text-success-emphasis border-start border-success border-4"
              : isNeedRepair
              ? "bg-warning-subtle text-warning-emphasis border-start border-warning border-4"
              : "bg-danger-subtle text-danger-emphasis border-start border-danger border-4"
          }`}
          style={{ borderRadius: "12px" }}
        >
          <div className="card-body p-3 px-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="mt-1">
                  {isReviewPass && <i className="ti ti-circle-check fs-24 text-success"></i>}
                  {isNeedRepair && <i className="ti ti-adjustments-horizontal fs-24 text-warning"></i>}
                  {isReviewFail && <i className="ti ti-circle-x fs-24 text-danger"></i>}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="fw-bold mb-0 text-dark fs-14">
                      Hasil Peninjauan Manual (User Review)
                    </h6>
                    {isReviewPass && (
                      <span className="badge bg-success text-white px-2 py-1 fs-11 fw-bold">
                        PASS (Disetujui)
                      </span>
                    )}
                    {isNeedRepair && (
                      <span className="badge bg-warning text-white px-2 py-1 fs-11 fw-bold">
                        PERLU PERBAIKAN (Need Repair)
                      </span>
                    )}
                    {isReviewFail && (
                      <span className="badge bg-danger text-white px-2 py-1 fs-11 fw-bold">
                        FAIL (Ditolak)
                      </span>
                    )}
                  </div>
                  {participant.review_note ? (
                    <p className="mb-0 fs-13 text-dark fw-medium">
                      <strong>Catatan Reviewer:</strong> "{participant.review_note}"
                    </p>
                  ) : (
                    <p className="mb-0 fs-12 text-muted fst-italic">
                      Tidak ada catatan tambahan dari reviewer.
                    </p>
                  )}
                </div>
              </div>

              <div className="text-md-end text-muted fs-11 flex-shrink-0">
                {participant.reviewer?.name && (
                  <div className="fw-semibold text-dark fs-12">
                    <i className="ti ti-user me-1 text-primary"></i>
                    {participant.reviewer.name}
                  </div>
                )}
                {participant.reviewed_at && (
                  <div>
                    <i className="ti ti-calendar me-1"></i>
                    {new Date(participant.reviewed_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 1: Status & Scores Card */}
      <div className="row g-4 mb-4">
        {/* Status Card */}
        <div className="col-12 col-md-5 col-lg-4">
          <div className="card project-card h-100 p-4 d-flex flex-column justify-content-between">
            <div>
              <span className="text-muted fw-semibold d-block mb-2 fs-11 text-uppercase letter-spacing-1">
                {hasAiExecuted ? "STATUS VALIDASI AI" : "STATUS PROSES DOKUMEN"}
              </span>

              <div className="mb-3">
                {!hasAiExecuted ? (
                  renderPipelineStageBadge()
                ) : isReviewPass || isPass ? (
                  <span className="badge-pass-pill fs-13 px-3 py-2">
                    <i className="ti ti-circle-check fs-16"></i> VALIDASI LULUS (PASS)
                  </span>
                ) : isNeedRepair ? (
                  <span className="badge bg-warning text-white fs-13 px-3 py-2 rounded-pill">
                    <i className="ti ti-adjustments-horizontal fs-16"></i> PERLU PERBAIKAN (NEED REPAIR)
                  </span>
                ) : isWaitingReview ? (
                  <span className="badge bg-warning-subtle text-warning border border-warning-subtle fs-13 px-3 py-2">
                    <i className="ti ti-clock-pause fs-16"></i> MENUNGGU REVIEW MANUAL
                  </span>
                ) : (
                  <span className="badge-fail-pill fs-13 px-3 py-2">
                    <i className="ti ti-circle-x fs-16"></i> VALIDASI GAGAL (FAIL)
                  </span>
                )}
              </div>

              {/* Score Progress Bar (Only show if AI processed) */}
              {hasAiExecuted && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted fw-semibold fs-12">
                      Skor Persentase Validasi
                    </span>
                    <span className={`fw-bold fs-5 ${isPass || isReviewPass ? "text-success" : isNeedRepair || isWaitingReview ? "text-warning" : "text-danger"}`}>
                      {passScore}%
                    </span>
                  </div>

                  <div className="score-progress-container" style={{ height: "10px" }}>
                    <div
                      className={`score-progress-bar ${isPass || isReviewPass ? "bar-green" : isNeedRepair || isWaitingReview ? "bar-amber" : "bar-red"}`}
                      style={{ width: `${Math.min(100, Math.max(0, passScore))}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Score Counts Breakdown (Only show if AI processed) */}
            {hasAiExecuted ? (
              <div className="pt-3 mt-4 border-top">
                <div className="row text-center g-2">
                  <div className="col-4">
                    <span className="text-muted d-block fs-11">Total Poin</span>
                    <span className="fw-bold text-dark fs-15">{aiResult.validation_count || 27}</span>
                  </div>
                  <div className="col-4">
                    <span className="text-muted d-block fs-11">Lulus (PASS)</span>
                    <span className="fw-bold text-success fs-15">{aiResult.pass_count || 0}</span>
                  </div>
                  <div className="col-4">
                    <span className="text-muted d-block fs-11">Gagal (FAIL)</span>
                    <span className="fw-bold text-danger fs-15">{aiResult.faild_count ?? (aiResult.failed_count ?? 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 mt-4 border-top text-muted fs-12 text-center">
                <i className="ti ti-info-circle me-1"></i> Dokumentasi belum diproses oleh AI
              </div>
            )}
          </div>
        </div>

        {/* Data Diri Summary Card */}
        <div className="col-12 col-md-7 col-lg-8">
          <div className="card project-card h-100 p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark fs-15 d-flex align-items-center gap-2">
              <i className="ti ti-id-badge-2 text-primary fs-18"></i>
              Identitas Peserta & Sertifikasi
            </h5>

            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">Nama Lengkap</span>
                <span className="fw-semibold text-dark fs-13">{participant.name}</span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">ID Izin</span>
                <span className="fw-semibold text-dark fs-13">{participant.id_izin || "-"}</span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">NIK KTP</span>
                <span className="fw-semibold text-dark fs-13">{participant.nik || "-"}</span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">Provinsi KTP</span>
                <span className="fw-semibold text-dark fs-13">{participant.prov_ktp || "-"}</span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">Jabatan Kerja</span>
                <span className="fw-semibold text-dark fs-13">{participant.jabatan_kerja || "-"}</span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">Jenjang</span>
                <span className="text-primary fs-12">
                  {participant.jenjang ? `Jenjang ${participant.jenjang}` : "-"}
                </span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">LSP</span>
                <span className="fw-semibold text-dark fs-13">{participant.lsp || "-"}</span>
              </div>

              <div className="col-12 col-sm-6">
                <span className="text-muted d-block fs-11">Nama TUK & Provinsi</span>
                <span className="fw-semibold text-dark fs-13">
                  {participant.nama_tuk || "-"} {participant.prov_tuk ? `(${participant.prov_tuk})` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: AI Validation Rule Failure Errors (Only if AI Evaluated & Failed) */}
      {hasAiExecuted && isFail && aiResult.error && Array.isArray(aiResult.error) && aiResult.error.length > 0 && (
        <div className="alert alert-danger border-danger-subtle shadow-sm mb-4 p-4" style={{ borderRadius: "12px" }}>
          <h6 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
            <i className="ti ti-alert-circle fs-18"></i>
            Catatan / Temuan Kegagalan Validasi AI:
          </h6>
          <ul className="mb-0 ps-3">
            {aiResult.error.map((err, idx) => (
              <li key={idx} className="fw-medium text-danger-emphasis mb-1 fs-13">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Row 3: Detail Category Validation Breakdown (ONLY Rendered if AI Validation Executed) */}
      {hasAiExecuted && (
        <div className="card project-card p-4 mb-4">
          <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark fs-15 d-flex align-items-center gap-2">
            <i className="ti ti-list-check text-primary fs-18"></i>
            Rincian Validasi Per Kategori Rules
          </h5>

          <div className="row g-3">
            {Object.keys(categoryLabels).map((catKey) => {
              const catInfo = categoryLabels[catKey];
              const catStatus = (detailCategories[catKey] || "FAIL").toUpperCase();
              const isCatPass = catStatus === "PASS";

              return (
                <div className="col-12 col-md-6" key={catKey}>
                  <div className={`category-check-card ${isCatPass ? "pass-card" : "fail-card"}`}>
                    <div>
                      <span className="category-title d-block">{catInfo.title}</span>
                      <span className="category-subtitle d-block">{catInfo.desc}</span>
                    </div>

                    <div>
                      {isCatPass ? (
                        <span className="badge bg-success text-white px-3 py-2 fw-bold d-inline-flex align-items-center gap-1" style={{ borderRadius: "20px", fontSize: "11px" }}>
                          <i className="ti ti-check fs-12"></i> PASS
                        </span>
                      ) : (
                        <span className="badge bg-danger text-white px-3 py-2 fw-bold d-inline-flex align-items-center gap-1" style={{ borderRadius: "20px", fontSize: "11px" }}>
                          <i className="ti ti-x fs-12"></i> FAIL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantDetailPage;
