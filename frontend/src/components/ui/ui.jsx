import { motion, AnimatePresence } from 'framer-motion';

// ─── GlassCard ─────────────────────────
export function GlassCard({ children, className = '', hover = false, onClick, glow = false }) {
  return (
<div
  onClick={onClick}
  className={`
    relative overflow-hidden
   bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]
    ring-1 ring-white/[0.04]
    ${glow ? 'shadow-[0_0_0_1px_rgba(0,212,180,0.08),0_8px_40px_rgba(0,212,180,0.06)]' : ''}

${hover ? 'hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] hover:ring-blue-400/10 transition-all duration-300 ease-out' : ''}

${onClick ? 'cursor-pointer' : ''}

${className}`}
    >
      {children}
    </div>
  );
}

// ─── Spinner ─────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={`${sizes[size]} border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin`}
    />
  );
}

// ─── Button ─────────────────────────
const primaryGradient =
  'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-[0_0_28px_rgba(251,191,36,0.28)] hover:shadow-[0_0_48px_rgba(251,191,36,0.4)] hover:-translate-y-0.5';
/** Use on `<Link>` for valid anchor + same look as Button primary */
export const linkButtonClass = {
  base: 'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-out text-center',
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-6 py-[11px] text-[13px]',
  lg: 'px-8 py-[14px] text-[14px]',
  primary: `${primaryGradient}`,
 outline:
  'border border-slate-200 text-slate-700 bg-white/60 backdrop-blur-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition-all duration-300',
  dangerOutline:
    'border border-red-400/35 text-red-300 bg-red-500/[0.06] hover:bg-red-500/15 hover:border-red-400/55 hover:shadow-[0_0_24px_rgba(248,113,113,0.18)]',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className = '',
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none';

  const sizes = {
    sm: 'px-4 py-2 text-[11px]',
    md: 'px-6 py-[11px] text-[13px]',
    lg: 'px-8 py-[14px] text-[14px]',
  };

  const variants = {
    primary: primaryGradient,
    glow: primaryGradient,
    outline:
  'border border-slate-200 text-slate-700 bg-white/60 backdrop-blur-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition-all duration-300',
    danger:
      'bg-gradient-to-r from-red-500 to-red-700 text-slate-800 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_36px_rgba(239,68,68,0.35)] hover:-translate-y-0.5',
    dangerOutline:
      'border border-red-400/35 text-red-300 bg-red-500/[0.06] hover:bg-red-500/15 hover:border-red-400/55 hover:shadow-[0_0_24px_rgba(248,113,113,0.18)]',
    ghost:
      'text-text-muted hover:text-slate-800 hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]',
  };

  const v = variants[variant] ?? variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${v} ${className}`}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}

// ─── Badge ─────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    default: 'bg-white/5 text-text-muted border-white/10',
  };

  return (
    <span
      className={`inline-block text-[10px] px-[10px] py-1 rounded-full border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── Modal ─────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[800] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            className={`relative z-10 w-full ${sizes[size]} bg-bg-2/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-7 shadow-2xl ring-1 ring-white/10`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex justify-between items-start mb-5 gap-4">
                <h2 className="text-2xl font-serif font-light text-slate-800 tracking-tight">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-text-muted hover:text-slate-800 text-lg leading-none px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── AvailabilityBadge ─────────────────────────
export function AvailabilityBadge({ available }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full border ${
        available
          ? 'bg-green-500/10 text-green-400 border-green-500/20'
          : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
      }`}
    >
      ● {available ? 'Available today' : 'Next available'}
    </span>
  );
}

// ─── Section ─────────────────────────
export function SectionLabel({ children, className = '' }) {
  return (
    <span
      className={`inline-block text-[10px] sm:text-[11px] font-semibold text-amber-400 uppercase tracking-[0.24em] mb-3 ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, className = '' }) {
  return (
    <h2
      className={`font-serif text-3xl md:text-5xl font-light text-slate-800 tracking-tight leading-[1.12] ${className}`}
    >
      {children}
    </h2>
  );
}

export function SectionSubtitle({ children, className = '' }) {
  return (
    <p className={`font-sans text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl ${className}`}>
      {children}
    </p>
  );
}

// ─── InfoRow ─────────────────────────
export function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/10">
      <span className="text-text-faint">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

// ─── FormInput ─────────────────────────
export function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-text-faint font-medium">
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
       className="bg-white/70 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
      />
    </div>
  );
}
