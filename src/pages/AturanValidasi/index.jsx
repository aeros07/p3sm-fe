import React, { useState } from 'react';

const AturanValidasiPage = () => {
  const validationRules = [
    { key: "identity", title: "Identity Validator", point: 9, rules: ["Nama", "NIK", "Tempat/Tgl Lahir", "Gender", "Alamat", "HP", "Pendidikan"] },
    { key: "certification", title: "Certification Validator", point: 3, rules: ["Judul Skema", "Nomor Skema", "Tujuan Asesmen"] },
    { key: "unit_competency", title: "Unit Competency Validator", point: 4, rules: ["Kode Unit", "Judul Unit", "Standar Kompetensi Kerja"] },
    { key: "attachment", title: "Attachment Validator", point: 4, rules: ["Ijazah", "KTP", "Pas Foto 3x4", "Asosiasi Jenjang 7-9"] },
    { key: "signature", title: "Signature Validator", point: 6, rules: ["TTD Asesi & TTD Admin LSP "] },
    { key: "recommendation", title: "Recommendation Validator", point: 1, rules: ["Status Rekomendasi HARUS DITERIMA"] },
  ];

  const [filterJenis, setFilterJenis] = useState('');
  const [filterName, setFilterName] = useState('');

  const filteredRules = validationRules
    .filter(rule => filterJenis === '' || rule.key === filterJenis)
    .map(rule => ({
      ...rule,
      rules: rule.rules.filter(item =>
        item.toLowerCase().includes(filterName.toLowerCase())
      )
    }))
    .filter(rule => rule.rules.length > 0);

  const totalAturan = validationRules.reduce((acc, r) => acc + r.rules.length, 0);
  const totalJenis = validationRules.length;
  const totalPoin = validationRules.reduce((acc, r) => acc + r.point, 0);

  let rowNo = 1;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
            Aturan Validasi
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Kelola daftar aturan validasi yang digunakan oleh sistem AI
          </p>
        </div>
      </div>

      {/* TOP STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-4 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(29,78,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-list-check text-primary fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Aturan</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">{totalAturan}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-category text-success fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Jenis Validator</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">{totalJenis}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card project-card h-100 mb-0" style={{ border: '1px solid #eef0f3', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-star text-warning fs-24"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Total Poin</div>
                  <h4 className="fw-bold fs-20 mb-0 text-dark">{totalPoin}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card project-card h-100 mb-0">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2 border-bottom">
              <h5 className="fw-bold fs-15 mb-0 text-dark">Daftar Aturan Validasi AI</h5>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm bg-light text-muted fs-12 border-0"
                  style={{ width: '210px' }}
                  value={filterJenis}
                  onChange={e => setFilterJenis(e.target.value)}
                >
                  <option value="">Semua Jenis Rule</option>
                  {validationRules.map(rule => (
                    <option key={rule.key} value={rule.key}>{rule.title}</option>
                  ))}
                </select>
                <div className="input-group input-group-sm" style={{ width: '220px' }}>
                  <span className="input-group-text bg-light border-end-0 text-muted border-0">
                    <i className="ti ti-search fs-14"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light border-start-0 ps-0 fs-12 border-0"
                    placeholder="Cari nama aturan..."
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle table-project mb-0">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '60px' }}>NO</th>
                      <th>NAMA ATURAN</th>
                      <th>JENIS RULE</th>
                      <th className="text-center" style={{ width: '100px' }}>POIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.length > 0 ? filteredRules.map((rule) =>
                      rule.rules.map((item, itemIdx) => {
                        const currentNo = rowNo++;
                        return (
                          <tr key={`${rule.key}-${itemIdx}`}>
                            <td className="text-center fw-semibold text-muted fs-12">{currentNo}.</td>
                            <td>
                              <div className="fw-semibold text-dark fs-13">{item}</div>
                            </td>
                            {itemIdx === 0 ? (
                              <>
                                <td rowSpan={rule.rules.length} className="align-middle" style={{ borderLeft: '3px solid #e9ecef' }}>
                                  <div className="text-muted fs-13 fw-medium">{rule.title}</div>
                                </td>
                                <td rowSpan={rule.rules.length} className="text-center align-middle" style={{ borderLeft: '1px solid #e9ecef' }}>
                                  <span className="badge bg-primary text-white px-2 py-1 fs-12 fw-bold rounded-pill">
                                    {rule.point}
                                  </span>
                                </td>
                              </>
                            ) : null}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted fs-13">
                          <i className="ti ti-list-search fs-32 d-block mb-2 text-secondary"></i>
                          Tidak ada aturan ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 bg-white" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <span className="fs-12 text-muted fw-medium">
                  Menampilkan <strong className="text-dark">{filteredRules.reduce((a, r) => a + r.rules.length, 0)}</strong> dari <strong className="text-dark">{totalAturan}</strong> aturan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AturanValidasiPage;
