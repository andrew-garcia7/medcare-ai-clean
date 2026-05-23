import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaPills, FaUserMd, FaCalendarAlt, FaDownload,
  FaCapsules, FaClock, FaChevronDown, FaChevronUp,
  FaNotesMedical, FaFilePdf, FaArrowLeft,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

export default function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get('/appointments/data/prescriptions')
      .then(r => { setPrescriptions(r.data?.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDownloadPDF = (rx) => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.getWidth();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pw, 40, 'F');
      doc.setTextColor(251, 191, 36);
      doc.setFontSize(22); doc.setFont('helvetica', 'bold');
      doc.text('MedCare AI', 20, 18);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Healthcare Prescription', 20, 26);
      doc.text(`Date: ${new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 33);

      doc.setTextColor(226, 232, 240);
      let y = 52;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text(rx.doctorName, 20, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.text(rx.doctorSpecialization, 20, y + 7);

      if (rx.diagnosis) {
        y += 20;
        doc.setFillColor(30, 41, 59);
        doc.rect(15, y - 4, pw - 30, 14, 'F');
        doc.setFontSize(9); doc.setTextColor(251, 191, 36);
        doc.text('DIAGNOSIS', 20, y + 2);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.setTextColor(253, 224, 71);
        doc.text(rx.diagnosis, 20, y + 9);
      }

      y += 25;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.setTextColor(251, 191, 36);
      doc.text('Medications', 20, y);
      y += 8;

      doc.setFillColor(30, 41, 59);
      doc.rect(15, y - 2, pw - 30, 10, 'F');
      doc.setFontSize(8); doc.setTextColor(148, 163, 184);
      doc.text('MEDICINE', 20, y + 5);
      doc.text('DOSAGE', 75, y + 5);
      doc.text('FREQUENCY', 110, y + 5);
      doc.text('DURATION', 155, y + 5);
      y += 14;

      doc.setTextColor(226, 232, 240);
      rx.medications.forEach((med, i) => {
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(med.name || '', 20, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        doc.text(med.dosage || '', 75, y);
        doc.text(med.frequency || '', 110, y);
        doc.text(med.duration || '', 155, y);
        if (med.instructions) {
          y += 5;
          doc.setFontSize(8); doc.setTextColor(100, 116, 139);
          doc.text(`→ ${med.instructions}`, 20, y);
          doc.setTextColor(226, 232, 240);
        }
        y += 10;
        if (i < rx.medications.length - 1) {
          doc.setDrawColor(51, 65, 85);
          doc.line(20, y - 4, pw - 20, y - 4);
        }
      });

      if (rx.notes) {
        y += 8;
        doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text('NOTES', 20, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        doc.setTextColor(203, 213, 225);
        const lines = doc.splitTextToSize(rx.notes, pw - 40);
        doc.text(lines, 20, y + 7);
      }

      const fY = doc.internal.pageSize.getHeight() - 15;
      doc.setDrawColor(51, 65, 85);
      doc.line(15, fY - 5, pw - 15, fY - 5);
      doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text('This is a computer-generated prescription from MedCare AI', pw / 2, fY, { align: 'center' });

      doc.save(`prescription-${rx._id}.pdf`);
      toast.success('Prescription PDF downloaded!');
    }).catch(() => toast.error('PDF generation unavailable.'));
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-7">
      {/* ── Golden Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-yellow-400/20 backdrop-blur text-yellow-400/70 hover:text-yellow-300 hover:border-yellow-400/40 transition-all text-sm cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.08)]">
            <FaArrowLeft size={12} /> Back
          </motion.button>
          <div>
            <h1 className="text-4xl md:text-5xl tracking-wide luxury-text" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}>
              Prescriptions
            </h1>
            <p className="text-sm text-gray-400 mt-1 italic">Your medication history &amp; active prescriptions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {prescriptions.length > 0 && !loading && (
            !confirmDelete ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete All
              </motion.button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete all?</span>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      await api.delete('/appointments/data/prescriptions');
                      setPrescriptions([]);
                      toast.success('All prescriptions deleted');
                    } catch { toast.error('Failed to delete'); }
                    setConfirmDelete(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer">Yes</motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-[#1a2236] hover:bg-[#253049] transition-colors cursor-pointer">Cancel</motion.button>
              </div>
            )
          )}
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-[0_0_12px_rgba(251,191,36,0.1)]">
            {prescriptions.length} Total
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-10 h-10 border-[3px] border-slate-700 border-t-yellow-400 rounded-full" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FaPills size={40} className="mx-auto mb-3 opacity-30" />
          <p>No prescriptions found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {prescriptions.map((rx, idx) => {
            const open = expandedId === rx._id;
            return (
              <motion.div key={rx._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="premium-card"
                onMouseMove={mouseGlow}>
                <div className="card-inner">
                  {/* Gold accent bar */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />

                  <div onClick={() => setExpandedId(open ? null : rx._id)} className="relative z-10 p-5 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 text-xl shrink-0 shadow-[0_0_12px_rgba(251,191,36,0.1)]">
                        <FaCapsules />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-white truncate">{rx.diagnosis || 'Prescription'}</p>
                        <div className="flex gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><FaUserMd size={10} className="text-yellow-400/50" /> {rx.doctorName}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><FaCalendarAlt size={10} className="text-yellow-400/30" /> {new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><FaPills size={10} className="text-yellow-400/30" /> {rx.medications.length} medicines</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); handleDownloadPDF(rx); }}
                          className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 cursor-pointer text-sm hover:bg-yellow-400/20 transition"
                          title="Download PDF"><FaFilePdf /></motion.button>
                        <span className="text-yellow-400/40 text-xs">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-yellow-400/10 pt-4 space-y-4">
                          <p className="text-[11px] font-bold text-yellow-400/60 uppercase tracking-widest">Medications</p>

                          <div className="flex flex-col gap-2">
                            {rx.medications.map((med, i) => (
                              <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-[#0a0f1a] border border-yellow-400/10 items-start">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
                                  <FaPills />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-white">{med.name}</p>
                                  <div className="flex gap-4 mt-1.5 flex-wrap">
                                    <span className="text-xs text-gray-400"><strong className="text-yellow-400">Dosage:</strong> {med.dosage}</span>
                                    <span className="text-xs text-gray-400"><strong className="text-amber-400">Frequency:</strong> {med.frequency}</span>
                                    <span className="text-xs text-gray-400"><strong className="text-orange-400">Duration:</strong> {med.duration}</span>
                                  </div>
                                  {med.instructions && <p className="text-xs text-gray-500 mt-1.5 italic">💡 {med.instructions}</p>}
                                </div>
                              </div>
                            ))}
                          </div>

                          {rx.notes && (
                            <div className="p-3.5 rounded-xl bg-yellow-400/5 border border-yellow-400/15">
                              <div className="flex gap-2 items-start">
                                <FaNotesMedical className="text-yellow-400/60 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] font-bold text-yellow-500 uppercase mb-1 tracking-wider">Doctor&apos;s Notes</p>
                                  <p className="text-sm text-yellow-200/80 leading-relaxed">{rx.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(251,191,36,0.35)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleDownloadPDF(rx)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black font-extrabold text-sm cursor-pointer flex items-center justify-center gap-2 border-none shadow-[0_4px_20px_rgba(251,191,36,0.3)]">
                            <FaDownload /> Download Prescription PDF
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
