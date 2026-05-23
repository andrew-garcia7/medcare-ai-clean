import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =============================================
   API CONFIGURATION
============================================= */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* =============================================
   LANGUAGE MAP (English only - clean)
============================================= */
const LANGS = {
  en: "English",
};

/* =============================================
   SYSTEM PROMPT
============================================= */
const buildSystem = (gender, appts) => `
You are Dr. ${gender === "female" ? "Priya Sharma" : "Raj Kumar"}, a real human doctor.

IDENTITY RULE:
- Female = Dr. Priya Sharma
- Male = Dr. Raj Kumar
- NEVER change your name

RESPONSE STYLE:
- Talk like a real doctor (natural, human, warm)
- NO robotic sentences
- NO repeating same lines
- NO "I understand your concern" type filler

HOW TO ANSWER:
- If user gives symptom, give quick advice + 1 short follow-up question
- Keep response short (2-3 lines max)
- Be direct and practical
- Always respond in English

Current context: ${appts.length > 0 ? `${appts.length} appointments booked` : "no appointments"}
`;

/* =============================================
   AVATAR IMAGES
============================================= */
const FEMALE_AVATAR = "https://randomuser.me/api/portraits/women/44.jpg";
const MALE_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

/* =============================================
   EMOJI GRID
============================================= */
const EMOJIS = [
  "\u{1F60A}","\u{1F622}","\u{1F630}","\u{1F912}","\u{1F48A}","\u{1F3E5}","\u2764\uFE0F","\u{1F44D}","\u{1F64F}","\u{1F637}",
  "\u{1F927}","\u{1F915}","\u{1F614}","\u{1F603}","\u{1F44B}","\u2705","\u26A0\uFE0F","\u{1F6A8}","\u{1F4CB}","\u{1F489}",
  "\u{1FA7A}","\u{1F321}\uFE0F","\u{1F486}","\u{1F9D8}","\u{1F34E}","\u{1F4A7}","\u{1F634}","\u{1F914}","\u{1F642}","\u{1F60C}",
  "\u{1F97A}","\u{1F624}","\u{1FAC2}","\u{1F4AA}","\u{1F9E0}","\u{1FAC0}","\u{1F9B7}","\u{1F441}\uFE0F","\u{1F931}","\u{1F9EC}",
];

/* =============================================
   HUMANIZE TEXT - add natural pauses
============================================= */
const humanizeText = (text) => {
  let result = text
    .replace(/\.\s*/g, "... ")
    .replace(/!\s*/g, "!... ")
    .replace(/\?\s*/g, "?... ");
  result = result.replace(/([^,.!?]{60,?})\s/g, "$1, ");
  return result.trim();
};

/* =============================================
   CLEAN TEXT for TTS - strip markdown/emojis
============================================= */
const cleanForVoice = (rawText) =>
  rawText
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*_#`~\u2022\[\]]/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u2600-\u26FF]/gu, "")
    .replace(/[\u2700-\u27BF]/gu, "")
    .trim()
    .slice(0, 300);

