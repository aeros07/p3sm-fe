import React from "react";

const DummyPage = ({ title = "Halaman Dummy", subtitle = "Data dummy untuk pengujian tampilan." }) => {
  const dummyTableData = [
    { id: 1, title: "Konten Dummy 1", category: "Kategori A", status: "Aktif", date: "2026-08-01" },
    { id: 2, title: "Konten Dummy 2", category: "Kategori B", status: "Draft", date: "2026-08-02" },
    { id: 3, title: "Konten Dummy 3", category: "Kategori A", status: "Aktif", date: "2026-08-03" },
    { id: 4, title: "Konten Dummy 4", category: "Kategori C", status: "Non-Aktif", date: "2026-08-04" },
  ];

  return (
    <div className="container-fluid py-3">
      {/* Title & Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fs-20 fw-bold mb-1">{title}</h4>
          <p className="text-muted fs-14 mb-0">{subtitle}</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm">
            <i className="ti ti-plus me-1"></i> Tambah Data (Dummy)
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body">
              <span className="text-muted fs-13">Total Record</span>
              <h3 className="fw-bold my-1 text-primary">128</h3>
              <span className="badge bg-success-subtle text-success fs-12">+12% bulan ini</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body">
              <span className="text-muted fs-13">Status Aktif</span>
              <h3 className="fw-bold my-1 text-success">95</h3>
              <span className="badge bg-primary-subtle text-primary fs-12">74% dari total</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body">
              <span className="text-muted fs-13">Draft</span>
              <h3 className="fw-bold my-1 text-warning">23</h3>
              <span className="badge bg-warning-subtle text-warning fs-12">Perlu review</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body">
              <span className="text-muted fs-13">Kategori</span>
              <h3 className="fw-bold my-1 text-info">10</h3>
              <span className="badge bg-info-subtle text-info fs-12">Terorganisir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fs-16 fw-semibold">Daftar Data</h5>
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Cari data dummy..."
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Judul / Nama</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th style={{ width: "120px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dummyTableData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td className="fw-semibold">{row.title}</td>
                    <td>{row.category}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.status === "Aktif"
                            ? "bg-success"
                            : row.status === "Draft"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-info me-1 py-0 px-2">
                        <i className="ti ti-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-primary me-1 py-0 px-2">
                        <i className="ti ti-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger py-0 px-2">
                        <i className="ti ti-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DummyPage;
