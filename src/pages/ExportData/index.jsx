import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import CustomDatePicker from "../../components/CustomDatePicker";

const ExportDataPage = () => {
  const [activeFormat, setActiveFormat] = useState("Excel");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [compressFile, setCompressFile] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);

  // Form State
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [projects, setProjects] = useState([]);
  const [projectSource, setProjectSource] = useState("");
  const [periodStart, setPeriodStart] = useState(formatDate(oneMonthAgo));
  const [periodEnd, setPeriodEnd] = useState(formatDate(today));
  const [aiStatus, setAiStatus] = useState("Semua Status");
  const [participantName, setParticipantName] = useState("");
  const [participantNik, setParticipantNik] = useState("");

  // Loading State
  const [isExporting, setIsExporting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // History state
  const [exportHistory, setExportHistory] = useState([]);
  const [exportStats, setExportStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0, totalRows: '0', totalFileSize: '0 MB' });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLastPage, setHistoryLastPage] = useState(1);
  
  const [previewData, setPreviewData] = useState([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewLastPage, setPreviewLastPage] = useState(1);
  const [previewPerPage, setPreviewPerPage] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, [historyPage]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axiosClient.get('/projects');
      setProjects(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // When filters change, reset preview page to 1
  useEffect(() => {
    setPreviewPage(1);
  }, [projectSource, periodStart, periodEnd, aiStatus, participantName, participantNik, previewPerPage]);

  useEffect(() => {
    fetchPreview();
  }, [previewPage, projectSource, periodStart, periodEnd, aiStatus, participantName, participantNik, previewPerPage]);

  const fetchPreview = async () => {
    try {
      const payload = {
        project_id: projectSource || '',
        period_start: periodStart,
        period_end: periodEnd,
        ai_status: aiStatus === 'Semua Status' ? '' : aiStatus,
        participant_name: participantName,
        nik: participantNik,
        page: previewPage,
        per_page: previewPerPage
      };
      const response = await axiosClient.get('/exports/preview', { params: payload });
      setPreviewData(response.data.data || []);
      setPreviewTotal(response.data.total || 0);
      setPreviewLastPage(response.data.last_page || 1);
    } catch (error) {
      console.error("Error fetching preview:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axiosClient.get('/exports/history', { params: { page: historyPage, per_page: 10 } });
      const history = response.data.history?.data || [];
      setExportHistory(history);
      setHistoryLastPage(response.data.history?.last_page || 1);

      const stats = response.data.stats || { total: 0, completed: 0, processing: 0, failed: 0, totalRows: 0, totalFileSize: '0 MB' };
      setExportStats({
        total: stats.total,
        completed: stats.completed,
        processing: stats.processing,
        failed: stats.failed,
        totalRows: stats.totalRows?.toLocaleString('id-ID') || '0',
        totalFileSize: stats.totalFileSize,
      });
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const getProjectName = (item) => {
    if (!item.filters || !item.filters.project_id) {
      return "Semua Project";
    }
    const project = projects.find(p => p.id === parseInt(item.filters.project_id) || p.id === item.filters.project_id);
    return project ? (project.name || project.file_name) : "Project Tidak Diketahui";
  };

  const handleExport = async () => {
    setShowExportConfirm(false);
    setIsExporting(true);
    try {
      const payload = {
        project_id: projectSource,
        period_start: periodStart,
        period_end: periodEnd,
        ai_status: aiStatus === 'Semua Status' ? '' : aiStatus,
        format: activeFormat,
        include_header: includeHeader,
        include_summary: includeSummary,
        compress: compressFile
      };
      await axiosClient.post('/exports/generate', payload);
      alert("Sukses! File export sedang di-generate di background.");
      fetchHistory();
    } catch (error) {
      alert("Gagal menginisiasi export.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSchedule = async () => {
    setShowScheduleConfirm(false);
    setShowSchedule(false);
    setIsScheduling(true);
    try {
      const payload = {
        project_id: projectSource,
        period_start: periodStart,
        period_end: periodEnd,
        ai_status: aiStatus === 'Semua Status' ? '' : aiStatus,
        format: activeFormat,
        scheduled_at: scheduleDateTime
      };
      await axiosClient.post('/exports/schedule', payload);
      alert(`Sukses! Export dijadwalkan pada ${new Date(scheduleDateTime).toLocaleString('id-ID')}`);
      fetchHistory();
    } catch (error) {
      alert("Gagal menjadwalkan export.");
    } finally {
      setIsScheduling(false);
    }
  };

  const renderPageNumbers = (currentPage, lastPage, setPage) => {
    let pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(lastPage, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button key={1} className="btn btn-sm btn-light border-0" onClick={() => setPage(1)}>1</button>
      );
      if (startPage > 2) pages.push(<span key="ellipsis1" className="px-1 text-muted">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-light border-0'}`} 
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) pages.push(<span key="ellipsis2" className="px-1 text-muted">...</span>);
      pages.push(
        <button key={lastPage} className="btn btn-sm btn-light border-0" onClick={() => setPage(lastPage)}>{lastPage}</button>
      );
    }

    return pages;
  };

  return (
    <div className="container-fluid py-4">

      {/* ── MODAL KONFIRMASI EXPORT ── */}
      {showExportConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 9999 }}
          onClick={() => setShowExportConfirm(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ maxWidth: '420px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="text-center mb-3">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '60px', height: '60px' }}>
                <i className="ti ti-file-export text-primary fs-28"></i>
              </div>
            </div>

            {/* Title */}
            <h5 className="fw-bold text-dark text-center mb-1">Konfirmasi Export Data</h5>
            <p className="text-muted fs-13 text-center mb-4">Apakah Anda yakin ingin mengeksport data dengan pengaturan berikut?</p>

            {/* Summary */}
            <div className="bg-light rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="fs-12 text-muted">Sumber Project</span>
                <span className="fs-12 fw-medium text-dark">{projects.find(p => p.id == projectSource)?.name || '-'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="fs-12 text-muted">Periode</span>
                <span className="fs-12 fw-medium text-dark">{periodStart} s/d {periodEnd}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="fs-12 text-muted">Format</span>
                <span className="fs-12 fw-medium text-dark">{activeFormat} (.{activeFormat === 'Excel' ? 'xlsx' : activeFormat.toLowerCase()})</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="fs-12 text-muted">Estimasi Data</span>
                <span className="fs-12 fw-medium text-dark">~128.654 baris</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-light w-50 py-2 fw-medium fs-13 border rounded-3"
                onClick={() => setShowExportConfirm(false)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary w-50 py-2 fw-semibold fs-13 rounded-3 d-flex align-items-center justify-content-center gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? <span className="spinner-border spinner-border-sm"></span> : <i className="ti ti-download"></i>}
                {isExporting ? 'Memproses...' : 'Ya, Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI JADWAL ── */}
      {showScheduleConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 9999 }}
          onClick={() => setShowScheduleConfirm(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ maxWidth: '420px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="text-center mb-3">
              <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle" style={{ width: '60px', height: '60px' }}>
                <i className="ti ti-calendar-time text-warning fs-28"></i>
              </div>
            </div>

            {/* Title */}
            <h5 className="fw-bold text-dark text-center mb-1">Konfirmasi Jadwal Export</h5>
            <p className="text-muted fs-13 text-center mb-4">Export akan dijalankan secara otomatis pada waktu yang Anda tentukan.</p>

            {/* Summary */}
            <div className="bg-light rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="fs-12 text-muted">Sumber Project</span>
                <span className="fs-12 fw-medium text-dark">{projects.find(p => p.id == projectSource)?.name || '-'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="fs-12 text-muted">Format</span>
                <span className="fs-12 fw-medium text-dark">{activeFormat} (.{activeFormat === 'Excel' ? 'xlsx' : activeFormat.toLowerCase()})</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="fs-12 text-muted d-flex align-items-center gap-1"><i className="ti ti-clock text-warning"></i> Waktu Eksekusi</span>
                <span className="fs-12 fw-semibold text-warning text-end">
                  {scheduleDateTime ? new Date(scheduleDateTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '-'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-light w-50 py-2 fw-medium fs-13 border rounded-3"
                onClick={() => setShowScheduleConfirm(false)}
              >
                Batal
              </button>
              <button
                className="btn btn-warning w-50 py-2 fw-semibold fs-13 rounded-3 d-flex align-items-center justify-content-center gap-2 text-dark"
                onClick={handleSchedule}
                disabled={isScheduling}
              >
                {isScheduling ? <span className="spinner-border spinner-border-sm"></span> : <i className="ti ti-send"></i>}
                {isScheduling ? 'Memproses...' : 'Ya, Jadwalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "20px", color: "#1b2f6b", margin: 0 }}>
            Export Data
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9aabbd" }}>
            Dashboard / Export Data
          </p>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Export', value: exportStats.total, icon: 'ti-file-export', color: 'primary' },
          { label: 'Selesai', value: exportStats.completed, icon: 'ti-circle-check', color: 'success' },
          { label: 'Proses & Pending', value: exportStats.processing, icon: 'ti-clock', color: 'warning' },
          { label: 'Gagal', value: exportStats.failed, icon: 'ti-circle-x', color: 'danger' },
          { label: 'Total Data', value: exportStats.totalRows, icon: 'ti-database', color: 'info' },
          { label: 'Ukuran File', value: exportStats.totalFileSize, icon: 'ti-file-analytics', color: 'secondary' },
        ].map((stat, i) => (
          <div className="col-xl-2 col-lg-4 col-6" key={i}>
            <div className="card project-card mb-0 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
              <div className="card-body p-2 text-center" style={{ minWidth: 0 }}>
                <div
                  className={`bg-${stat.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2`}
                  style={{ width: '36px', height: '36px', flexShrink: 0 }}
                >
                  <i className={`ti ${stat.icon} text-${stat.color} fs-16`}></i>
                </div>
                <div className="text-muted fw-medium mb-1" style={{ fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</div>
                <div className="fw-bold text-dark" style={{ fontSize: '15px', lineHeight: 1.2, wordBreak: 'break-word' }}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM AND SIDEBAR SECTION */}
      <div className="row g-4 mb-4">
        {/* Main Form Area */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4 d-flex flex-column h-100">

              {/* Step 1: Sumber Project & Filter */}
              <div className="mb-4 pb-4 border-bottom">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-12" style={{ width: '22px', height: '22px', flexShrink: 0 }}>1</div>
                  <h6 className="fw-bold fs-14 text-dark mb-0">Pilih Sumber & Filter Data</h6>
                </div>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fs-12 fw-medium text-muted">Sumber Project</label>
                    <select className="form-select border-0 bg-light fs-13" value={projectSource} onChange={(e) => setProjectSource(e.target.value)}>
                      <option value="">Pilih Project</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>{proj.file_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fs-12 fw-medium text-muted">Periode</label>
                    <div className="d-flex align-items-center gap-2">
                      <div className="input-group">
                        <CustomDatePicker className="form-control border-0 bg-light fs-13" value={periodStart} onChange={(val) => setPeriodStart(val)} />
                      </div>
                      <span className="text-muted fw-medium">—</span>
                      <div className="input-group">
                        <CustomDatePicker className="form-control border-0 bg-light fs-13" value={periodEnd} onChange={(val) => setPeriodEnd(val)} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fs-12 fw-medium text-muted">Status Validasi AI</label>
                    <select className="form-select border-0 bg-light fs-13" value={aiStatus} onChange={(e) => setAiStatus(e.target.value)}>
                      <option value="Semua Status">Semua Status</option>
                      <option value="pass">PASS</option>
                      <option value="fail">FAIL</option>
                      <option value="proses">Proses</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fs-12 fw-medium text-muted">Nama Peserta</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light text-muted"><i className="ti ti-user"></i></span>
                      <input type="text" className="form-control border-0 bg-light fs-13" placeholder="Masukkan nama peserta..." value={participantName} onChange={(e) => setParticipantName(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fs-12 fw-medium text-muted">NIK</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light text-muted"><i className="ti ti-id-badge"></i></span>
                      <input type="text" className="form-control border-0 bg-light fs-13" placeholder="Masukkan NIK peserta..." value={participantNik} onChange={(e) => setParticipantNik(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Format & Opsi */}
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-12" style={{ width: '22px', height: '22px', flexShrink: 0 }}>2</div>
                  <h6 className="fw-bold fs-14 text-dark mb-0">Pilih Format Export</h6>
                </div>
                <div className="row g-4 align-items-start">
                  {/* Format Cards */}
                  <div className="col-auto">
                    <label className="form-label fs-12 fw-medium text-muted mb-2">Format File</label>
                    <div className="d-flex gap-2">
                      <div
                        className={`card text-center px-3 py-2 cursor-pointer border ${activeFormat === 'Excel' ? 'border-primary bg-primary bg-opacity-10' : 'border-0 bg-light'}`}
                        onClick={() => setActiveFormat('Excel')}
                        style={{ minWidth: '80px', cursor: 'pointer' }}
                      >
                        <i className="ti ti-file-spreadsheet fs-24 text-success mb-1"></i>
                        <div className="fs-12 fw-bold text-dark">Excel</div>
                        <div className="fs-10 text-muted">.xlsx</div>
                      </div>
                      <div
                        className={`card text-center px-3 py-2 cursor-pointer border ${activeFormat === 'PDF' ? 'border-primary bg-primary bg-opacity-10' : 'border-0 bg-light'}`}
                        onClick={() => setActiveFormat('PDF')}
                        style={{ minWidth: '80px', cursor: 'pointer' }}
                      >
                        <i className="ti ti-file-type-pdf fs-24 text-danger mb-1"></i>
                        <div className="fs-12 fw-bold text-dark">PDF</div>
                        <div className="fs-10 text-muted">.pdf</div>
                      </div>
                      <div
                        className={`card text-center px-3 py-2 cursor-pointer border ${activeFormat === 'CSV' ? 'border-primary bg-primary bg-opacity-10' : 'border-0 bg-light'}`}
                        onClick={() => setActiveFormat('CSV')}
                        style={{ minWidth: '80px', cursor: 'pointer' }}
                      >
                        <i className="ti ti-file-text fs-24 text-info mb-1"></i>
                        <div className="fs-12 fw-bold text-dark">CSV</div>
                        <div className="fs-10 text-muted">.csv</div>
                      </div>
                    </div>
                  </div>


                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Sidebar (Ringkasan) */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', background: '#f8fafc' }}>
            <div className="card-body p-4 d-flex flex-column h-100">
              <h6 className="fw-bold fs-15 text-dark mb-4">Ringkasan Export</h6>
              
              <div className="d-flex flex-column gap-3 mb-4 flex-grow-1">
                <div className="d-flex justify-content-between align-items-start border-bottom pb-2 border-dark border-opacity-10">
                  <div className="d-flex align-items-center gap-2 text-muted fs-12"><i className="ti ti-archive"></i> Sumber Project</div>
                  <div className="fs-12 fw-medium text-dark text-end">{projects.find(p => p.id == projectSource)?.name || '-'}</div>
                </div>
                <div className="d-flex justify-content-between align-items-start border-bottom pb-2 border-dark border-opacity-10">
                  <div className="d-flex align-items-center gap-2 text-muted fs-12"><i className="ti ti-calendar"></i> Periode</div>
                  <div className="fs-12 fw-medium text-dark text-end">{periodStart} s/d {periodEnd}</div>
                </div>
                <div className="d-flex justify-content-between align-items-start border-bottom pb-2 border-dark border-opacity-10">
                  <div className="d-flex align-items-center gap-2 text-muted fs-12"><i className="ti ti-check"></i> Status Validasi</div>
                  <div className="fs-12 fw-medium text-dark text-end">{aiStatus}</div>
                </div>
                <div className="d-flex justify-content-between align-items-start border-bottom pb-2 border-dark border-opacity-10">
                  <div className="d-flex align-items-center gap-2 text-muted fs-12"><i className="ti ti-calculator"></i> Total Estimasi</div>
                  <div className="fs-12 fw-medium text-dark text-end">{previewTotal.toLocaleString('id-ID')} baris</div>
                </div>

                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-2 text-muted fs-12"><i className="ti ti-file"></i> Format</div>
                  <div className="fs-12 fw-medium text-dark text-end">{activeFormat} (.{activeFormat === 'Excel' ? 'xlsx' : activeFormat.toLowerCase()})</div>
                </div>
              </div>
              
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-primary w-100 d-flex justify-content-between align-items-center rounded-3 py-2 fw-semibold">
                  <span>Preview Data</span>
                  <i className="ti ti-arrow-right"></i>
                </button>
                <button
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2 fs-13 py-2 rounded-3 text-dark border"
                  onClick={() => setShowExportConfirm(true)}
                  disabled={isExporting}
                >
                  {isExporting ? <span className="spinner-border spinner-border-sm text-dark"></span> : <i className="ti ti-download"></i>}
                  {isExporting ? 'Memproses...' : 'Export Sekarang'}
                </button>

                {/* Jadwalkan Export Toggle */}
                <button
                  className={`btn w-100 d-flex align-items-center justify-content-center gap-2 fs-13 py-2 rounded-3 border ${showSchedule ? 'btn-primary text-white border-primary' : 'btn-light text-dark'}`}
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <i className="ti ti-calendar-time"></i> Jadwalkan Export
                  <i className={`ti ${showSchedule ? 'ti-chevron-up' : 'ti-chevron-down'} ms-auto`}></i>
                </button>

                {/* Panel Jadwal — muncul saat tombol diklik */}
                {showSchedule && (
                  <div className="bg-light border rounded-3 p-3 mt-1">
                    <div className="fs-12 fw-semibold text-dark mb-2 d-flex align-items-center gap-1">
                      <i className="ti ti-calendar-event text-primary"></i> Atur Waktu Eksekusi
                    </div>
                    <div className="mb-3">
                      <label className="form-label fs-11 text-muted mb-1">Tanggal & Jam Eksekusi</label>
                      <input
                        type="datetime-local"
                        className="form-control form-control-sm border-0 bg-white fs-12"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    {scheduleDateTime && (
                      <div className="fs-11 text-muted mb-2 bg-white rounded-2 px-2 py-1 border">
                        <i className="ti ti-info-circle text-primary me-1"></i>
                        Dijadwalkan: <strong>{new Date(scheduleDateTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</strong>
                      </div>
                    )}
                    <button
                      className="btn btn-primary w-100 fs-12 py-2 rounded-2 d-flex align-items-center justify-content-center gap-2"
                      disabled={!scheduleDateTime}
                      onClick={() => scheduleDateTime && setShowScheduleConfirm(true)}
                    >
                      <i className="ti ti-send"></i>
                      {scheduleDateTime ? 'Konfirmasi Jadwal' : 'Pilih tanggal & jam dahulu'}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>



      {/* PREVIEW DATA TABLE */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom p-4 pb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <h6 className="fw-bold fs-15 text-dark mb-0">Preview Data</h6>
                <span className="badge bg-light text-muted fw-medium fs-11 border">Menampilkan {previewTotal > 0 ? (previewPage - 1) * previewPerPage + 1 : 0} - {Math.min(previewPage * previewPerPage, previewTotal)} dari {previewTotal.toLocaleString('id-ID')} data</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="fs-12 text-muted">Tampilkan</span>
                <select className="form-select form-select-sm border-0 bg-light fs-12 w-auto" value={previewPerPage} onChange={(e) => setPreviewPerPage(Number(e.target.value))}>
                  <option value={10}>10 baris</option>
                  <option value={25}>25 baris</option>
                  <option value={50}>50 baris</option>
                </select>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="fs-12 text-muted fw-medium py-3 px-4 text-center">No</th>
                      <th className="fs-12 text-muted fw-medium py-3">NIK</th>
                      <th className="fs-12 text-muted fw-medium py-3">Nama Peserta</th>
                      <th className="fs-12 text-muted fw-medium py-3">Sumber Project</th>
                      <th className="fs-12 text-muted fw-medium py-3 text-center">Status Validasi AI</th>
                      <th className="fs-12 text-muted fw-medium py-3 text-center">Skor AI</th>
                      <th className="fs-12 text-muted fw-medium py-3 pe-4">Tanggal Validasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.length > 0 ? previewData.map((item, index) => (
                      <tr key={item.id}>
                        <td className="fs-13 text-dark text-center px-4">{index + 1}</td>
                        <td className="fs-13 text-muted">{item.nik || '-'}</td>
                        <td className="fs-13 fw-medium text-dark">{item.name || '-'}</td>
                        <td className="fs-13 text-muted">{item.project?.name || item.project?.file_name || '-'}</td>
                        <td className="text-center">
                          {(item.ai_result_status === 'PASS' || item.ai_result_status === 'pass') && <span className="badge bg-success bg-opacity-10 text-success fw-medium fs-11">PASS</span>}
                          {(item.ai_result_status === 'FAIL' || item.ai_result_status === 'fail') && <span className="badge bg-danger bg-opacity-10 text-danger fw-medium fs-11">FAIL</span>}
                          {item.ai_result_status !== 'PASS' && item.ai_result_status !== 'pass' && item.ai_result_status !== 'FAIL' && item.ai_result_status !== 'fail' && <span className="badge bg-warning bg-opacity-10 text-warning fw-medium fs-11">{item.ai_result_status || 'Proses'}</span>}
                        </td>
                        <td className="fs-13 fw-bold text-dark text-center">{item.ai_result_pass_percentage || '-'}</td>
                        <td className="fs-13 text-muted pe-4">{item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted fs-13">Tidak ada data ditemukan</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {previewLastPage > 1 && (
                <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
                  <span className="fs-12 text-muted">Menampilkan halaman {previewPage} dari {previewLastPage}</span>
                  <div className="d-flex gap-1 align-items-center">
                    <button className="btn btn-sm btn-light border-0" disabled={previewPage === 1} onClick={() => setPreviewPage(p => p - 1)}><i className="ti ti-chevron-left"></i></button>
                    {renderPageNumbers(previewPage, previewLastPage, setPreviewPage)}
                    <button className="btn btn-sm btn-light border-0" disabled={previewPage === previewLastPage} onClick={() => setPreviewPage(p => p + 1)}><i className="ti ti-chevron-right"></i></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT EXPORT TERBARU TABLE */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom p-4 pb-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold fs-15 text-dark mb-0">Riwayat Export Terbaru</h6>
              <button 
                className="btn btn-sm btn-light border-0 d-flex align-items-center gap-2" 
                onClick={fetchHistory}
                title="Refresh Riwayat"
              >
                <i className="ti ti-refresh fs-14"></i>
                <span className="fs-12 fw-medium">Refresh</span>
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="fs-12 text-muted fw-medium py-3 px-4 text-center">No</th>
                      <th className="fs-12 text-muted fw-medium py-3">Nama Export</th>
                      <th className="fs-12 text-muted fw-medium py-3">Format</th>
                      <th className="fs-12 text-muted fw-medium py-3 text-end">Total Data</th>
                      <th className="fs-12 text-muted fw-medium py-3 text-end">Ukuran File</th>
                      <th className="fs-12 text-muted fw-medium py-3 text-center">Status</th>
                      <th className="fs-12 text-muted fw-medium py-3">Pesan Error</th>
                      <th className="fs-12 text-muted fw-medium py-3">Dibuat Oleh</th>
                      <th className="fs-12 text-muted fw-medium py-3">Jadwal Export</th>
                      <th className="fs-12 text-muted fw-medium py-3">Tanggal Dibuat</th>
                      <th className="fs-12 text-muted fw-medium py-3 text-center pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportHistory.length > 0 ? exportHistory.map((item, index) => (
                      <tr key={item.id}>
                        <td className="fs-13 text-dark text-center px-4">{(historyPage - 1) * 10 + index + 1}</td>
                        <td className="fs-13 fw-medium text-dark">{item.title}</td>
                        <td className="fs-13 text-muted">{item.file_format}</td>
                        <td className="fs-13 fw-medium text-dark text-end">{item.total_rows ? item.total_rows.toLocaleString('id-ID') : '-'}</td>
                        <td className="fs-13 text-muted text-end">{item.file_size || '-'}</td>
                        <td className="text-center">
                          {item.status === 'Completed' && <span className="badge bg-success bg-opacity-10 text-success fw-medium fs-11">Selesai</span>}
                          {item.status === 'Processing' && <span className="badge bg-warning bg-opacity-10 text-warning fw-medium fs-11">Proses</span>}
                          {item.status === 'Pending' && <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium fs-11">Pending</span>}
                          {item.status === 'Failed' && <span className="badge bg-danger bg-opacity-10 text-danger fw-medium fs-11">Gagal</span>}
                        </td>
                        <td className="fs-13 text-danger" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.error_message || ''}>
                          {item.error_message || '-'}
                        </td>
                        <td className="fs-13 text-muted">Admin LSP</td>
                        <td className="fs-13 text-muted">
                          {item.scheduled_at 
                            ? <span className="text-primary fw-medium"><i className="ti ti-calendar-time me-1"></i>{new Date(item.scheduled_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            : <span className="text-muted"><i className="ti ti-bolt me-1"></i>Langsung</span>}
                        </td>
                        <td className="fs-13 text-muted">{new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            {item.status === 'Completed' && item.file_url ? (
                              <a href={item.file_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-light text-primary border-0 p-1">
                                <i className="ti ti-download fs-16"></i>
                              </a>
                            ) : (
                              <button className="btn btn-sm btn-light text-muted border-0 p-1" disabled>
                                <i className="ti ti-download fs-16"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="11" className="text-center py-4 text-muted fs-13">Belum ada riwayat export</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {historyLastPage > 1 && (
                <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
                  <span className="fs-12 text-muted">Menampilkan halaman {historyPage} dari {historyLastPage}</span>
                  <div className="d-flex gap-1 align-items-center">
                    <button className="btn btn-sm btn-light border-0" disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}><i className="ti ti-chevron-left"></i></button>
                    {renderPageNumbers(historyPage, historyLastPage, setHistoryPage)}
                    <button className="btn btn-sm btn-light border-0" disabled={historyPage === historyLastPage} onClick={() => setHistoryPage(p => p + 1)}><i className="ti ti-chevron-right"></i></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExportDataPage;