/* =============================================
   MAIN COMPONENT
============================================= */
export default function MedCareAI() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [gender, setGender] = useState("female");
  const [showEmoji, setShowEmoji] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [jarvisMode, setJarvisMode] = useState(false);
  const [micPerm, setMicPerm] = useState("unknown");
  const [history, setHistory] = useState([]);
  const [appts, setAppts] = useState([]);
  const [meta, setMeta] = useState({});
  const [toast, setToast] = useState(null);

  const bottomRef = useRef(null);
  const taRef = useRef(null);
  const recogRef = useRef(null);
  const audioRef = useRef(null);
  const jarvisRef = useRef(false);
  const abortRef = useRef(null);

  useEffect(() => {
  const unlockAudio = () => {
    const audio = new Audio();
    audio.play().catch(() => {});
    console.log("Audio unlocked 🔓");
  };

  document.addEventListener("click", unlockAudio, { once: true });

  return () => {
    document.removeEventListener("click", unlockAudio);
  };
}, []);

  /* -- scroll to bottom -- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, isTyping]);

  /* -- initial greeting -- */
  useEffect(() => {
    const name = gender === "female" ? "Priya" : "Raj";
    const text = `Hi there! I'm Dr. ${name} from MedCare AI.\n\nI'm here to help you with any health concerns - symptoms, doctor advice, appointments, medicines, or just a health chat.\n\nHow are you feeling today?`;
    setTimeout(() => addAI(text), 600);
  }, []);

  /* =========================================
     TOAST
  ========================================= */
  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* =========================================
     STOP AUDIO - interrupt immediately
  ========================================= */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  /* =========================================
     PLAY VOICE - OpenAI TTS only
  ========================================= */
  const playVoice = useCallback(async (text, voiceGender) => {
    const clean = cleanForVoice(text);
    if (!clean) return;

    const humanized = humanizeText(clean);
    const voiceName = voiceGender === "female" ? "nova" : "alloy";
    console.log(`Voice request - gender: ${voiceGender}, voice: ${voiceName}, chars: ${humanized.length}`);

    stopAudio();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: humanized, gender: voiceGender }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type") || "";

      // If server returned JSON, it's an error
      if (contentType.includes("application/json")) {
        const data = await res.json();
        console.error("Voice API returned JSON error:", data);
        showToast("Voice unavailable right now.", "err");
        return;
      }

      if (!res.ok) {
        console.error("Voice API HTTP error:", res.status);
        showToast("Voice service error.", "err");
        return;
      }

      const blob = await res.blob();
      console.log(`Voice audio received - size: ${blob.size} bytes`);

      if (!blob || blob.size === 0) {
        console.error("Empty audio blob");
        showToast("Voice returned empty audio.", "err");
        return;
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        // Jarvis mode: restart listening after AI finishes speaking
        if (jarvisRef.current) {
          setTimeout(() => startListening(), 300);
        }
      };

      audio.onerror = () => {
        console.error("Audio playback error");
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        showToast("Audio playback failed.", "err");
      };

     try {
  await audio.play();
  console.log("Audio playing ✅");
} catch (err) {
  console.log("Autoplay blocked ❌", err);
}

    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Voice fetch aborted (interrupted)");
        return;
      }
      console.error("Voice error:", err);
      setIsSpeaking(false);
      showToast("Voice failed. Check connection.", "err");
    }
  }, [stopAudio]);

  /* =========================================
     SPEAK - public method
  ========================================= */
  const speak = useCallback((rawText) => {
    if (!voiceOn) return;
    playVoice(rawText, gender);
  }, [voiceOn, gender, playVoice]);

  /* =========================================
     STT - Start / Stop listening
  ========================================= */
  const startListening = useCallback(async () => {
    if (recogRef.current) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPerm("granted");
    } catch {
      setMicPerm("denied");
      showToast("Microphone access denied.", "err");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("Voice input requires Chrome or Edge.", "err");
      return;
    }

    const recog = new SR();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart = () => setIsListening(true);

    recog.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        console.log("Heard:", transcript);
        setIsListening(false);
        recogRef.current = null;
        stopAudio();
        sendMessage(transcript);
      }
    };

    recog.onerror = (e) => {
      console.warn("STT error:", e.error);
      setIsListening(false);
      recogRef.current = null;
      if (e.error === "not-allowed") {
        setMicPerm("denied");
        showToast("Microphone blocked.", "err");
      } else if (e.error === "network") {
        showToast("Voice recognition needs internet.", "err");
      } else if (e.error === "no-speech" && jarvisRef.current) {
        setTimeout(() => startListening(), 500);
      } else if (e.error !== "aborted") {
        showToast(`Voice error: ${e.error}`, "err");
      }
    };

    recog.onend = () => {
      setIsListening(false);
      recogRef.current = null;
      if (jarvisRef.current && !audioRef.current) {
        setTimeout(() => startListening(), 500);
      }
    };

    try {
      recog.start();
      recogRef.current = recog;
    } catch (err) {
      console.error("STT start failed:", err);
      showToast("Could not start voice input.", "err");
    }
  }, [stopAudio]);

  const stopListening = useCallback(() => {
    if (recogRef.current) {
      recogRef.current.abort();
      recogRef.current = null;
    }
    setIsListening(false);
  }, []);

  /* =========================================
     TOGGLE MIC - single press
  ========================================= */
  const toggleMic = useCallback(async () => {
    
    const audio = new Audio();
  audio.play().catch(() => {});
    if (isListening) {
      stopListening();
    } else {
      stopAudio();
      await startListening();
    }
  }, [isListening, stopListening, stopAudio, startListening]);

  /* =========================================
     JARVIS MODE - continuous listen + speak
  ========================================= */
  const toggleJarvis = useCallback(async () => {
    if (jarvisMode) {
      jarvisRef.current = false;
      setJarvisMode(false);
      stopListening();
      stopAudio();
      showToast("Jarvis mode OFF", "ok");
    } else {
      jarvisRef.current = true;
      setJarvisMode(true);
      setVoiceOn(true);
      showToast("Jarvis mode ON - speak anytime", "ok");
      await startListening();
    }
  }, [jarvisMode, stopListening, stopAudio, startListening]);

  /* =========================================
     ADD AI MESSAGE
  ========================================= */
  const addAI = useCallback((text) => {
    const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setMsgs(p => [...p, { id, role: "ai", text, time: nowTime() }]);
    setMeta(p => ({ ...p, [id]: { status: "delivered", liked: null } }));
    setTimeout(() => speak(text), 100);
  }, [speak]);

  const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* =========================================
     SEND MESSAGE -> API
  ========================================= */
  const sendMessage = async (text) => {
    if (!text?.trim() || isTyping) return;

    stopAudio();
    setShowEmoji(false);

    const uid = `u_${Date.now()}`;
    setMsgs(p => [...p, { id: uid, role: "user", text, time: nowTime() }]);
    setMeta(p => ({ ...p, [uid]: { status: "sent" } }));
    setInput("");
    if (taRef.current) { taRef.current.style.height = "auto"; }

    setIsTyping(true);
    setTimeout(() => setMeta(p => ({ ...p, [uid]: { status: "delivered" } })), 700);

    const updatedHistory = [...history, { role: "user", content: text }];
    setHistory(updatedHistory);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: buildSystem(gender, appts) },
            ...updatedHistory,
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Chat API Error:", err);
        throw new Error(`API ${res.status}`);
      }

      const data = await res.json();
      console.log("Chat API Response:", data);

      const reply = data.reply || "I'm sorry, I couldn't process that. Please try again.";

      setIsTyping(false);
      setHistory(prev => [...prev, { role: "assistant", content: reply }]);
      addAI(reply);
      setTimeout(() => setMeta(p => ({ ...p, [uid]: { status: "read" } })), 900);

    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      addAI("I'm sorry, I'm facing a temporary issue. Please try again.");
      showToast("Chat failed. Check connection.", "err");
    }
  };

  /* =========================================
     MARKDOWN RENDERER
  ========================================= */
  const renderMD = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
      const isBullet = /^[\u2022\-*]\s/.test(line.trim());
      const isHeader = /^#{1,3}\s/.test(line);
      const html = line
        .replace(/^#{1,3}\s+/, "")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code style='background:rgba(99,102,241,0.12);padding:1px 6px;border-radius:4px;font-size:12px;font-family:monospace'>$1</code>");
      const stripped = isBullet ? html.replace(/^[\u2022\-*]\s/, "") : html;
      return (
        <div key={i} style={{
          display: "flex", gap: isBullet ? 8 : 0,
          alignItems: "flex-start", marginBottom: isBullet ? 3 : 2,
          lineHeight: 1.65,
          fontWeight: isHeader ? 600 : 400,
          fontSize: isHeader ? 14 : 13.5,
        }}>
          {isBullet && <span style={{ opacity: 0.45, flexShrink: 0, marginTop: 3, fontSize: 10 }}>{"\u25CF"}</span>}
          <span dangerouslySetInnerHTML={{ __html: stripped }} />
        </div>
      );
    });
  };

  /* =========================================
     AVATARS
  ========================================= */
  const DoctorAvatar = ({ size = 36, style: extraStyle = {} }) => (
    <img
      src={gender === "female" ? FEMALE_AVATAR : MALE_AVATAR}
      alt={`Dr. ${gender === "female" ? "Priya" : "Raj"}`}
      style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", flexShrink: 0,
        border: `2px solid ${gender === "female" ? "#f9a8d4" : "#93c5fd"}`,
        boxShadow: `0 0 0 3px ${gender === "female" ? "#fdf2f8" : "#eff6ff"}, 0 2px 10px rgba(0,0,0,0.1)`,
        ...extraStyle,
      }}
    />
  );

  const UserAvatar = ({ size = 32 }) => (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      overflow: "hidden", flexShrink: 0,
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
    }}>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <circle cx="20" cy="16" r="8" fill="rgba(255,255,255,0.9)"/>
        <ellipse cx="20" cy="34" rx="13" ry="8" fill="rgba(255,255,255,0.7)"/>
      </svg>
    </div>
  );

  /* =========================================
     STATUS
  ========================================= */
  const statusText = isSpeaking ? "Speaking..."
    : isListening ? "Listening..."
    : isTyping ? "Thinking..."
    : jarvisMode ? "Jarvis mode - Ready"
    : "Online - Healthcare AI";

  const statusColor = isSpeaking ? "#8b5cf6"
    : isListening ? "#ef4444"
    : isTyping ? "#6366f1"
    : jarvisMode ? "#f59e0b"
    : "#22c55e";

  const isFemale = gender === "female";

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div style={{
      width: "100%", height: "100vh", minHeight: 560,
      display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #f0f4ff 0%, #fdf4ff 50%, #fff0f6 100%)",
      fontFamily: "'Nunito', 'DM Sans', 'Segoe UI', system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>

      {/* -- AMBIENT BLOBS -- */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,210,254,0.5) 0%, transparent 70%)", top: -120, left: -100 }}/>
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,207,232,0.45) 0%, transparent 70%)", bottom: 60, right: -80 }}/>
        <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)", top: "40%", left: "55%" }}/>
      </div>

      {/* -- TOAST -- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            style={{
              position: "absolute", top: 72, left: "50%", transform: "translateX(-50%)",
              zIndex: 600, background: toast.type === "err"
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff", padding: "8px 20px", borderRadius: 32,
              fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
              boxShadow: "0 6px 28px rgba(0,0,0,0.2)",
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================
          HEADER
      ======================================= */}
      <header style={{
        position: "relative", zIndex: 30, height: 66,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(28px) saturate(180%)",
        borderBottom: "0.5px solid rgba(99,102,241,0.1)",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: 12, flexShrink: 0,
        boxShadow: "0 1px 24px rgba(99,102,241,0.07)",
      }}>

        {/* New Chat */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          title="New conversation"
          onClick={() => {
            if (window.confirm("Start a new conversation?")) {
              stopAudio();
              stopListening();
              setMsgs([]);
              setHistory([]);
              setAppts([]);
              setMeta({});
              setIsSpeaking(false);
              setTimeout(() => {
                addAI(`Hi! I'm Dr. ${isFemale ? "Priya" : "Raj"} from MedCare AI. How can I help you today?`);
              }, 300);
            }
          }}
          style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "rgba(99,102,241,0.08)",
            border: "0.5px solid rgba(99,102,241,0.2)",
            cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6366f1",
          }}>
          {"\u21A9"}
        </motion.button>

        {/* Doctor avatar */}
        <DoctorAvatar size={44} />

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800, fontSize: 15, color: "#1e1b4b",
            letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 7,
          }}>
            Dr. {isFemale ? "Priya Sharma" : "Raj Kumar"}
            <span style={{
              fontSize: 10.5, fontWeight: 600, color: "#6366f1",
              background: "rgba(99,102,241,0.1)",
              padding: "2px 8px", borderRadius: 20, letterSpacing: 0,
            }}>
              MedCare AI
            </span>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", display: "inline-block",
              background: statusColor,
              animation: (isSpeaking || isTyping || isListening) ? "pulse 1.2s ease-in-out infinite" : "none",
            }}/>
            <span style={{ color: statusColor }}>{statusText}</span>
            {appts.length > 0 && (
              <span style={{
                marginLeft: 4, fontSize: 10, fontWeight: 700,
                background: "rgba(99,102,241,0.12)", color: "#6366f1",
                padding: "1px 7px", borderRadius: 20,
              }}>
                {appts.length} appt{appts.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Gender toggle */}
        <button
          onClick={() => { setGender(g => g === "female" ? "male" : "female"); stopAudio(); }}
          style={{
            height: 32, padding: "0 11px", borderRadius: 20,
            background: "rgba(99,102,241,0.08)",
            border: "0.5px solid rgba(99,102,241,0.22)",
            cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 700,
            whiteSpace: "nowrap",
          }}>
          {isFemale ? "Dr. Priya" : "Dr. Raj"}
        </button>

        {/* Voice on/off */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => { setVoiceOn(v => !v); stopAudio(); }}
          title={voiceOn ? "Mute voice" : "Enable voice"}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: voiceOn ? "rgba(99,102,241,0.1)" : "rgba(0,0,0,0.05)",
            border: "0.5px solid rgba(99,102,241,0.2)",
            cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          {voiceOn ? "\u{1F50A}" : "\u{1F507}"}
        </motion.button>

        {/* Jarvis mode toggle */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleJarvis}
          title={jarvisMode ? "Stop Jarvis mode" : "Start Jarvis mode (continuous voice)"}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: jarvisMode
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : "rgba(0,0,0,0.05)",
            border: jarvisMode ? "none" : "0.5px solid rgba(99,102,241,0.2)",
            cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: jarvisMode ? "0 0 12px rgba(245,158,11,0.5)" : "none",
          }}>
          {jarvisMode ? "\u{1F916}" : "\u{1F399}\uFE0F"}
        </motion.button>
      </header>

      {/* =======================================
          MESSAGE FEED
      ======================================= */}
      <main style={{
        flex: 1, overflowY: "auto",
        padding: "20px 0 8px",
        position: "relative", zIndex: 1,
      }}>
        {msgs.map(msg => {
          const isUser = msg.role === "user";
          const m = meta[msg.id] || {};
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 10, padding: "3px 16px 1px",
                marginBottom: 4,
              }}>

              {isUser ? <UserAvatar size={32} /> : <DoctorAvatar size={32} />}

              <div style={{
                maxWidth: "70%", minWidth: 60,
                display: "flex", flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  padding: "11px 15px",
                  borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  background: isUser
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "rgba(255,255,255,0.88)",
                  backdropFilter: isUser ? "none" : "blur(20px) saturate(180%)",
                  color: isUser ? "#ffffff" : "#1e1b4b",
                  fontSize: 13.5, lineHeight: 1.6,
                  border: isUser ? "none" : "0.5px solid rgba(99,102,241,0.1)",
                  boxShadow: isUser
                    ? "0 4px 20px rgba(99,102,241,0.32)"
                    : "0 2px 16px rgba(99,102,241,0.07)",
                }}>
                  {renderMD(msg.text)}
                </div>

                <div style={{
                  display: "flex", alignItems: "center", gap: 5, marginTop: 4,
                  flexDirection: isUser ? "row-reverse" : "row",
                }}>
                  <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{msg.time}</span>
                  {isUser && (
                    <span style={{
                      fontSize: 12, transition: "color 0.4s",
                      color: m.status === "read" ? "#22c55e" : "#94a3b8",
                    }}>
                      {m.status === "sent" ? "\u2713" : "\u2713\u2713"}
                    </span>
                  )}
                  {!isUser && (
                    <div style={{ display: "flex", gap: 3 }}>
                      {[["\u{1F44D}", true], ["\u{1F44E}", false]].map(([e, v]) => (
                        <button key={String(v)}
                          onClick={() => setMeta(p => ({
                            ...p, [msg.id]: { ...p[msg.id], liked: p[msg.id]?.liked === v ? null : v }
                          }))}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 13, padding: "0 2px", lineHeight: 1,
                            opacity: m.liked === v ? 1 : 0.3,
                            transform: m.liked === v ? "scale(1.2)" : "scale(1)",
                            transition: "all 0.18s",
                          }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "3px 16px 10px" }}>
              <DoctorAvatar size={32} />
              <div style={{
                padding: "13px 18px",
                borderRadius: "4px 18px 18px 18px",
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(20px)",
                border: "0.5px solid rgba(99,102,241,0.1)",
                boxShadow: "0 2px 14px rgba(99,102,241,0.07)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#a5b4fc",
                    animation: `dotBounce 1.3s ${i * 0.18}s infinite ease-in-out`,
                  }}/>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </main>

      {/* =======================================
          INPUT BAR
      ======================================= */}
      <footer style={{
        position: "relative", zIndex: 20, flexShrink: 0,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(28px) saturate(180%)",
        borderTop: "0.5px solid rgba(99,102,241,0.1)",
        padding: "10px 14px 12px",
        boxShadow: "0 -4px 30px rgba(99,102,241,0.06)",
      }}>

        {/* Emoji tray */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(24px)",
                border: "0.5px solid rgba(99,102,241,0.14)",
                borderRadius: 16, padding: "10px 12px",
                marginBottom: 10,
                display: "flex", flexWrap: "wrap", gap: 5,
                boxShadow: "0 6px 28px rgba(99,102,241,0.1)",
              }}>
              {EMOJIS.map((e, idx) => (
                <button key={idx}
                  onClick={() => { setInput(i => i + e); taRef.current?.focus(); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 21, lineHeight: 1, padding: 4, borderRadius: 8,
                    transition: "transform 0.12s",
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.transform = "scale(1.35)"}
                  onMouseLeave={ev => ev.currentTarget.style.transform = "scale(1)"}>
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>

          {/* Emoji btn */}
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={() => { setShowEmoji(s => !s); }}
            style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: showEmoji ? "rgba(99,102,241,0.12)" : "rgba(0,0,0,0.04)",
              border: "0.5px solid rgba(99,102,241,0.18)",
              cursor: "pointer", fontSize: 19,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {"\u{1F642}"}
          </motion.button>

          {/* Text input */}
          <div style={{
            flex: 1,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            border: "0.5px solid rgba(99,102,241,0.25)",
            borderRadius: 24,
            display: "flex", alignItems: "center",
            padding: "7px 12px", gap: 8,
            boxShadow: "0 2px 16px rgba(99,102,241,0.08)",
          }}>
            <textarea
              ref={taRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask Dr. Priya anything about your health..."
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#1e1b4b", fontSize: 14, lineHeight: 1.55,
                fontFamily: "inherit", resize: "none",
                maxHeight: 110, overflowY: "auto",
              }}
            />

            {/* Mic button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleMic}
              title={isListening ? "Stop listening" : micPerm === "denied" ? "Mic blocked" : "Voice input"}
              style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                border: "none", cursor: micPerm === "denied" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all 0.2s",
                background: isListening
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : micPerm === "denied"
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(99,102,241,0.08)",
              }}>
              {isListening
                ? <span style={{ color: "#fff", fontSize: 14 }}>{"\u23F9"}</span>
                : micPerm === "denied"
                ? <span style={{ fontSize: 14 }}>{"\u{1F6AB}"}</span>
                : <span style={{ color: "#6366f1", fontSize: 14 }}>{"\u{1F3A4}"}</span>
              }
            </motion.button>
          </div>

          {/* Interrupt button - visible when AI is speaking */}
          {isSpeaking && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.85 }}
              onClick={stopAudio}
              title="Interrupt AI"
              style={{
                width: 42, height: 42, borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                boxShadow: "0 0 12px rgba(245,158,11,0.6)",
              }}>
              {"\u23F8"}
            </motion.button>
          )}

          {/* Delete chats */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (window.confirm("Delete all chats?")) {
                stopAudio();
                stopListening();
                setMsgs([]);
                setHistory([]);
                setMeta({});
                setAppts([]);
                setIsSpeaking(false);
                showToast("All chats cleared", "ok");
              }
            }}
            style={{
              width: 42, height: 42, borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 0 12px rgba(239,68,68,0.5)",
            }}>
            {"\u{1F5D1}"}
          </motion.button>

          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            style={{
              width: 42, height: 42, borderRadius: "50%",
              flexShrink: 0, border: "none",
              background: input.trim() && !isTyping
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(0,0,0,0.07)",
              cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, transition: "all 0.22s",
              boxShadow: input.trim() && !isTyping
                ? "0 4px 18px rgba(99,102,241,0.38)" : "none",
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke={input.trim() && !isTyping ? "white" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !isTyping ? "white" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Listening status bar */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: 8, padding: "6px 12px",
                background: jarvisMode ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                border: `0.5px solid ${jarvisMode ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: 20,
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 12, color: jarvisMode ? "#d97706" : "#ef4444", fontWeight: 500,
              }}>
              <span style={{ animation: "pulse 1s infinite" }}>{"\u{1F534}"}</span>
              {jarvisMode ? "Jarvis listening... speak anytime" : "Listening... speak now"}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "#94a3b8" }}>
          MedCare AI - Emergency: <strong style={{ color: "#ef4444" }}>112</strong> - Always consult a licensed doctor for medical decisions
        </div>
      </footer>

      {/* CSS animations */}
      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.5; }
          30%            { transform: translateY(-8px); opacity: 1;   }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
        textarea::placeholder { color: #94a3b8; font-family: inherit; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
