import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

const SkemaSertifikasiPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/skema-sertifikasi", {
        params: {
          search,
          page,
          per_page: 15,
        },
      });
      if (res.data?.success) {
        setData(res.data.data);
        setTotalPages(res.data.meta.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch skema sertifikasi", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // If search changes, reset page and fetch
  const handleSearch = (e) => {
    e.preventDefault();
    if (page === 1) {
      fetchData();
    } else {
      setPage(1);
    }
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: "1200px" }}>
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Skema Sertifikasi</h4>
          <p className="text-muted fs-14 mb-0">
            Daftar skema sertifikasi yang digunakan oleh peserta.
          </p>
        </div>
      </div>

      {/* FILTER & DATA */}
      <div className="card project-card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h6 className="fw-bold fs-14 mb-0 text-dark">Data Skema Sertifikasi</h6>
          
          {/* Form Search */}
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ width: "250px" }}>
              <span className="input-group-text bg-light border-0 text-muted">
                <i className="ti ti-search fs-14"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 fs-13 ps-0"
                placeholder="Cari skema / judul..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-sm btn-primary px-3 fs-13">
              Cari
            </button>
          </form>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle table-project mb-0" style={{ fontSize: "13px" }}>
            <thead className="bg-light text-muted">
              <tr>
                <th className="py-3 px-4 text-center" style={{ width: 60, fontWeight: 600 }}>No</th>
                <th className="py-3" style={{ fontWeight: 600 }}>Skema Sertifikasi</th>
                <th className="py-3" style={{ fontWeight: 600 }}>Judul Sertifikasi</th>
                <th className="py-3 text-center" style={{ width: 150, fontWeight: 600 }}>Total Peserta</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                    <span className="ms-2 text-muted fs-13">Memuat data...</span>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 text-center text-muted">{(page - 1) * 15 + index + 1}</td>
                    <td>
                      <div className="fw-semibold text-dark">{item.skema_sertifikasi || "-"}</div>
                    </td>
                    <td>
                      <div className="text-muted">{item.judul_sertifikasi || "-"}</div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-2 py-1 fs-12">
                        {item.total_peserta.toLocaleString("id-ID")} Peserta
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted fs-13">
                    Belum ada data skema sertifikasi yang digunakan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="card-footer bg-white py-3 px-4 border-top d-flex align-items-center justify-content-between">
            <span className="text-muted fs-13">
              Halaman {page} dari {totalPages}
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-light border-0"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <i className="ti ti-chevron-left fs-14"></i>
              </button>
              <button
                className="btn btn-sm btn-light border-0"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <i className="ti ti-chevron-right fs-14"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkemaSertifikasiPage;
