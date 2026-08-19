import React, { useState, useEffect } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import axiosClient from "../../api/axiosClient";
import CustomDatePicker from "../../components/CustomDatePicker";

/* ─── Component ─── */
const LaporanAnalyticPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pass: 0,
    fail: 0,
    pending: 0,
    avgScore: 0,
  });
  const [pieData, setPieData] = useState([]);
  const [barScoreData, setBarScoreData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [searchLaporan, setSearchLaporan] = useState("");

  // Filters
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterProject, setFilterProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [participants, setParticipants] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (filterProject) params.project_id = filterProject;

      const [statsRes, projectsRes, participantsRes] = await Promise.all([
        axiosClient.get("/laporan/stats", { params }),
        axiosClient.get("/projects"),
        axiosClient.get("/participants", { params: { ...params, per_page: 10 } }),
      ]);

      if (statsRes.data?.success) {
        const d = statsRes.data.data;
        setStats({
          total: d.total || 0,
          pass: d.pass || 0,
          fail: d.fail || 0,
          pending: d.pending || 0,
          avgScore: d.avg_score || 0,
        });
        setPieData([
          { name: "PASS (Selesai)", value: d.pass || 0, color: "#22c55e" },
          { name: "FAIL (Tidak Sesuai)", value: d.fail || 0, color: "#ef4444" },
          { name: "Belum Diproses", value: d.pending || 0, color: "#9ca3af" },
        ]);
        setBarScoreData(d.score_ranges || []);
        setTrendData(d.trend || []);
        setCategoryData(d.categories || []);
      }

      if (projectsRes.data?.success) {
        setProjects(projectsRes.data.data || []);
      }

      if (participantsRes.data) {
        setParticipants(participantsRes.data.data || []);
      }
    } catch (err) {
      console.error("Gagal ambil data laporan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fallback mock data for charts when API not ready
  const mockTrend = [
    { day: "Hari 1", PASS: 120, FAIL: 30, Pending: 50 },
    { day: "Hari 2", PASS: 180, FAIL: 40, Pending: 30 },
    { day: "Hari 3", PASS: 250, FAIL: 55, Pending: 45 },
    { day: "Hari 4", PASS: 310, FAIL: 70, Pending: 20 },
    { day: "Hari 5", PASS: 400, FAIL: 90, Pending: 60 },
    { day: "Hari 6", PASS: 480, FAIL: 100, Pending: 40 },
    { day: "Hari 7", PASS: 520, FAIL: 85, Pending: 35 },
  ];

  const mockBarScore = [
    { range: "< 60", count: 0 },
    { range: "60–69", count: 0 },
    { range: "70–79", count: 0 },
    { range: "80–89", count: 0 },
    { range: "90–100", count: 0 },
  ];

  const chartTrend = trendData.length > 0 ? trendData : mockTrend;
  const chartScore = barScoreData.length > 0 ? barScoreData : mockBarScore;

  const statCards = [
    { label: "Total Peserta", value: stats.total.toLocaleString("id-ID"), icon: "ti-users", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "PASS (Lolos)", value: stats.pass.toLocaleString("id-ID"), icon: "ti-circle-check", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "FAIL (Tidak Lolos)", value: stats.fail.toLocaleString("id-ID"), icon: "ti-circle-x", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { label: "Belum Diproses", value: stats.pending.toLocaleString("id-ID"), icon: "ti-clock", color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
    { label: "Rata-rata Skor AI", value: stats.avgScore > 0 ? `${stats.avgScore.toFixed(1)}%` : "-", icon: "ti-gauge", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  ];

  const passRate = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(1) : 0;
  const failRate = stats.total > 0 ? ((stats.fail / stats.total) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>Laporan & Analytic</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>Dashboard / Laporan & Analytic</p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="card border-0 shadow-sm mb-4 px-4 py-3" style={{ borderRadius: "12px" }}>
        <div className="d-flex flex-wrap align-items-end gap-3">
          <div>
            <label className="form-label fs-11 text-muted mb-1 fw-medium">Tanggal Mulai</label>
            <CustomDatePicker className="form-control form-control-sm border-0 bg-light fs-12" value={startDate} onChange={val => setStartDate(val)} />
          </div>
          <div>
            <label className="form-label fs-11 text-muted mb-1 fw-medium">Tanggal Akhir</label>
            <CustomDatePicker className="form-control form-control-sm border-0 bg-light fs-12" value={endDate} onChange={val => setEndDate(val)} />
          </div>
          <div>
            <label className="form-label fs-11 text-muted mb-1 fw-medium">Project</label>
            <select className="form-select form-select-sm border-0 bg-light fs-12" style={{ minWidth: "200px" }} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
              <option value="">Semua Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.file_name || `Project #${p.id}`}</option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2 ms-auto">
            <button className="btn btn-sm btn-light border fs-12 d-flex align-items-center gap-1" onClick={() => { setStartDate(""); setEndDate(""); setFilterProject(""); }}>
              <i className="ti ti-refresh"></i> Reset
            </button>
            <button className="btn btn-sm btn-primary fs-12 fw-semibold d-flex align-items-center gap-1" onClick={fetchData}>
              <i className="ti ti-check"></i> Terapkan
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-muted">
          <i className="ti ti-loader-2 ti-spin fs-32 d-block mb-2 text-primary"></i>
          Memuat data laporan...
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="row g-3 mb-4">
            {statCards.map((s, i) => (
              <div className="col-xl col-lg-4 col-6" key={i}>
                <div className="card project-card mb-0 border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`ti ${s.icon} fs-18`} style={{ color: s.color }}></i>
                      </div>
                      <span className="text-muted fs-11 fw-medium">{s.label}</span>
                    </div>
                    <h4 className="fw-bold fs-20 mb-0 text-dark">{s.value}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts Row ── */}
          <div className="row g-3 mb-4">
            {/* Distribusi Status */}
            <div className="col-xl-6 col-lg-6">
              <div className="card project-card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="fw-bold fs-14 mb-0 text-dark">Distribusi Status Validasi</h6>
                </div>
                <div className="card-body p-3 d-flex align-items-center">
                  <div style={{ width: "50%", height: 180, position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [v.toLocaleString("id-ID"), ""]} contentStyle={{ borderRadius: 8, border: "none", fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fw-bold fs-16 text-dark">{stats.total.toLocaleString("id-ID")}</div>
                      <div className="fs-10 text-muted">Total</div>
                    </div>
                  </div>
                  <div className="flex-fill ps-2 d-flex flex-column gap-2">
                    {pieData.map((e, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-1">
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color }}></div>
                          <span className="fs-11 text-muted">{e.name}</span>
                        </div>
                        <span className="fs-11 fw-bold text-dark">{e.value.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Validasi */}
            <div className="col-xl-6 col-lg-6">
              <div className="card project-card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="fw-bold fs-14 mb-0 text-dark">Ringkasan Validasi</h6>
                </div>
                <div className="card-body p-3">
                  {[
                    { label: "Total Peserta", value: stats.total, icon: "ti-users", color: "primary" },
                    { label: "PASS (Lolos)", value: stats.pass, icon: "ti-circle-check", color: "success" },
                    { label: "FAIL (Tidak Lolos)", value: stats.fail, icon: "ti-circle-x", color: "danger" },
                    { label: "Belum Diproses", value: stats.pending, icon: "ti-clock", color: "secondary" },
                  ].map((r, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom border-opacity-10">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`ti ${r.icon} text-${r.color} fs-15`}></i>
                        <span className="fs-12 text-muted">{r.label}</span>
                      </div>
                      <span className="fs-12 fw-bold text-dark">{r.value.toLocaleString("id-ID")}</span>
                    </div>
                  ))}

                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fs-12 text-muted fw-medium">Pass Rate</span>
                      <span className="fs-12 fw-bold text-success">{passRate}%</span>
                    </div>
                    <div className="progress mb-3" style={{ height: 6, borderRadius: 4 }}>
                      <div className="progress-bar bg-success" style={{ width: `${passRate}%`, borderRadius: 4 }}></div>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fs-12 text-muted fw-medium">Fail Rate</span>
                      <span className="fs-12 fw-bold text-danger">{failRate}%</span>
                    </div>
                    <div className="progress" style={{ height: 6, borderRadius: 4 }}>
                      <div className="progress-bar bg-danger" style={{ width: `${failRate}%`, borderRadius: 4 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Ringkasan Laporan ── */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <div className="card project-card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <h6 className="fw-bold fs-14 mb-0 text-dark">Ringkasan Laporan</h6>
                  <div className="input-group input-group-sm" style={{ width: "200px" }}>
                    <span className="input-group-text bg-light border-0 text-muted"><i className="ti ti-search fs-13"></i></span>
                    <input type="text" className="form-control bg-light border-0 fs-12 ps-0" placeholder="Cari dokumen..." value={searchLaporan} onChange={e => setSearchLaporan(e.target.value)} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle table-project mb-0" style={{ fontSize: "12px" }}>
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3 px-4 text-center" style={{ width: 45 }}>No</th>
                        <th className="py-3">Nama Peserta / NIK</th>
                        <th className="py-3">Project</th>
                        <th className="py-3 text-center">Skor AI</th>
                        <th className="py-3 text-center">Status AI</th>
                        <th className="py-3 text-center">Jenis Dokumen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.filter(p => (p.name || "").toLowerCase().includes(searchLaporan.toLowerCase()) || (p.nik || "").includes(searchLaporan)).map((p, i) => (
                        <tr key={p.id}>
                          <td className="text-center text-muted px-4">{i + 1}</td>
                          <td>
                            <div className="fw-medium text-dark">{p.name || "-"}</div>
                            <div className="fs-11 text-muted">{p.nik || "-"}</div>
                          </td>
                          <td>
                            <div className="text-muted text-truncate" style={{ maxWidth: "150px" }} title={p.project?.file_name}>
                              {p.project?.file_name || "-"}
                            </div>
                          </td>
                          <td className="text-center">
                            {p.ai_result_pass_percentage !== null ? (
                              <span className="fw-bold fs-12">{p.ai_result_pass_percentage}%</span>
                            ) : <span className="text-muted">-</span>}
                          </td>
                          <td className="text-center">
                            {p.ai_result_status === "pass" && <span className="badge bg-success bg-opacity-10 text-success fw-medium fs-11">PASS</span>}
                            {p.ai_result_status === "fail" && <span className="badge bg-danger bg-opacity-10 text-danger fw-medium fs-11">FAIL</span>}
                            {!p.ai_result_status && <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium fs-11">Pending</span>}
                          </td>
                          <td className="text-center">
                            {p.category ? <span className="badge bg-light text-dark border fs-10">{p.category}</span> : <span className="text-muted">-</span>}
                          </td>
                        </tr>
                      ))}
                      {participants.length === 0 && (
                        <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada data dokumen</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default LaporanAnalyticPage;
