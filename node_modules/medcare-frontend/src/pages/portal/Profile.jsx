import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaPhone, FaEnvelope, FaHome, FaCamera,
  FaHeartbeat, FaTint, FaPills, FaAllergies, FaShieldAlt,
  FaSave, FaEdit, FaTimes, FaUserShield, FaIdCard, FaArrowLeft,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const LINDA = "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif";

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

const GoldCard = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={`premium-card ${className}`}
    onMouseMove={mouseGlow}
  >
    <div className="card-inner">
      <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />
      <div className="relative z-10">{children}</div>
    </div>
  </motion.div>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/appointments/data/profile')
      .then(r => { const p = r.data?.data || {}; setProfile(p); setForm(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/appointments/data/profile', form);
      setProfile(data.data); setEditing(false);
      updateUser({ firstName: form.firstName, lastName: form.lastName, avatar: form.avatar || null });
      toast.success('Profile updated successfully!');
      addNotification({ type: 'profile', title: 'Profile Updated', message: 'Your personal information and medical details have been saved successfully.' });
    } catch (err) { toast.error(err.message || 'Failed to update profile'); }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setForm(prev => ({ ...prev, avatar: base64 }));
      // Immediately update auth store so avatar shows everywhere
      updateUser({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const initials = profile
    ? `${(profile.firstName || '')[0] || ''}${(profile.lastName || '')[0] || ''}`
    : 'AD';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="w-10 h-10 border-[3px] border-slate-700 border-t-yellow-400 rounded-full" />
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-7">
      {/* ── Golden Header ── */}
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-yellow-400/20 backdrop-blur text-yellow-400/70 hover:text-yellow-300 hover:border-yellow-400/40 transition-all text-sm cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.08)]"
          style={{ fontFamily: LINDA }}>
          <FaArrowLeft size={12} /> Back
        </motion.button>
        <div>
          <h1 className="text-4xl md:text-5xl tracking-wide luxury-text" style={{ fontFamily: LINDA }}>
            My Profile
          </h1>
          <p className="text-sm text-gray-400 mt-1 italic" style={{ fontFamily: LINDA }}>Manage your personal &amp; medical information</p>
        </div>
      </div>

      {/* ── Avatar Header Card ── */}
      <GoldCard delay={0.05}>
        <div className="p-6 pt-5">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-[3px] border-amber-400/30 shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_20px_rgba(251,191,36,0.15)]"
                style={{ background: form.avatar ? `url(${form.avatar}) center/cover` : 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', fontFamily: LINDA }}>
                {!form.avatar && initials}
              </div>
              {editing && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-2 border-[#0f172a] flex items-center justify-center cursor-pointer text-xs shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                  <FaCamera />
                </motion.button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex gap-3 flex-wrap">
                  <input value={form.firstName || ''} onChange={e => updateField('firstName', e.target.value)} placeholder="First Name"
                    className="flex-1 min-w-[120px] px-4 py-2.5 rounded-xl bg-[#0a0f1a] border border-yellow-400/20 text-white text-lg font-bold outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition"
                    style={{ fontFamily: LINDA }} />
                  <input value={form.lastName || ''} onChange={e => updateField('lastName', e.target.value)} placeholder="Last Name"
                    className="flex-1 min-w-[120px] px-4 py-2.5 rounded-xl bg-[#0a0f1a] border border-yellow-400/20 text-white text-lg font-bold outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition"
                    style={{ fontFamily: LINDA }} />
                </div>
              ) : (
                <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: LINDA }}>{profile?.firstName} {profile?.lastName}</h2>
              )}
              <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: LINDA }}>{profile?.email}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {profile?.bloodType && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20" style={{ fontFamily: LINDA }}>
                    <FaTint className="inline mr-1" />{profile.bloodType}
                  </span>
                )}
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" style={{ fontFamily: LINDA }}>Active Patient</span>
              </div>
            </div>

            {/* Edit / Save / Cancel */}
            <div className="shrink-0">
              {editing ? (
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditing(false); setForm(profile); }}
                    className="px-4 py-2.5 rounded-xl bg-[#0a0f1a] border border-yellow-400/20 text-yellow-400/70 text-sm font-semibold cursor-pointer flex items-center gap-1.5 hover:text-yellow-400 hover:border-yellow-400/40 transition"
                    style={{ fontFamily: LINDA }}>
                    <FaTimes /> Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(251,191,36,0.4)' }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave} disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black text-sm font-extrabold cursor-pointer flex items-center gap-1.5 border-none shadow-[0_4px_20px_rgba(251,191,36,0.3)] disabled:opacity-70"
                    style={{ fontFamily: LINDA }}>
                    <FaSave /> {saving ? 'Saving...' : 'Save'}
                  </motion.button>
                </div>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => setEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-semibold cursor-pointer flex items-center gap-1.5 hover:border-yellow-400/40 hover:bg-yellow-400/15 transition shadow-[0_0_12px_rgba(251,191,36,0.08)]"
                  style={{ fontFamily: LINDA }}>
                  <FaEdit /> Edit Profile
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </GoldCard>

      {/* ── 3-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <GoldCard delay={0.1}>
          <div className="p-5">
            <h3 className="text-sm font-bold text-yellow-400 mb-4 flex items-center gap-2" style={{ fontFamily: LINDA }}><FaUser /> Personal Information</h3>
            <div className="space-y-4">
              <InfoField icon={<FaPhone />} label="Phone" value={form.phone} editing={editing} onChange={v => updateField('phone', v)} />
              <InfoField icon={<FaIdCard />} label="Age" value={form.age} editing={editing} onChange={v => updateField('age', v)} type="number" />
              <InfoField icon={<FaUser />} label="Gender" value={form.gender} editing={editing} onChange={v => updateField('gender', v)} options={['Male', 'Female', 'Other']} />
              <InfoField icon={<FaEnvelope />} label="Email" value={form.email} editing={editing} onChange={v => updateField('email', v)} />
              <InfoField icon={<FaHome />} label="Address" value={form.address} editing={editing} onChange={v => updateField('address', v)} multiline />
            </div>
          </div>
        </GoldCard>

        {/* Medical History */}
        <GoldCard delay={0.15}>
          <div className="p-5">
            <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2" style={{ fontFamily: LINDA }}><FaHeartbeat /> Medical History</h3>
            <div className="space-y-4">
              <InfoField icon={<FaTint />} label="Blood Type" value={form.bloodType} editing={editing} onChange={v => updateField('bloodType', v)} options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
              <TagField icon={<FaAllergies />} label="Allergies" values={form.allergies || []} editing={editing} onChange={v => updateField('allergies', v)} cls="text-red-400 bg-red-500/10 border-red-500/20" />
              <TagField icon={<FaPills />} label="Medications" values={form.medications || []} editing={editing} onChange={v => updateField('medications', v)} cls="text-yellow-400 bg-yellow-400/10 border-yellow-400/20" />
              <TagField icon={<FaHeartbeat />} label="Conditions" values={form.conditions || []} editing={editing} onChange={v => updateField('conditions', v)} cls="text-amber-400 bg-amber-400/10 border-amber-400/20" />
            </div>
          </div>
        </GoldCard>

        {/* Emergency + Insurance */}
        <div className="space-y-6">
          <GoldCard delay={0.2}>
            <div className="p-5">
              <h3 className="text-sm font-bold text-orange-400 mb-4 flex items-center gap-2" style={{ fontFamily: LINDA }}><FaUserShield /> Emergency Contact</h3>
              <div className="space-y-4">
                <InfoField icon={<FaUser />} label="Name" value={form.emergencyContact?.name} editing={editing} onChange={v => updateField('emergencyContact', { ...form.emergencyContact, name: v })} />
                <InfoField icon={<FaUser />} label="Relation" value={form.emergencyContact?.relation} editing={editing} onChange={v => updateField('emergencyContact', { ...form.emergencyContact, relation: v })} />
                <InfoField icon={<FaPhone />} label="Phone" value={form.emergencyContact?.phone} editing={editing} onChange={v => updateField('emergencyContact', { ...form.emergencyContact, phone: v })} />
              </div>
            </div>
          </GoldCard>
          <GoldCard delay={0.25}>
            <div className="p-5">
              <h3 className="text-sm font-bold text-yellow-300 mb-4 flex items-center gap-2" style={{ fontFamily: LINDA }}><FaShieldAlt /> Insurance Details</h3>
              <div className="space-y-4">
                <InfoField icon={<FaShieldAlt />} label="Provider" value={form.insurance?.provider} editing={editing} onChange={v => updateField('insurance', { ...form.insurance, provider: v })} />
                <InfoField icon={<FaIdCard />} label="Policy Number" value={form.insurance?.policyNumber} editing={editing} onChange={v => updateField('insurance', { ...form.insurance, policyNumber: v })} />
                <InfoField icon={<FaIdCard />} label="Valid Until" value={form.insurance?.validUntil} editing={editing} onChange={v => updateField('insurance', { ...form.insurance, validUntil: v })} type="date" />
              </div>
            </div>
          </GoldCard>
        </div>
      </div>
    </div>
  );
}

