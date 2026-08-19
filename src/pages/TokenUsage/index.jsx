import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

const TokenUsagePage = () => {
  document.title = "Penggunaan Token - AI Document Validation";

  const [tokenList, setTokenList] = useState([]);
  const [summary, setSummary] = useState({
    total_tokens: 0,
    total_ocr_tokens: 0,
    total_validation_tokens: 0,
    total_participants_used: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchTokenUsage = async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/token-usage", {
        params: { search: searchTerm, page: currentPage },
      });
      if (res.data?.success) {
        setTokenList(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data penggunaan token dari API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenUsage(page);
  }, [searchTerm, page]);

  return (
    <div>
      {/* Header & Title */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
            Penggunaan Token AI
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Pantau dan kelola penggunaan token API AI berdasarkan peserta.
          </p>
        </div>
      </div>

      {/* TOP STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(29,78,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-coins text-primary fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Token Keseluruhan</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_tokens.toLocaleString("id-ID")}
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
                  <i className="ti ti-scan text-purple fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Token OCR</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_ocr_tokens.toLocaleString("id-ID")}
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
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-brain text-warning fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Token Validasi AI</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_validation_tokens.toLocaleString("id-ID")}
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
                  <i className="ti ti-users text-success fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Peserta</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">
                    {summary.total_participants_used.toLocaleString("id-ID")} <span className="fs-12 text-muted fw-normal">Orang</span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card project-card mb-4" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2 border-bottom">
          <div>
            <h5 className="fw-bold fs-15 mb-0 text-dark">Daftar Penggunaan Token Peserta</h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="ti ti-search fs-14"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light border-start-0 ps-0 fs-12"
                placeholder="Cari nama peserta / NIK..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0 px-2">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-center" style={{ width: "60px", fontSize: '11px', color: '#9aabbd', fontWeight: 600 }}>NO</th>
                  <th style={{ fontSize: '11px', color: '#9aabbd', fontWeight: 600 }}>NAMA PESERTA</th>
                  <th style={{ fontSize: '11px', color: '#9aabbd', fontWeight: 600 }}>NAMA PROJECT</th>
                  <th className="text-end" style={{ fontSize: '11px', color: '#9aabbd', fontWeight: 600 }}>TOKEN OCR</th>
                  <th className="text-end" style={{ fontSize: '11px', color: '#9aabbd', fontWeight: 600 }}>TOKEN VALIDASI AI</th>
                  <th className="text-end" style={{ fontSize: '11px', color: '#9aabbd', fontWeight: 600 }}>TOTAL TOKEN</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted fs-13">
                      <i className="ti ti-loader-2 ti-spin fs-28 d-block mb-2 text-primary"></i>
                      Memuat data token...
                    </td>
                  </tr>
                ) : tokenList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted fs-13">
                      <i className="ti ti-coin-off fs-32 d-block mb-2 text-secondary"></i>
                      Tidak ada data penggunaan token.
                    </td>
                  </tr>
                ) : (
                  tokenList.map((item, index) => {
                    const ocrTokens = (item.ocr_input_tokens || 0) + (item.ocr_output_tokens || 0);
                    const validationTokens = (item.validation_ai_input_tokens || 0) + (item.validation_ai_output_tokens || 0);
                    const totalTokens = ocrTokens + validationTokens;
                    
                    return (
                      <tr key={item.id}>
                        <td className="text-center fw-semibold text-muted fs-12">
                          {(page - 1) * 15 + index + 1}.
                        </td>
                        <td>
                          <div className="fw-semibold text-dark fs-13 mb-0">{item.name || "-"}</div>
                          <div className="text-muted fs-11">NIK: {item.nik || "-"}</div>
                        </td>
                        <td>
                          <div className="text-dark fs-12 fw-medium">
                            {item.project ? item.project.file_name : "-"}
                          </div>
                        </td>
                        <td className="text-end">
                          <span className="badge bg-purple-subtle text-purple px-2 py-1 fs-12 fw-semibold" style={{ background: 'rgba(168,85,247,0.1)', color: '#9333ea', borderRadius: '6px' }}>
                            {ocrTokens.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="badge bg-warning-subtle text-warning px-2 py-1 fs-12 fw-semibold" style={{ background: 'rgba(234,179,8,0.1)', color: '#ca8a04', borderRadius: '6px' }}>
                            {validationTokens.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="badge bg-primary-subtle text-primary px-2 py-1 fs-12 fw-bold" style={{ background: 'rgba(29,78,216,0.1)', color: '#1d4ed8', borderRadius: '6px' }}>
                            {totalTokens.toLocaleString("id-ID")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 bg-white" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <span className="fs-12 text-muted fw-medium">
                Menampilkan <strong className="text-dark">{tokenList.length > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0} - {(meta.current_page - 1) * meta.per_page + tokenList.length}</strong> dari <strong className="text-dark">{meta.total}</strong> peserta
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
  );
};

export default TokenUsagePage;
