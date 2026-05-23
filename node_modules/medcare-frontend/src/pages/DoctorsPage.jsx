import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDoctors } from '../hooks/useApi';
import DoctorCard from '../components/DoctorCard';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Oncology',
  'Pulmonology',
  'Ophthalmology',
  'Dermatology',
  'Psychiatry',
  'Pediatrics',
  'General Surgery',
  'Endocrinology',
  'Gastroenterology',
];

const LOCATIONS = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#0f172a]/90 border border-white/[0.06] p-6 animate-pulse shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
          <div className="h-3 bg-white/[0.04] rounded-lg w-1/2" />
          <div className="h-2.5 bg-white/[0.03] rounded-lg w-1/3" />
        </div>
        <div className="w-10 h-12 rounded-lg bg-white/[0.06]" />
      </div>
      <div className="flex gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded bg-white/[0.06]" />
        ))}
      </div>
      <div className="h-px bg-white/[0.04] my-4" />
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <div className="h-2 bg-white/[0.06] rounded w-16" />
          <div className="h-4 bg-white/[0.06] rounded w-12" />
        </div>
        <div className="h-6 bg-white/[0.06] rounded-full w-24" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="flex-1 h-9 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 h-9 rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [spec, setSpec] = useState('');
  const [loc, setLoc] = useState('');
  const [avail, setAvail] = useState('');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const { data, isLoading, isError, error, refetch } = useDoctors({
    search,
    specialization: spec,
    city: loc,
    availableToday: avail === 'today' ? 'true' : '',
  });

  const doctors = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-yellow-50/30 to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-100/40 via-yellow-100/20 to-transparent rounded-full blur-3xl" />
        <div className="relative w-full px-6 lg:px-12 xl:px-20 pt-10 pb-8">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-[#0f172a]/60 backdrop-blur-sm border border-amber-400/20 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-500/[0.06] hover:shadow-[0_4px_16px_rgba(251,191,36,0.15)] transition-all duration-300"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-medium">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-[10px] sm:text-[11px] font-serif font-semibold text-amber-600 uppercase tracking-[0.24em] mb-3">
              Medical Specialists
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl luxury-text font-bold tracking-wide mb-2">
                Find Your Doctor
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl">
              Browse our network of top-rated specialists. Filter by specialty, location, or availability.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="w-full px-6 lg:px-12 xl:px-20 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap gap-3 items-center"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all shadow-sm"
            />
          </div>

          {/* Specialization filter */}
          <select
            value={spec || 'All'}
            onChange={(e) => setSpec(e.target.value === 'All' ? '' : e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-[160px] shadow-sm"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Location filter */}
          <select
            value={loc || 'All'}
            onChange={(e) => setLoc(e.target.value === 'All' ? '' : e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-[130px] shadow-sm"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {/* Available today toggle */}
          <button
            onClick={() => setAvail(avail === 'today' ? '' : 'today')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all duration-300 shadow-sm ${
              avail === 'today'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white/80 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Available Today
          </button>
        </motion.div>

        {/* Error banner */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-amber-700 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between"
          >
            <span>
              {String(error?.message || '').includes('Network') ||
              String(error?.message || '').includes('ECONNREFUSED')
                ? 'Cannot reach the API. Make sure the backend is running.'
                : error?.message}
            </span>
            <button onClick={() => refetch()}
              className="ml-4 px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shrink-0 cursor-pointer">
              Retry
            </button>
          </motion.div>
        )}

        {/* Results count */}
        {!isLoading && !isError && (
          <p className="mt-4 text-slate-400 text-xs">
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Results grid */}
      <div className="w-full px-6 lg:px-12 xl:px-20 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No doctors match your filters.</p>
            <button
              onClick={() => { setSearch(''); setSpec(''); setLoc(''); setAvail(''); }}
              className="mt-3 text-blue-500 hover:text-blue-600 text-xs transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc, i) => (
              <DoctorCard key={doc._id} doctor={doc} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}