const LINDA_FONT = "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif";

function InfoField({ icon, label, value, editing, onChange, type = 'text', multiline = false, options }) {
  if (editing) {
    if (options) return (
      <div className="flex gap-3 items-center">
        <span className="text-yellow-400/40 text-sm w-5 shrink-0">{icon}</span>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider" style={{ fontFamily: LINDA_FONT }}>{label}</label>
          <select value={value || ''} onChange={e => onChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0a0f1a] border border-yellow-400/20 text-white text-sm outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition"
            style={{ fontFamily: LINDA_FONT }}>
            <option value="" className="bg-[#0a0f1a]">Select...</option>
            {options.map(o => <option key={o} value={o} className="bg-[#0a0f1a]">{o}</option>)}
          </select>
        </div>
      </div>
    );
    return (
      <div className={`flex gap-3 ${multiline ? 'items-start' : 'items-center'}`}>
        <span className={`text-yellow-400/40 text-sm w-5 shrink-0 ${multiline ? 'mt-2' : ''}`}>{icon}</span>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider" style={{ fontFamily: LINDA_FONT }}>{label}</label>
          {multiline ? (
            <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0a0f1a] border border-yellow-400/20 text-white text-sm outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 resize-y transition"
              style={{ fontFamily: LINDA_FONT }} />
          ) : (
            <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0a0f1a] border border-yellow-400/20 text-white text-sm outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition"
              style={{ fontFamily: LINDA_FONT }} />
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-center">
      <span className="text-yellow-400/40 text-sm w-5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider m-0" style={{ fontFamily: LINDA_FONT }}>{label}</p>
        <p className="text-sm font-medium text-slate-200 mt-0.5 m-0" style={{ fontFamily: LINDA_FONT }}>{value || '\u2014'}</p>
      </div>
    </div>
  );
}

function TagField({ icon, label, values, editing, onChange, cls }) {
  const [input, setInput] = useState('');
  const addTag = () => { const t = input.trim(); if (t && !values.includes(t)) { onChange([...values, t]); setInput(''); } };
  const removeTag = (i) => onChange(values.filter((_, idx) => idx !== i));
  return (
    <div className="flex gap-3 items-start">
      <span className="text-yellow-400/40 text-sm w-5 shrink-0 mt-1">{icon}</span>
      <div className="flex-1">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: LINDA_FONT }}>{label}</p>
        <div className="flex gap-1.5 flex-wrap">
          {values.map((tag, i) => (
            <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`} style={{ fontFamily: LINDA_FONT }}>
              {tag}
              {editing && <FaTimes size={8} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeTag(i)} />}
            </span>
          ))}
          {editing && (
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Add..."
              className="w-20 px-2 py-0.5 rounded-lg bg-[#0a0f1a] border border-yellow-400/20 text-white text-xs outline-none focus:ring-2 focus:ring-yellow-400/40 transition"
              style={{ fontFamily: LINDA_FONT }} />
          )}
        </div>
      </div>
    </div>
  );
}
