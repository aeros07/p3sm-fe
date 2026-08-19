import React, { useState } from "react";
import * as XLSX from 'xlsx';
import CustomDatePicker from "../../components/CustomDatePicker";

const ReportListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data statis untuk prototype
  const participants = [
    { id: 1, name: "Budi Santoso", id_izin: "IZ-101", nik: "3171234567890001", prov_ktp: "DKI JAKARTA", jabatan_kerja: "Ahli K3 Konstruksi", jenjang: "9", project_file: "batch_agustus.xlsx", process_status: "Selesai", ai_status: "PASS", score: 92.5, date: "2026-08-10" },
    { id: 2, name: "Siti Aminah", id_izin: "IZ-102", nik: "3201234567890002", prov_ktp: "JAWA BARAT", jabatan_kerja: "Ahli Teknik Bangunan", jenjang: "8", project_file: "batch_agustus.xlsx", process_status: "Selesai", ai_status: "FAIL", score: 45.2, date: "2026-08-10" },
    { id: 3, name: "Agus Pratama", id_izin: "-", nik: "3301234567890003", prov_ktp: "JAWA TENGAH", jabatan_kerja: "Ahli Mekanikal", jenjang: "7", project_file: "batch_agustus.xlsx", process_status: "Gagal (screening_ocr)", ai_status: "FAIL", score: 0.0, date: "2026-08-09" },
    { id: 4, name: "Rina Wijaya", id_izin: "IZ-104", nik: "3401234567890004", prov_ktp: "DI YOGYAKARTA", jabatan_kerja: "Ahli Elektrikal", jenjang: "9", project_file: "batch_juli.xlsx", process_status: "Selesai", ai_status: "PASS", score: 95.8, date: "2026-08-09" },
    { id: 5, name: "Hendra Gunawan", id_izin: "IZ-105", nik: "3501234567890005", prov_ktp: "JAWA TIMUR", jabatan_kerja: "Ahli K3 Konstruksi", jenjang: "8", project_file: "batch_juli.xlsx", process_status: "Selesai", ai_status: "PASS", score: 88.4, date: "2026-08-08" },
  ];

  const filteredParticipants = participants.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nik.includes(searchTerm);
    const matchStart = startDate ? p.date >= startDate : true;
    const matchEnd = endDate ? p.date <= endDate : true;
    return matchSearch && matchStart && matchEnd;
  });

  const handleExportExcel = () => {
    // Siapkan data untuk diekspor
    const exportData = filteredParticipants.map(p => ({
      "NO": p.id,
      "ID IZIN": p.id_izin || "-",
      "NIK KTP": p.nik,
      "NAMA PESERTA": p.name,
      "PROVINSI KTP": p.prov_ktp,
      "JABATAN KERJA": p.jabatan_kerja || "-",
      "JENJANG": p.jenjang || "-",
      "STATUS AI": p.ai_status,
      "SKOR KELULUSAN (%)": p.score,
      "TANGGAL": p.date
    }));

    // Buat worksheet baru dari array JSON
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Buat workbook baru
    const workbook = XLSX.utils.book_new();
    
    // Tambahkan worksheet ke dalam workbook dengan nama 'Data Peserta'
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peserta");

    // Simpan/Unduh sebagai file .xlsx
    XLSX.writeFile(workbook, "laporan_peserta_dummy.xlsx");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PASS": return <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 fs-11 fw-medium border border-success border-opacity-25 rounded-pill">Lolos (Valid)</span>;
      case "FAIL": return <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1 fs-11 fw-medium border border-danger border-opacity-25 rounded-pill">Gagal (Invalid)</span>;
      default: return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
            Laporan Data Peserta
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Daftar lengkap hasil validasi dokumen peserta
          </p>
        </div>
        <button
          className="btn btn-success d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-sm rounded-3 fw-semibold fs-13"
          onClick={handleExportExcel}
        >
          <i className="ti ti-file-export fs-16"></i> Export Data (Excel)
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="card project-card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2 border-bottom">
          <h5 className="fw-bold fs-15 mb-0 text-dark">Data Peserta Terbaru</h5>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted fs-12 fw-medium">Mulai</span>
              <CustomDatePicker className="form-control form-control-sm fs-12" value={startDate} onChange={val => setStartDate(val)} />
            </div>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted fs-12 fw-medium">Sampai</span>
              <CustomDatePicker className="form-control form-control-sm fs-12" value={endDate} onChange={val => setEndDate(val)} />
            </div>
            <div className="input-group input-group-sm" style={{ minWidth: "320px" }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="ti ti-search fs-14"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light border-start-0 ps-0 fs-12"
                placeholder="Cari nama atau NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle table-project mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-center text-muted fs-12 fw-semibold border-0 py-2 align-middle border-end" rowSpan="2" style={{ width: "50px" }}>NO</th>
                  <th className="text-center text-muted fs-12 fw-bold border-0 py-2 border-bottom border-end" colSpan="4">IDENTITAS PESERTA</th>
                  <th className="text-center text-muted fs-12 fw-bold border-0 py-2 border-bottom border-end" colSpan="2">SERTIFIKASI</th>
                  <th className="text-center text-muted fs-12 fw-semibold border-0 py-2 align-middle border-end" rowSpan="2">STATUS AI</th>
                  <th className="text-center text-muted fs-12 fw-semibold border-0 py-2 align-middle border-end" rowSpan="2" style={{ width: "100px" }}>SKOR (%)</th>
                  <th className="text-center text-muted fs-12 fw-semibold border-0 py-2 align-middle" rowSpan="2">TANGGAL</th>
                </tr>
                <tr>
                  <th className="text-muted fs-11 fw-semibold border-0 py-2 border-end">ID IZIN</th>
                  <th className="text-muted fs-11 fw-semibold border-0 py-2 border-end">NIK KTP</th>
                  <th className="text-muted fs-11 fw-semibold border-0 py-2 border-end">NAMA PESERTA</th>
                  <th className="text-muted fs-11 fw-semibold border-0 py-2 border-end">PROVINSI</th>
                  <th className="text-muted fs-11 fw-semibold border-0 py-2 border-end">JABATAN KERJA</th>
                  <th className="text-muted fs-11 fw-semibold border-0 py-2 border-end">JENJANG</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p, index) => (
                  <tr key={p.id}>
                    <td className="text-center fw-semibold text-muted fs-12 border-end">{index + 1}.</td>
                    
                    <td className="text-dark fs-12 border-end">{p.id_izin || "-"}</td>
                    <td className="text-muted fs-12 border-end">{p.nik}</td>
                    <td className="fw-semibold text-dark fs-12 border-end">{p.name}</td>
                    <td className="text-muted fs-12 border-end">{p.prov_ktp}</td>

                    <td className="text-dark fw-medium fs-12 border-end">{p.jabatan_kerja || "-"}</td>
                    <td className="text-center text-secondary fs-12 border-end">{p.jenjang || "-"}</td>

                    <td className="text-center border-end">
                      {getStatusBadge(p.ai_status)}
                    </td>
                    
                    {/* SKOR (%) */}
                    <td>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold fs-12">{p.score}%</span>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div 
                          className={`progress-bar ${p.ai_status === 'PASS' ? 'bg-success' : 'bg-danger'}`} 
                          style={{ width: `${Math.min(100, Math.max(0, p.score))}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* TANGGAL */}
                    <td className="text-center text-muted fs-12">
                      {p.date}
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

export default ReportListPage;
