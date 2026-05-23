import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
];

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

export default function DoctorCard({ doctor, index = 0 }) {
  const name = `Dr. ${doctor?.user?.firstName} ${doctor?.user?.lastName}`;
  const [imgError, setImgError] = useState(false);

  const fallbackImg = FALLBACK_IMAGES[((doctor?._id || '').charCodeAt(1) || index) % FALLBACK_IMAGES.length];
  const imgSrc = imgError ? fallbackImg : (doctor?.photo?.url || fallbackImg);

  const stars = Array.from({ length: 5 }, (_, i) => {
    const rating = doctor?.averageRating || 0;
    if (i < Math.floor(rating)) return "full";
    if (i < rating) return "half";
    return "empty";
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="premium-card"
      onMouseMove={mouseGlow}
    >
      <div className="card-inner">
        {/* Gold accent bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />

        <div className="relative z-10 p-6">
          {/* Top section: Avatar + Info */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_20px_rgba(251,191,36,0.1)]">
                <img
                  src={imgSrc}
                  alt={name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              </div>
              {doctor?.isAvailableToday && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0f172a] shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                />
              )}
            </div>

            {/* Name + Specialization */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/doctors/${doctor?._id}`}
                className="luxury-text font-semibold text-[17px] leading-tight block truncate hover:opacity-80 transition-opacity duration-300 tracking-wide"
              >
                {name}
              </Link>
              <p className="text-amber-400/80 text-xs font-medium mt-1 tracking-wide">
                {doctor?.specialization}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">{doctor?.city}</p>
            </div>

            {/* Experience badge */}
            <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/20 text-center">
              <span className="text-amber-300 font-bold text-sm leading-none">{doctor?.experience}</span>
              <span className="block text-amber-500/60 text-[9px] font-medium tracking-wider mt-0.5">YRS</span>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {stars.map((s, i) => (
                <motion.svg
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 + i * 0.08, type: "spring", stiffness: 400 }}
                  className={`w-3.5 h-3.5 ${s === "empty" ? "text-slate-700" : "text-amber-400 drop-shadow-[0_0_4px_rgba(251,189,35,0.4)]"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <span className="text-white/80 text-xs font-medium">{doctor?.averageRating?.toFixed(1)}</span>
            <span className="text-slate-500 text-[11px]">({doctor?.totalReviews} reviews)</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent my-4" />

          {/* Bottom section */}
          <div className="flex items-center justify-between">
            {/* Fee */}
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider">Consultation</span>
              <p className="luxury-text font-semibold text-base">{'\u20B9'}{doctor?.consultationFee}</p>
            </div>

            {/* Availability */}
            <div className="text-right">
              {doctor?.isAvailableToday ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                  />
                  Available Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {doctor?.nextAvailable || "Next available"}
                </span>
              )}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2 mt-4">
            <Link
              to={`/doctors/${doctor?._id}`}
              className="flex-1 text-center py-2.5 rounded-xl text-xs font-medium border border-amber-400/20 text-amber-300/70 hover:text-amber-200 hover:border-amber-400/40 hover:bg-amber-500/[0.06] transition-all duration-300"
            >
              View Profile
            </Link>
            <Link
              to={`/doctors/${doctor?._id}`}
              className="flex-1 text-center py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all duration-300"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}