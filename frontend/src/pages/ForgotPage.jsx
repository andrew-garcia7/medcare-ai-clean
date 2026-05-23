import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Email required");

    try {
      setLoading(true);

      const { data } = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(data.message || "Reset link sent to your email");
      toast.success("Reset link sent!");
      setLoading(false);

    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || err.message || "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden">

      {/* 🔥 BACKGROUND */}
      <img
        src="/doctor2-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* 🔥 OVERLAY */}
      <div className="absolute inset-0 bg-[#020617]/50" />

      {/* 🔥 LIGHT EFFECT */}
      <div className="absolute w-[400px] h-[400px] bg-amber-400/10 blur-[120px] rounded-full top-10 left-10" />
      <div className="absolute w-[300px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full bottom-10 right-10" />

      {/* 🔥 CARD */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-[380px] p-8 rounded-2xl 
        bg-white/10 backdrop-blur-xl border border-white/20 
        shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
      >

        <h2 className="text-white text-2xl font-semibold text-center mb-4">
          Forgot Password 🔑
        </h2>

        <p className="text-sm text-slate-300 text-center mb-4">
          Enter your email and we'll send you a reset link
        </p>

        {/* SOCIAL AUTH */}
        <button type="button" className="w-full flex items-center justify-center gap-3 py-3 mb-3 rounded-lg bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all shadow-sm">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>
        <button type="button" className="w-full flex items-center justify-center gap-3 py-3 mb-4 rounded-lg bg-black text-white font-medium text-sm hover:bg-slate-900 transition-all shadow-sm border border-white/10">
          <svg width="16" height="20" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          Sign in with Apple
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg 
          bg-white/10 border border-white/20 text-white 
          placeholder:text-slate-300 focus:outline-none"
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg 
          bg-gradient-to-r from-yellow-400 to-amber-500 
          text-black font-semibold hover:shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all duration-300"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* SUCCESS MESSAGE */}
        {message && (
          <p className="text-green-400 text-sm mt-4 text-center">
            {message}
          </p>
        )}

        {/* BACK TO LOGIN */}
        <p className="text-center text-sm text-slate-300 mt-5">
          Remember your password?{" "}
          <Link to="/login" className="text-amber-400 hover:underline">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}