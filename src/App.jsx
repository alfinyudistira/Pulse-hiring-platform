import { useState, useEffect, useRef } from "react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";


// ─── DATA ────────────────────────────────────────────────────────────────────
const COMPETENCIES = [
  { id: "analytics", label: "Google Analytics 4", short: "Data Analytics", weight: 0.20, critical: true, color: "#C8A97E", icon: "📊" },
  { id: "paid", label: "Paid Advertising", short: "Paid Ads", weight: 0.20, critical: true, color: "#E8835A", icon: "💰" },
  { id: "seo", label: "SEO Strategy & Content", short: "SEO", weight: 0.12, critical: false, color: "#7EB5A6", icon: "🔍" },
  { id: "copy", label: "Strategic Copywriting", short: "Copywriting", weight: 0.15, critical: false, color: "#9B8EC4", icon: "✍️" },
  { id: "abtesting", label: "A/B Testing & CRO", short: "A/B Testing", weight: 0.10, critical: false, color: "#6BAED6", icon: "🧪" },
  { id: "email", label: "Email Marketing Automation", short: "Email Mktg", weight: 0.10, critical: false, color: "#74C476", icon: "📧" },
  { id: "social", label: "Social Media Strategy", short: "Social Media", weight: 0.08, critical: false, color: "#F4A460", icon: "📱" },
  { id: "pm", label: "Marketing Project Mgmt", short: "Project Mgmt", weight: 0.05, critical: false, color: "#BC8F8F", icon: "📋" },
];

const FUNNEL_DATA = [
  { stage: "Applications", traditional: 150, optimized: 100, day_trad: 14, day_opt: 14 },
  { stage: "Resume Screen", traditional: 30, optimized: 40, day_trad: 17, day_opt: 17 },
  { stage: "Skills Assessment", traditional: 15, optimized: 20, day_trad: 21, day_opt: 18 },
  { stage: "Phone Screen", traditional: 8, optimized: 10, day_trad: 24, day_opt: 21 },
  { stage: "Team Interview", traditional: 4, optimized: 5, day_trad: 28, day_opt: 24 },
  { stage: "Final Round", traditional: 2, optimized: 2, day_trad: 35, day_opt: 27 },
  { stage: "Offer Extended", traditional: 1, optimized: 1, day_trad: 45, day_opt: 30 },
];

const SALARY_DATA = {
  idr: { entry: [6, 8, 10], mid: [9, 12, 16], senior: [15, 20, 28] },
  usd: { entry: [42, 50, 58], mid: [55, 68, 82], senior: [75, 92, 112] },
  pulse: { idr: [13.75, 18.75], usd: [10.5, 14.5] }
};

const ONBOARDING_WEEKS = [
  {
    week: "Week 1", theme: "Getting Your Bearings", color: "#C8A97E",
    items: ["Coffee with manager", "IT setup & accounts", "Meet team members", "Review brand guidelines", "Analytics deep dive", "First 3 social posts"]
  },
  {
    week: "Week 2", theme: "Starting to Contribute", color: "#E8835A",
    items: ["Take over daily social", "All-hands meeting", "Setup first ad campaign", "Meet product team", "Email campaign analysis presentation"]
  },
  {
    week: "Week 3", theme: "Finding Your Rhythm", color: "#7EB5A6",
    items: ["Run first marketing standup", "Launch first email campaign", "Propose one strategy improvement", "Attend client call", "Content planning participation"]
  },
  {
    week: "Week 4", theme: "Full Speed Ahead", color: "#9B8EC4",
    items: ["Own all social media", "Present campaign results", "Lead one full project", "30-day check-in with manager & HR"]
  },
  {
    week: "Month 2-3", theme: "Expanding Impact", color: "#6BAED6",
    items: ["Major campaign end-to-end", "Budget planning participation", "Process improvement implementation", "Mentor new members", "60-day review", "90-day comprehensive review"]
  },
];

const DI_METRICS = [
  { label: "Gender Diversity (Female%)", current: 43, target: 40, status: "exceeded" },
  { label: "Bootcamp / Alt-Education Hires", current: 28, target: 20, status: "exceeded" },
  { label: "Geographic – APAC", current: 38, target: 30, status: "exceeded" },
  { label: "Geographic – Americas", current: 25, target: 25, status: "met" },
  { label: "Geographic – Europe", current: 22, target: 25, status: "progress" },
  { label: "Geographic – MENA", current: 15, target: 20, status: "needs-work" },
  { label: "Diverse Final Candidate Pool", current: 40, target: 40, status: "met" },
  { label: "Blind Screening Adoption", current: 100, target: 100, status: "exceeded" },
];

// ─── TOAST & CONFETTI ────────────────────────────────────────────────────────
function Toast({ message, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}
      style={{ position: "fixed", bottom: "2rem", left: "50%", background: "#1A1A1A", border: `1px solid ${color}`, borderRadius: 8, padding: "0.75rem 1.5rem", color: color, fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 700, zIndex: 9999, whiteSpace: "nowrap", boxShadow: `0 0 20px ${color}44` }}>
      {message}
    </motion.div>
  );
}

function Confetti() {
  const pieces = Array.from({length: 30}, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.5,
    color: ["#C8A97E","#74C476","#6BAED6","#9B8EC4","#E8835A"][Math.floor(Math.random()*5)]
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9998 }}>
      {pieces.map(p => (
        <motion.div key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 720 }}
          transition={{ duration: 2.5, delay: p.delay, ease: "easeIn" }}
          style={{ position: "absolute", width: 8, height: 8, borderRadius: 2, background: p.color }}
        />
      ))}
    </div>
  );
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function getDecision(scores, weights) {
  const criticals = COMPETENCIES.filter(c => c.critical);
  const hasFailedCritical = criticals.some(c => (scores[c.id] || 0) < 3);
  const weighted = COMPETENCIES.reduce((acc, c) => acc + (scores[c.id] || 0) * c.weight, 0);
  if (hasFailedCritical) return { label: "NO HIRE — Critical Hurdle Failed", color: "#E8835A", grade: "F", score: weighted };
  if (weighted >= 4.0) return { label: "STRONG HIRE ✦ Extend Offer", color: "#74C476", grade: "A", score: weighted };
  if (weighted >= 3.5) return { label: "HIRE — Consider Offer", color: "#C8A97E", grade: "B", score: weighted };
  if (weighted >= 3.0) return { label: "MAYBE — Team Discussion", color: "#6BAED6", grade: "C", score: weighted };
  return { label: "NO HIRE", color: "#E8835A", grade: "D", score: weighted };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function NavBar({ active, setActive }) {
  const tabs = [
    { id: "calculator", label: "Fit Calculator", icon: "⚡" },
    { id: "funnel", label: "Hiring Funnel", icon: "🔻" },
    { id: "salary", label: "Salary Bench", icon: "💴" },
    { id: "scorecard", label: "Scorecard", icon: "📋" },
    { id: "di", label: "D&I Dashboard", icon: "🌐" },
    { id: "onboarding", label: "Onboarding", icon: "🗓" },
    { id: "questions", label: "Question Bank", icon: "💬" },
    { id: "bi", label: "Executive BI", icon: "📈" },
  ];
  return (
    <nav style={{ background: "#0D0D0D", borderBottom: "1px solid #2A2A2A", padding: "0 2rem", display: "flex", gap: "0.25rem", overflowX: "auto", flexShrink: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          background: active === t.id ? "#1A1A1A" : "transparent",
          border: "none", borderBottom: active === t.id ? "2px solid #C8A97E" : "2px solid transparent",
          color: active === t.id ? "#C8A97E" : "#666", padding: "1rem 1.25rem",
          cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem",
          letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
          transition: "all 0.2s"
        }}>
          {t.icon} {t.label}
        </button>
      ))}
    </nav>
  );
}

// ── CALCULATOR ──
function Calculator({ showToast, fireConfetti, recordEval }) {
  const [candidateName, setCandidateName] = useState("");
  const [expectedSalary, setExpectedSalary] = useState(8000000);
  const [scores, setScores] = useState({});
  const [softScores, setSoftScores] = useState({});
  const [savedCandidates, setSavedCandidates] = useState([]);
    // Fungsi Export ke CSV
  const downloadCSV = () => {
    if (savedCandidates.length === 0) {
      showToast?.("There is no candidate data to export yet!", "#E8835A");
      return;
    }
    const headers = ["Rank", "Candidate Name", "Weighted Score", "Expected Salary (IDR)", "Recommendation"];
    const rows = savedCandidates.sort((a, b) => b.score - a.score).map((c, i) => [
      i + 1,
      c.name || "Anonymous",
      c.score.toFixed(2),
      c.salary,
      c.label
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Pulse_Candidate_Shortlist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.("Data successfully downloaded as CVS", "#74C476");
  };


  // Tambahan Data Culture & Soft Skill
  const SOFT_SKILLS = [
    { id: "comm", label: "Communication", short: "Communication", color: "#B39DDB", icon: "🗣️" },
    { id: "prob", label: "Problem Solving", short: "Problem Solv", color: "#80CBC4", icon: "🧠" },
    { id: "culture", label: "Culture Fit", short: "Culture Fit", color: "#FFCC80", icon: "🤝" },
    { id: "adapt", label: "Adaptability", short: "Adaptability", color: "#F48FB1", icon: "🔄" }
  ];

  const decision = getDecision(scores);
  const allCoreFilled = COMPETENCIES.every(c => scores[c.id] !== undefined);
  const allSoftFilled = SOFT_SKILLS.every(c => softScores[c.id] !== undefined);
  const allFilled = allCoreFilled && allSoftFilled;

  // Data Radar Chart Gabungan (Hard Skill + Soft Skill)
  const radarData = [
    ...COMPETENCIES.map(c => ({ subject: c.short, Ideal: c.critical ? 4 : 3, Candidate: scores[c.id] || 0, fullMark: 5 })),
    ...SOFT_SKILLS.map(c => ({ subject: c.short, Ideal: 4, Candidate: softScores[c.id] || 0, fullMark: 5 }))
  ];

  // Logika Budgeting & Negosiasi
  const maxBudget = 10000000; // Maksimal budget perusahaan 10 Juta
  let finalDecisionLabel = decision.label;
  let finalDecisionColor = decision.color;
  let salaryNote = "";

    if (allFilled) {
    if (decision.score >= 4.0) {
      finalDecisionLabel = expectedSalary > maxBudget ? "STRONG HIRE (NEGOTIATE)" : "STRONG HIRE";
      finalDecisionColor = expectedSalary > maxBudget ? "#F4A460" : "#74C476";
      salaryNote = expectedSalary > maxBudget ? "⚠️ Exceeds budget. Strong candidate, negotiation required." : "✅ Within budget. Excellent ROI.";
    } else if (decision.score >= 3.0) {
      finalDecisionLabel = expectedSalary > maxBudget ? "TEAM DISCUSSION (OVER BUDGET)" : "MAYBE (TEAM DISCUSSION)";
      finalDecisionColor = "#E8C35A"; // Warna Kuning/Gold
      salaryNote = expectedSalary > maxBudget ? "⚠️ Over budget for a borderline candidate." : "✅ Within budget. Review potential.";
    } else {
      finalDecisionLabel = "NO HIRE";
      finalDecisionColor = "#E8835A";
      salaryNote = "❌ Does not meet minimum requirements.";
    }
  }

  // Logika Predictive ROI & Retention
  let breakEven = 0;
  let retention = 0;
  if (allFilled) {
     breakEven = decision.score >= 4.0 ? 3 : decision.score >= 3.0 ? 6 : 12; 
     const cultureBonus = softScores.culture ? (softScores.culture / 5) * 20 : 10;
     retention = Math.min(Math.round((decision.score / 5) * 75 + cultureBonus), 98); 
  }
  
  // Fungsi Pembuat Report Otomatis
  const getReport = () => {
    if (!allFilled) return <div style={{ color: "#555", fontSize: "0.8rem", marginTop: "1rem" }}>Fill all competencies to generate AI report...</div>;
    
    const allSkills = [...COMPETENCIES.map(c => ({...c, score: scores[c.id]})), ...SOFT_SKILLS.map(c => ({...c, score: softScores[c.id]}))];
    const strengths = allSkills.filter(s => s.score >= 4).map(s => s.short);
    const weaknesses = allSkills.filter(s => s.score <= 2).map(s => s.short);

    return (
      <div style={{ fontSize: "0.8rem", color: "#AAA", lineHeight: 1.6, textAlign: "left", marginTop: "1.5rem", padding: "1.2rem", background: "#0A0A0A", borderRadius: 8, border: "1px solid #222" }}>
        <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", marginBottom: "0.8rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
          [ AUTOMATED CANDIDATE ANALYSIS ]
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong style={{ color: "#DDD" }}>Profile:</strong> {candidateName || "Anonymous Candidate"}
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong style={{ color: "#74C476" }}>💪 Core Strengths:</strong> {strengths.length > 0 ? strengths.join(", ") : "None identified."}
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong style={{ color: "#E8835A" }}>⚠️ Areas to Improve:</strong> {weaknesses.length > 0 ? weaknesses.join(", ") : "Solid across all dimensions."}
        </div>
        <div>
          <strong style={{ color: expectedSalary > maxBudget ? "#F4A460" : "#74C476" }}>💰 Comp. Analysis:</strong> {salaryNote}
        </div>
      </div>
    );
  };

  const formatIDR = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 01 — Core Evaluation</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 1rem" }}>Candidate Fit & Value Calculator</h2>
      </div>

      {/* Bagian Atas: Nama & Salary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem", background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
         <div>
            <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Candidate Full Name</label>
            <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="e.g. John Doe"
              style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", padding: "0.75rem 1rem", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", width: "100%", boxSizing: "border-box" }} />
         </div>
         <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Expected Monthly Salary (IDR)</label>
                <span style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>{formatIDR(expectedSalary)}</span>
            </div>
            <input 
              type="range" min="4000000" max="20000000" step="500000" 
              value={expectedSalary} 
              onChange={e => setExpectedSalary(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#C8A97E", cursor: "pointer", marginTop: "0.5rem" }}
            />
         </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        {/* Bagian Kiri: Sliders Hard Skill & Soft Skill */}
        <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", textTransform: "uppercase", margin: 0 }}>Technical Competencies (Hard Skills)</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 60, height: 4, background: "#1A1A1A", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(Object.keys(scores).length / COMPETENCIES.length) * 100}%`, height: "100%", background: allCoreFilled ? "#74C476" : "#C8A97E", transition: "width 0.3s" }} />
                </div>
                <span style={{ color: allCoreFilled ? "#74C476" : "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>
                  {Object.keys(scores).length}/{COMPETENCIES.length}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>
              {COMPETENCIES.map(c => (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "#DDD", fontSize: "0.75rem", fontWeight: 500 }}>{c.icon} {c.short}</span>
                    <span style={{ color: c.color, fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700 }}>{scores[c.id] || 0}</span>
                  </div>
                  <input type="range" min="0" max="5" step="1" value={scores[c.id] || 0} onChange={e => setScores({ ...scores, [c.id]: parseInt(e.target.value) })} style={{ width: "100%", accentColor: c.color, cursor: "pointer" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", textTransform: "uppercase", margin: 0 }}>Culture Fit & Soft Skills</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 60, height: 4, background: "#1A1A1A", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(Object.keys(softScores).length / SOFT_SKILLS.length) * 100}%`, height: "100%", background: allSoftFilled ? "#74C476" : "#C8A97E", transition: "width 0.3s" }} />
                </div>
                <span style={{ color: allSoftFilled ? "#74C476" : "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>
                  {Object.keys(softScores).length}/{SOFT_SKILLS.length}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>
              {SOFT_SKILLS.map(c => (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "#DDD", fontSize: "0.75rem", fontWeight: 500 }}>{c.icon} {c.short}</span>
                    <span style={{ color: c.color, fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700 }}>{softScores[c.id] || 0}</span>
                  </div>
                  <input type="range" min="0" max="5" step="1" value={softScores[c.id] || 0} onChange={e => setSoftScores({ ...softScores, [c.id]: parseInt(e.target.value) })} style={{ width: "100%", accentColor: c.color, cursor: "pointer" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Radar Chart & Report */}
        <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem", height: 350, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontFamily: "'DM Mono', monospace" }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'transparent' }} axisLine={false} tickLine={false} />
                <Radar name="Ideal Target" dataKey="Ideal" stroke="#555" fill="#555" fillOpacity={0.1} />
                <Radar name="Candidate Eval" dataKey="Candidate" stroke="#C8A97E" fill="#C8A97E" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', color: '#FFF', fontSize: '0.8rem' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <motion.div animate={{ borderColor: finalDecisionColor }} style={{ background: "#111", border: "2px solid #1E1E1E", borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
            <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Final Recommendation</div>
            <div style={{ color: finalDecisionColor, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, margin: "0.5rem 0" }}>
              {allFilled ? decision.score.toFixed(2) : "—"}
            </div>
            <div style={{ background: `${finalDecisionColor}15`, display: "inline-block", padding: "0.5rem 1rem", borderRadius: 4, color: finalDecisionColor, fontFamily: "'DM Mono', monospace", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              {allFilled ? finalDecisionLabel : "Awaiting Evaluation Input"}
            </div>
            
            {/* Munculin Report Disini */}
            {getReport()}

                        {/* Predictive ROI Engine UI */}
            {allFilled && (
              <div style={{ background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.2rem", marginTop: "1rem", textAlign: "left", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ borderRight: "1px solid #222" }}>
                  <div style={{ color: "#888", fontSize: "0.65rem", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "0.2rem" }}>Est. Break-Even</div>
                  <div style={{ color: "#C8A97E", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>{breakEven} <span style={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", fontWeight: "normal", color: "#666" }}>Months</span></div>
                </div>
                <div style={{ paddingLeft: "0.5rem" }}>
                  <div style={{ color: "#888", fontSize: "0.65rem", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "0.2rem" }}>1-Year Retention</div>
                  <div style={{ color: "#74C476", fontSize: "1.5rem", fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>{retention}<span style={{ fontSize: "1rem", fontWeight: "normal", color: "#666" }}>%</span></div>
                </div>
              </div>
            )}

            {/* Tombol Print / Download PDF */}
            <button onClick={() => window.print()} 
              style={{ width: "100%", marginTop: "1.5rem", background: "#C8A97E", border: "none", color: "#0D0D0D", padding: "0.8rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
              📄 Download / Print Candidate Report
            </button>

            {/* Tombol Reset Pindah Ke Dalam Sini */}
            <button 
              onClick={() => {
    if (!allFilled) return;
                recordEval?.(decision.score, finalDecisionLabel);
    if (decision.score >= 4.0) { fireConfetti?.(); showToast?.("🏆 STRONG HIRE saved to shortlist!", "#74C476"); }
    else if (decision.score >= 3.5) { showToast?.("✓ Candidate saved to comparison pool", "#C8A97E"); }
    else { showToast?.("⚠️ Candidate saved — review recommended", "#E8C35A"); }
    setSavedCandidates(prev => [...prev, {
      name: candidateName || "Anonymous",
      salary: expectedSalary,
      score: decision.score,
      label: finalDecisionLabel,
      color: finalDecisionColor,
      scores: {...scores},
      softScores: {...softScores}
    }]);
    setCandidateName(""); 
    setExpectedSalary(8000000); 
    setScores({}); 
    setSoftScores({});
  }}
  style={{ width: "100%", marginTop: "0.75rem", background: allFilled ? "#1A2A1A" : "transparent", border: `1px solid ${allFilled ? "#74C476" : "#2A2A2A"}`, color: allFilled ? "#74C476" : "#555", padding: "0.75rem", borderRadius: 4, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
  + Save & Compare Next Candidate
</button>

<button onClick={() => { setCandidateName(""); setExpectedSalary(8000000); setScores({}); setSoftScores({}); }} 
  style={{ width: "100%", marginTop: "0.5rem", background: "transparent", border: "1px solid #2A2A2A", color: "#555", padding: "0.75rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
  ↺ Reset Without Saving
</button>

 </motion.div>
    </div>
  </div>

  {savedCandidates.length > 0 && (
    <div style={{ marginTop: "3rem", borderTop: "1px dashed #333", paddingTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Comparison Pool</div>
          <h3 style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", margin: "0.25rem 0 0" }}>Candidate Shortlist</h3>
        </div>
        <button onClick={() => setSavedCandidates([])} style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#555", padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
          Clear All
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: "0.78rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
              {["Rank", "Candidate", "Weighted Score", "Expected Salary", "Recommendation"].map(h => (
                <th key={h} style={{ color: "#555", textAlign: "left", padding: "0.75rem 1rem", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...savedCandidates]
              .sort((a, b) => b.score - a.score)
              .map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1A1A1A", background: i === 0 ? "#0F1A0F" : "transparent" }}>
                  <td style={{ padding: "1rem", color: i === 0 ? "#74C476" : "#555" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </td>
                  <td style={{ padding: "1rem", color: "#F0EAE0", fontWeight: i === 0 ? 700 : 400 }}>{c.name}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ color: c.color, fontSize: "1.1rem", fontWeight: 700 }}>{c.score.toFixed(2)}</span>
                    <span style={{ color: "#444", fontSize: "0.7rem" }}> / 5.00</span>
                  </td>
                  <td style={{ padding: "1rem", color: "#888" }}>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(c.salary)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ background: `${c.color}15`, border: `1px solid ${c.color}40`, color: c.color, padding: "0.3rem 0.6rem", borderRadius: 3, fontSize: "0.7rem" }}>
                      {c.label}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
            <button 
        onClick={downloadCSV} 
        style={{ marginTop: "1.5rem", width: "100%", background: "transparent", border: "1px solid #6BAED6", color: "#6BAED6", padding: "0.8rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", transition: "all 0.3s" }}
        onMouseOver={(e) => { e.target.style.background = "#6BAED6"; e.target.style.color = "#000"; }}
        onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#6BAED6"; }}
      >
        📥 Download Data as CSV (Excel)
      </button>
    </div>
  )}

      {savedCandidates.length >= 2 && (
        <div style={{ marginTop: "2rem", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 8, padding: "2rem" }}>
          <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
            [ COMPETENCY COMPARISON CHART ]
          </div>
                    <ResponsiveContainer width="100%" height={300}>
            <BarChart data={COMPETENCIES.map(c => ({
              name: c.short,
              ...Object.fromEntries(savedCandidates.map((cand, i) => [`${cand.name.split(" ")[0]} #${i + 1}`, cand.scores[c.id] || 0]))
            }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }} />
              <Legend wrapperStyle={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' }} />
              {savedCandidates.map((cand, i) => (
                <Bar key={i} dataKey={`${cand.name.split(" ")[0]} #${i + 1}`} fill={["#C8A97E","#74C476","#6BAED6","#9B8EC4","#E8835A"][i % 5]} radius={[3,3,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ marginTop: "3rem", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 8, padding: "2rem" }}>
        <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
          [ SCIENCE REFERENCE — Validity Coefficients (Schmidt & Hunter, 2016) ]
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {[
            { method: "Work Sample Tests", coef: 0.54, color: "#74C476", note: "Used in Round 2" },
            { method: "Structured Interview", coef: 0.51, color: "#C8A97E", note: "All 3 rounds" },
            { method: "Cognitive Ability", coef: 0.51, color: "#9B8EC4", note: "Case study proxy" },
            { method: "Resume Screening", coef: 0.18, color: "#E8C35A", note: "Baseline only" },
            { method: "Years of Experience", coef: 0.16, color: "#E8835A", note: "Not predictive" },
            { method: "Reference Checks", coef: 0.26, color: "#6BAED6", note: "Supplementary" },
          ].map(d => (
            <div key={d.method} style={{ background: "#111", border: `1px solid ${d.color}22`, borderRadius: 6, padding: "1.25rem", textAlign: "center" }}>
              <div style={{ color: d.color, fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700 }}>{d.coef}</div>
              <div style={{ color: "#DDD", fontSize: "0.78rem", fontWeight: 500, margin: "0.4rem 0 0.25rem" }}>{d.method}</div>
              <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.62rem" }}>{d.note}</div>
              <div style={{ marginTop: "0.75rem", height: 4, background: "#1A1A1A", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${d.coef * 100}%`, height: "100%", background: d.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem", color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", textAlign: "center" }}>
          Validity coefficient = correlation between selection method and actual job performance (0 = none, 1 = perfect)
        </div>
      </div>

</motion.div>
);
}

// ── FUNNEL ──
function FunnelChart() {
  const [sourcing, setSourcing] = useState(15);
  const [screening, setScreening] = useState(10);
  const [interview, setInterview] = useState(15);
  const [offer, setOffer] = useState(5);
  const [hiresPerYear, setHiresPerYear] = useState(10);

  // Algoritma Optimasi Pulse Digital
  const optSourcing = Math.max(Math.round(sourcing * 0.45), 3);
  const optScreening = Math.max(Math.round(screening * 0.5), 2);
  const optInterview = Math.max(Math.round(interview * 0.9), 5); // Interview dijaga ketat biar kualitas gak turun
  const optOffer = Math.max(Math.round(offer * 0.6), 2);

  const currentTotal = sourcing + screening + interview + offer;
  const optTotal = optSourcing + optScreening + optInterview + optOffer;
  const efficiency = Math.round(((currentTotal - optTotal) / currentTotal) * 100);

  const data = [
    { name: 'Sourcing', Current: sourcing, Optimized: optSourcing },
    { name: 'Screening', Current: screening, Optimized: optScreening },
    { name: 'Interview', Current: interview, Optimized: optInterview },
    { name: 'Offer', Current: offer, Optimized: optOffer },
  ];

  const getAdvice = () => {
    let advice = [];
    if (sourcing > 10) advice.push(<li key="1"><strong style={{color:"#C8A97E"}}>Sourcing ({sourcing} days):</strong> Expand channels (e.g., global reach like MENA/APAC) and use automated parsing to cut this down to {optSourcing} days.</li>);
    if (screening > 7) advice.push(<li key="2"><strong style={{color:"#C8A97E"}}>Screening ({screening} days):</strong> Implement <strong>Blind Screening</strong> and non-compensatory scoring rules. Filter out candidates failing critical hurdles instantly to reach {optScreening} days.</li>);
    if (interview > 10) advice.push(<li key="3"><strong style={{color:"#C8A97E"}}>Interview ({interview} days):</strong> Standardize the 3-round process. Apply the <strong>No-Huddle Rule</strong>: use strict scoring rubrics to prevent endless deliberation.</li>);
    if (offer > 3) advice.push(<li key="4"><strong style={{color:"#C8A97E"}}>Offer ({offer} days):</strong> Use transparent compensation models upfront to reduce negotiation ping-pong. Target: {optOffer} days.</li>);
    
    if(advice.length === 0) return <div style={{ color: "#74C476", padding: "1rem" }}>Your process is highly optimized! Maintain current standards.</div>;
    return <ul style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.8rem", color: "#AAA", fontSize: "0.85rem", lineHeight: 1.6 }}>{advice}</ul>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 02 — Process Optimization</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 1rem" }}>Hiring Efficiency Simulator</h2>
        <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem", maxWidth: 700 }}>
          Input your company's current recruitment timeline below. The system will simulate how the Pulse Digital framework (Blind Screening, Structured Rubrics, No-Huddle Rules) can compress your time-to-hire.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
        {/* Kiri: Slider Input Perusahaan */}
        <div style={{ flex: "1 1 300px", background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
          <h3 style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "1.5rem" }}>Your Current Timeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {[
              { label: "Sourcing", val: sourcing, set: setSourcing, max: 40 },
              { label: "Screening", val: screening, set: setScreening, max: 30 },
              { label: "Interviewing", val: interview, set: setInterview, max: 40 },
              { label: "Offer & Nego", val: offer, set: setOffer, max: 20 }
            ].map(stage => (
              <div key={stage.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#DDD", fontSize: "0.8rem", fontWeight: 500 }}>{stage.label}</span>
                  <span style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 700 }}>{stage.val} days</span>
                </div>
                <input type="range" min="1" max={stage.max} step="1" value={stage.val} onChange={e => stage.set(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#555", cursor: "pointer" }} />
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <span style={{ color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase" }}>Current Total</span>
             <span style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700 }}>{currentTotal} <span style={{fontSize: "1rem", fontFamily: "'DM Mono', monospace", color: "#666"}}>days</span></span>
          </div>
        </div>

        {/* Kanan: Grafik Real-time */}
        <div style={{ flex: "1 1 450px", background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem 1.5rem 1rem 0", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis stroke="#555" tick={{ fill: '#555', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#1A1A1A' }} contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '8px', color: '#FFF', fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }} />
              <Legend wrapperStyle={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', paddingTop: '10px' }} />
              <Bar dataKey="Current" name="Your Timeline" fill="#2A2A2A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Optimized" name="Pulse Digital Model" fill="#C8A97E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bawah: AI Report & ROI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Kolom Report / Rekomendasi */}
        <div style={{ background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem", flex: 2 }}>
          <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
            [ STRATEGIC RECOMMENDATIONS ]
          </div>
          {getAdvice()}
        </div>

        {/* Kolom ROI Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
          <div style={{ background: "rgba(200, 169, 126, 0.05)", border: "1px solid rgba(200, 169, 126, 0.3)", borderRadius: 6, padding: "1.5rem", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>New Optimized Target</div>
            <div style={{ color: "#C8A97E", fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>{optTotal} <span style={{ fontSize: "1rem", fontWeight: 400, fontFamily: "'DM Mono', monospace" }}>days</span></div>
          </div>
          <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.5rem", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: "#74C476", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Efficiency Gain</div>
            <div style={{ color: "#74C476", fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>{efficiency}<span style={{ fontSize: "1.5rem", fontWeight: 400 }}>%</span></div>
          </div>
        </div>

      </div>
      
      <div style={{ background: "#111", border: "1px solid #C8A97E", borderRadius: 8, padding: "1.5rem", marginTop: "2rem", textAlign: "center" }}>
        <h3 style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "1rem" }}>Financial Impact Simulator</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#DDD", fontSize: "0.8rem" }}>How many hires per year?</span>
              <span style={{ color: "#C8A97E", fontWeight: "bold" }}>{hiresPerYear} Hires</span>
            </div>
            <input type="range" min="1" max="50" step="1" value={hiresPerYear} onChange={e => setHiresPerYear(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#C8A97E", cursor: "pointer" }} />
          </div>
          
          <div style={{ marginTop: "1rem" }}>
            <div style={{ color: "#555", fontSize: "0.75rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Projected Annual Savings</div>
            <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>
              ${(hiresPerYear * 800).toLocaleString()} 
              <span style={{ fontSize: "1.2rem", color: "#888", display: "block", marginTop: "0.2rem", fontFamily: "'DM Mono', monospace" }}>(~Rp {(hiresPerYear * 12000000).toLocaleString("id-ID")})</span>
            </div>
          </div>

          <p style={{ color: "#888", fontSize: "0.8rem", maxWidth: "600px", lineHeight: 1.6, marginTop: "1rem" }}>
            💡 <strong>How is this calculated?</strong> By cutting the process to 30 days and filtering bad candidates early (saving interviewers' time), the Pulse Digital method reduces average cost-per-hire from $3,200 to $2,400.
          </p>

          <button onClick={() => window.print()} style={{ marginTop: "1.5rem", background: "#C8A97E", border: "none", color: "#0D0D0D", padding: "0.8rem 2rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
            📄 Download / Print ROI Proposal
          </button>
        </div>
      </div>

    </motion.div>
  );
}

// ── SALARY ──
function SalaryBench() {
  const [currency, setCurrency] = useState("idr");
  const [exp, setExp] = useState("mid");

  const data = SALARY_DATA[currency][exp];
  const pulse = SALARY_DATA.pulse[currency];
  const unit = currency === "idr" ? "Jt IDR/bulan" : "K USD/tahun";

  const pctAbove = currency === "idr"
    ? Math.round(((pulse[0] - data[1]) / data[1]) * 100)
    : Math.round(((pulse[0] * 1000 - data[1] * 1000) / (data[1] * 1000)) * 100);

  // State untuk Simulator (Sinkron dengan data yang dipilih)
  const [offeredSalary, setOfferedSalary] = useState(data[1]);

  // Update slider otomatis kalau tombol IDR/USD atau exp diganti
  useEffect(() => {
    setOfferedSalary(data[1]);
  }, [currency, exp, data]);

  // Logika dinamis ngikutin persentil IDR/USD
  const getMetrics = (val) => {
    const med = data[1];
    const p75 = data[2];
    if (val < med * 0.9) return { acc: 35, days: 65, risk: "HIGH", color: "#E8835A", label: "Below Market" };
    if (val < p75 * 0.95) return { acc: 65, days: 40, risk: "MODERATE", color: "#E8C35A", label: "Market Average" };
    if (val <= p75 * 1.25) return { acc: 85, days: 20, risk: "LOW", color: "#74C476", label: "Premium / Pulse" };
    return { acc: 95, days: 10, risk: "VERY LOW", color: "#C8A97E", label: "Top 1% Tier" };
  };

  const metrics = getMetrics(offeredSalary);
  const formatVal = (val) => currency === "idr" ? `Rp ${val} Jt/mo` : `$${val}k/yr`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 03 — Compensation Intelligence</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 2rem" }}>Salary Strategy & Retention</h2>
      </div>

      {/* --- 1. BAGIAN LAMA: BENCHMARKING (TETAP ADA) --- */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {["idr", "usd"].map(c => (
          <button key={c} onClick={() => setCurrency(c)} style={{
            background: currency === c ? "#C8A97E" : "#111", border: `1px solid ${currency === c ? "#C8A97E" : "#2A2A2A"}`,
            color: currency === c ? "#0D0D0D" : "#888", padding: "0.6rem 1.25rem",
            fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 4, cursor: "pointer"
          }}>{c === "idr" ? "🇮🇩 IDR" : "🇺🇸 USD"}</button>
        ))}
        {["entry", "mid", "senior"].map(e => (
          <button key={e} onClick={() => setExp(e)} style={{
            background: exp === e ? "#1A1A1A" : "transparent", border: `1px solid ${exp === e ? "#C8A97E" : "#2A2A2A"}`,
            color: exp === e ? "#C8A97E" : "#666", padding: "0.6rem 1.25rem",
            fontFamily: "'DM Mono', monospace", fontSize: "0.75rem",
            letterSpacing: "0.08em", textTransform: "capitalize", borderRadius: 4, cursor: "pointer"
          }}>{e === "entry" ? "0-2yr" : e === "mid" ? "3-5yr" : "5+yr"}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "25th Percentile", val: data[0], sub: "Market floor", c: "#444" },
          { label: "Median (50th)", val: data[1], sub: "Market center", c: "#888" },
          { label: "75th Percentile", val: data[2], sub: "Market ceiling", c: "#AAA" },
        ].map(d => (
          <div key={d.label} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{d.label}</div>
            <div style={{ color: d.c, fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, marginTop: "0.5rem" }}>{d.val}</div>
            <div style={{ color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", marginTop: "0.25rem" }}>{unit}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#111", border: "2px solid #C8A97E", borderRadius: 8, padding: "1.5rem", marginBottom: "3rem" }}>
        <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>✦ Pulse Digital Positioning — Premium Employer Strategy</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700 }}>
              {pulse[0]} – {pulse[1]}
            </div>
            <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>{unit}</div>
          </div>
          <div style={{ background: "#1A2A1A", border: "1px solid #2A4A2A", borderRadius: 4, padding: "0.75rem 1.25rem", textAlign: "center" }}>
            <div style={{ color: "#74C476", fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.25rem" }}>+{pctAbove}%</div>
            <div style={{ color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>above market median</div>
          </div>
        </div>
      </div>

      {/* --- 2. BAGIAN BARU: INTERACTIVE SIMULATOR YANG SINKRON --- */}
      <div style={{ borderTop: "1px dashed #333", paddingTop: "3rem", marginBottom: "2rem", textAlign: "center" }}>
        <h3 style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "1.5rem", letterSpacing: "0.1em" }}>Interactive Retention Simulator</h3>
        
        <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ color: metrics.color, fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, marginBottom: "0.5rem", transition: "color 0.3s" }}>
            {formatVal(offeredSalary)}
          </div>
          
          <div style={{ background: `${metrics.color}15`, display: "inline-block", padding: "0.4rem 1rem", borderRadius: 20, color: metrics.color, fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 700, marginBottom: "2rem" }}>
            {metrics.label} Strategy
          </div>
          
          <input 
            type="range" min={data[0] * 0.7} max={data[2] * 1.5} step={currency === "idr" ? 0.5 : 2} 
            value={offeredSalary} 
            onChange={e => setOfferedSalary(parseFloat(e.target.value))}
            style={{ width: "100%", maxWidth: "600px", accentColor: metrics.color, cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "600px", margin: "0.5rem auto 0", color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
            <span>Low ({formatVal(Math.round(data[0] * 0.7))})</span>
            <span>Median ({formatVal(data[1])})</span>
            <span>High ({formatVal(Math.round(data[2] * 1.5))})</span>
          </div>
        </div>

        {/* 3 Impact Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "#141414", border: `1px solid ${metrics.color}40`, borderRadius: 8, padding: "1.5rem", textAlign: "center", transition: "all 0.3s" }}>
            <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "1rem" }}>Offer Acceptance Rate</div>
            <div style={{ color: metrics.color, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>{metrics.acc}%</div>
            <div style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem" }}>Likelihood candidate signs</div>
          </div>
          
          <div style={{ background: "#141414", border: `1px solid ${metrics.color}40`, borderRadius: 8, padding: "1.5rem", textAlign: "center", transition: "all 0.3s" }}>
            <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "1rem" }}>Time to Fill Role</div>
            <div style={{ color: metrics.color, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>{metrics.days} <span style={{fontSize: "1rem"}}>days</span></div>
            <div style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem" }}>Average days vacant</div>
          </div>

          <div style={{ background: "#141414", border: `1px solid ${metrics.color}40`, borderRadius: 8, padding: "1.5rem", textAlign: "center", transition: "all 0.3s" }}>
            <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "1rem" }}>1-Year Turnover Risk</div>
            <div style={{ color: metrics.color, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>{metrics.risk}</div>
            <div style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem" }}>Probability of early resignation</div>
          </div>
        </div>

        {/* AI Report */}
        <div style={{ background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 8, padding: "2rem", textAlign: "left" }}>
          <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
            [ STRATEGIC IMPACT REPORT ]
          </div>
          
          <div style={{ color: "#AAA", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            {offeredSalary < data[1] * 0.9 && (
               <span>⚠️ <strong>Warning:</strong> The offered salary is significantly below the market median. While it seems like saving money initially, it leads to a very slow <strong>{metrics.days}-day hiring cycle</strong> and a <strong>{metrics.risk} risk</strong> of turnover. You will likely spend more money continuously replacing and retraining staff.</span>
            )}
            {offeredSalary >= data[1] * 0.9 && offeredSalary < data[2] * 0.95 && (
               <span>⚖️ <strong>Analysis:</strong> This offer is standard. You have a fair <strong>{metrics.acc}% chance</strong> of securing the candidate. However, your top-tier talent might still be poached by aggressive competitors. Turnover risk remains <strong>{metrics.risk}</strong>.</span>
            )}
            {offeredSalary >= data[2] * 0.95 && (
               <span>✅ <strong>Pulse Digital Premium Strategy:</strong> By offering a top-percentile salary, you transform compensation into a powerful retention tool. Hiring time drops to just <strong>{metrics.days} days</strong>, and the <strong>{metrics.risk} turnover risk</strong> saves the company massive hidden costs. <strong>This is an investment, not a cost.</strong></span>
            )}
          </div>

          <button onClick={() => window.print()} style={{ width: "100%", background: "#C8A97E", border: "none", color: "#0D0D0D", padding: "1rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>
            📄 Download / Print Salary Strategy Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── SCORECARD ──
function Scorecard() {
  const [candidate, setCandidate] = useState("");
  const [university, setUniversity] = useState("");
  const [company, setCompany] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [round, setRound] = useState("Round 1 — Initial Screening");
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [isBlindMode, setIsBlindMode] = useState(false); 

  // Stage-Gate Logic: Matikan Blind Mode otomatis kalau bukan Round 1
  useEffect(() => {
    if (round !== "Round 1 — Initial Screening") {
      setIsBlindMode(false);
    }
  }, [round]);
  
  const decision = getDecision(scores);
  const allFilled = COMPETENCIES.every(c => scores[c.id] !== undefined);
  const handlePrint = () => window.print();

  // Structured Rubric Intelligence (Dari PDF Interview Scoring Rubric)
  const getRubricText = (compId, score) => {
    if (!score) return "Select a score to view rubric criteria.";
    if (score >= 4) {
      const texts = {
        analytics: "Builds custom reports, understands multi-touch attribution.",
        paid: "Manages large budgets efficiently, optimizes ROAS/CAC.",
        seo: "Deep technical SEO & content architecture knowledge.",
        copy: "Drives conversions, adapts brand voice perfectly.",
        abtesting: "Uses statistical significance and clear hypothesis.",
        email: "Designs complex automations, maintains high deliverability.",
        social: "Focuses on community building and viral mechanics.",
        pm: "Flawless execution, Agile/Scrum methodology mastery."
      };
      return <span style={{color: "#74C476"}}>✅ <strong>Green Flag:</strong> {texts[compId]}</span>;
    } else if (score === 3) {
       return <span style={{color: "#E8C35A"}}>⚖️ <strong>Standard:</strong> Meets baseline expectations. Needs guidance for complex strategy.</span>;
    } else {
      const texts = {
        analytics: "Only tracks vanity metrics (likes, pageviews).",
        paid: "Wastes budget, poor targeting, relies on broad match.",
        seo: "Keyword stuffing, ignores technical & off-page SEO.",
        copy: "Generic AI-like text, poor grammar, no brand alignment.",
        abtesting: "Tests randomly without hypothesis or statistical rigor.",
        email: "Spammy tactics, ignores list segmentation.",
        social: "Only posts updates, lacks engagement/community strategy.",
        pm: "Misses deadlines consistently, poor team communication."
      };
      return <span style={{color: "#E8835A"}}>⚠️ <strong>Red Flag:</strong> {texts[compId]}</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 04 — Interview Evaluation</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 1rem" }}>Structured Scorecard</h2>
        </div>
        
        {/* Tombol Blind Mode (Bisa Disable) */}
        <button 
          onClick={() => setIsBlindMode(!isBlindMode)} 
          disabled={round !== "Round 1 — Initial Screening"}
          style={{
            background: isBlindMode ? "#74C476" : "#111", border: `1px solid ${isBlindMode ? "#74C476" : "#2A2A2A"}`,
            color: isBlindMode ? "#0D0D0D" : "#888", padding: "0.6rem 1rem", borderRadius: 6,
            fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700, 
            cursor: round !== "Round 1 — Initial Screening" ? "not-allowed" : "pointer",
            marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.3s",
            opacity: round !== "Round 1 — Initial Screening" ? 0.4 : 1
          }}>
          {isBlindMode ? "👁️‍🗨️ BLIND MODE: ACTIVE" : "👁️ BLIND MODE: OFF"}
        </button>
      </div>
      
      {round !== "Round 1 — Initial Screening" && (
        <div style={{ color: "#E8835A", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", textAlign: "right", marginTop: "-1.5rem", marginBottom: "1.5rem" }}>
          *Blind mode is disabled for advanced interview rounds.
        </div>
      )}

      {/* Grid Profil Kandidat dengan Fitur Redaction */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem", background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
        
        {/* Nama */}
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Candidate Name</label>
          <input 
            value={isBlindMode && candidate ? `ID: #${(candidate.length * 84).toString().padStart(4, '0')}` : candidate} 
            onChange={e => setCandidate(e.target.value)} placeholder="Full Name" disabled={isBlindMode}
            style={{ 
              background: isBlindMode && candidate ? "#0A1A0A" : "#141414", border: "1px solid #2A2A2A", borderRadius: 4, 
              color: isBlindMode && candidate ? "#74C476" : "#F0EAE0", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", 
              fontSize: "0.8rem", width: "100%", boxSizing: "border-box", transition: "all 0.3s"
            }} 
          />
        </div>

        {/* Kampus */}
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>University</label>
          <input 
            value={isBlindMode && university ? `[UNIVERSITY TIER ${university.length % 3 + 1}]` : university} 
            onChange={e => setUniversity(e.target.value)} placeholder="e.g. ITB / UI" disabled={isBlindMode}
            style={{ 
              background: isBlindMode && university ? "#0A1A0A" : "#141414", border: "1px solid #2A2A2A", borderRadius: 4, 
              color: isBlindMode && university ? "#74C476" : "#F0EAE0", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", 
              fontSize: "0.8rem", width: "100%", boxSizing: "border-box", transition: "all 0.3s"
            }} 
          />
        </div>

        {/* Perusahaan Lama */}
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Prev. Company</label>
          <input 
            value={isBlindMode && company ? `[REDACTED EMPLOYER]` : company} 
            onChange={e => setCompany(e.target.value)} placeholder="e.g. Gojek / Shopee" disabled={isBlindMode}
            style={{ 
              background: isBlindMode && company ? "#0A1A0A" : "#141414", border: "1px solid #2A2A2A", borderRadius: 4, 
              color: isBlindMode && company ? "#74C476" : "#F0EAE0", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", 
              fontSize: "0.8rem", width: "100%", boxSizing: "border-box", transition: "all 0.3s"
            }} 
          />
        </div>

        {/* Interviewer */}
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Interviewer</label>
          <input value={interviewer} onChange={e => setInterviewer(e.target.value)} placeholder="Your Name"
            style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", width: "100%", boxSizing: "border-box" }} />
        </div>

        {/* Round Dropdown */}
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Stage Gate</label>
          <select value={round} onChange={e => setRound(e.target.value)}
            style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#C8A97E", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", width: "100%", boxSizing: "border-box", fontWeight: "bold" }}>
            <option>Round 1 — Initial Screening</option>
            <option>Round 2 — Case Study Assessment</option>
            <option>Round 3 — Team & Culture Interview</option>
          </select>
        </div>
      </div>

      {/* Grid Competencies dengan Rubrik Otomatis */}
      <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
        {COMPETENCIES.map(c => (
          <motion.div whileHover={{ scale: 1.01 }} key={c.id} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{c.icon}</span>
                <div>
                  <div style={{ color: "#DDD", fontSize: "0.85rem", fontWeight: 500 }}>{c.short}</div>
                  {c.critical && <span style={{ color: "#E8835A", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem" }}>● CRITICAL HURDLE</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setScores(s => ({ ...s, [c.id]: n }))} style={{
                    width: 34, height: 34, borderRadius: 4,
                    background: scores[c.id] >= n ? c.color : "#1A1A1A",
                    border: `1px solid ${scores[c.id] >= n ? c.color : "#2E2E2E"}`,
                    color: scores[c.id] >= n ? "#0D0D0D" : "#555",
                    fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s"
                  }}>{n}</button>
                ))}
                <button onClick={() => setNotes(n => ({ ...n, [c.id]: n[c.id] !== undefined ? undefined : "" }))}
                  style={{ background: "transparent", border: "1px solid #2E2E2E", borderRadius: 4, color: "#555", width: 34, height: 34, cursor: "pointer", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                  📝
                </button>
              </div>
            </div>
            
            {/* Rubric Intelligence Box */}
            <div style={{ background: "#0A0A0A", borderLeft: `2px solid ${scores[c.id] >= 4 ? "#74C476" : scores[c.id] === 3 ? "#E8C35A" : scores[c.id] ? "#E8835A" : "#333"}`, padding: "0.6rem 0.8rem", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", color: "#888", marginBottom: notes[c.id] !== undefined ? "0.75rem" : 0 }}>
              {getRubricText(c.id, scores[c.id])}
            </div>

            {notes[c.id] !== undefined && (
              <textarea value={notes[c.id]} onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))}
                placeholder="Observed behaviors / specific evidence supporting this score..."
                style={{ background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 4, color: "#AAA", padding: "0.75rem", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 60 }} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Hasil Keputusan */}
      {allFilled && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#111", border: `2px solid ${decision.color}`, borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Final Assessment Result</div>
              <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", marginTop: "0.25rem", color: isBlindMode && candidate ? "#74C476" : "#F0EAE0", transition: "color 0.3s" }}>
                {isBlindMode && candidate ? `ID: #${(candidate.length * 84).toString().padStart(4, '0')}` : (candidate || "Anonymous Candidate")} 
                <span style={{ fontSize: "0.8rem", color: "#888", display: "block", fontFamily: "'DM Mono', monospace", marginTop: "0.2rem" }}>{round}</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: decision.color, fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700 }}>{decision.score.toFixed(2)}</div>
              <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>weighted avg / 5.00</div>
            </div>
            <div style={{ background: `${decision.color}22`, border: `1px solid ${decision.color}`, borderRadius: 4, padding: "0.75rem 1.25rem", color: decision.color, fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: 700, textAlign: "center", maxWidth: 220 }}>
              {decision.label}
            </div>
          </div>
          {interviewer && <div style={{ marginTop: "1rem", borderTop: "1px solid #222", paddingTop: "1rem", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", textTransform: "uppercase" }}>Evaluated by: {interviewer} · Date: {new Date().toLocaleDateString()}</div>}
        </motion.div>
      )}

      <button onClick={handlePrint} style={{
        background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 4, width: "100%",
        color: "#888", padding: "1rem", fontFamily: "'DM Mono', monospace",
        fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer", fontWeight: "bold", transition: "background 0.3s"
      }} onMouseOver={(e) => e.target.style.background = "#2A2A2A"} onMouseOut={(e) => e.target.style.background = "#1A1A1A"}>
        ⬡ Print / Export Scorecard
      </button>
    </motion.div>
  );
}


// ── D&I ──
function DIMetrics() {
  const [gender, setGender] = useState(43);
  const [bootcamp, setBootcamp] = useState(28);
  const [apac, setApac] = useState(38);
  const [mena, setMena] = useState(15);
  const [blind, setBlind] = useState(100);

  // Kalkulasi "Profitability & Innovation Score" berdasarkan target Pulse Digital
  const getScore = (val, target) => Math.min(val / target, 1);
  const avgScore = (getScore(gender, 40) + getScore(bootcamp, 20) + getScore(apac, 30) + getScore(mena, 20) + getScore(blind, 100)) / 5;
  
  // Max profit boost adalah 33% berdasarkan riset McKinsey
  const profitBoost = Math.round(avgScore * 33);
  
  const riskLevel = avgScore < 0.6 ? "HIGH RISK" : avgScore < 0.85 ? "MODERATE" : "LOW RISK";
  const riskColor = avgScore < 0.6 ? "#E8835A" : avgScore < 0.85 ? "#E8C35A" : "#74C476";

  const metricsData = [
    { id: 'gender', label: "Gender Diversity (Female%)", val: gender, set: setGender, target: 40, max: 100 },
    { id: 'bootcamp', label: "Bootcamp / Alt-Education Hires", val: bootcamp, set: setBootcamp, target: 20, max: 100 },
    { id: 'apac', label: "Geographic – APAC", val: apac, set: setApac, target: 30, max: 100 },
    { id: 'mena', label: "Geographic – MENA", val: mena, set: setMena, target: 20, max: 100 },
    { id: 'blind', label: "Blind Screening Adoption", val: blind, set: setBlind, target: 100, max: 100 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 05 — Diversity & Inclusion</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 1rem" }}>D&I Business Impact Simulator</h2>
        <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem", maxWidth: 750 }}>
          Diversity is not just a PR metric; it's a measurable driver of financial performance. Adjust your company's current D&I metrics below to see how reaching Pulse Digital's target standards impacts your profitability and innovation risk.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
        
        {/* Kiri: Interactive Sliders */}
        <div style={{ flex: "1 1 450px", display: "grid", gap: "1.2rem" }}>
          <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
            [ ADJUST COMPANY METRICS ]
          </div>
          {metricsData.map(m => {
            const isMet = m.val >= m.target;
            const barColor = isMet ? "#74C476" : "#E8835A";
            return (
              <div key={m.id} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span style={{ color: "#CCC", fontSize: "0.85rem" }}>{m.label}</span>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>Target: {m.target}%</span>
                    <span style={{ color: barColor, fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>{m.val}%</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max={m.max} step="1" value={m.val} onChange={e => m.set(parseInt(e.target.value))} 
                  style={{ width: "100%", accentColor: barColor, cursor: "pointer" }} 
                />
              </div>
            );
          })}
        </div>

        {/* Kanan: Real-Time Impact Meter */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ background: "#111", border: `1px solid ${profitBoost >= 30 ? "#C8A97E" : "#1E1E1E"}`, borderRadius: 8, padding: "2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
            {profitBoost >= 30 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#C8A97E", boxShadow: "0 0 15px #C8A97E" }} />}
            <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Projected Profitability Boost</div>
            <div style={{ color: profitBoost >= 30 ? "#C8A97E" : "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "4rem", fontWeight: 700, lineHeight: 1 }}>
              +{profitBoost}<span style={{ fontSize: "2rem", fontWeight: 400 }}>%</span>
            </div>
            <div style={{ color: "#555", fontSize: "0.75rem", marginTop: "0.5rem" }}>Based on McKinsey diversity data</div>
          </div>

          <div style={{ background: "#141414", border: `1px solid ${riskColor}40`, borderRadius: 8, padding: "1.5rem", textAlign: "center", transition: "all 0.3s" }}>
            <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Echo-Chamber & Innovation Risk</div>
            <div style={{ color: riskColor, fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700 }}>{riskLevel}</div>
            <div style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              {riskLevel === "HIGH RISK" ? "Homogeneous teams miss market blind spots." : riskLevel === "MODERATE" ? "Good foundation, but lacks global perspective." : "Highly resilient and innovative workforce."}
            </div>
          </div>

        </div>
      </div>

      {/* AI Gap Analysis Report (Buat Orang Awam/CEO) */}
      <div style={{ background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
          [ EXECUTIVE D&I GAP ANALYSIS ]
        </div>
        
        <ul style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.8rem", color: "#AAA", fontSize: "0.85rem", lineHeight: 1.6 }}>
          {blind < 100 && <li><strong style={{color:"#E8835A"}}>Unconscious Bias Warning:</strong> Blind screening adoption is below 100%. Your hiring managers may be inadvertently rejecting top talent based on name/university prejudice. <em>Action: Mandate blind resume reviews.</em></li>}
          {gender < 40 && <li><strong style={{color:"#E8C35A"}}>Gender Imbalance:</strong> Female representation is at {gender}%. You are missing out on key consumer perspectives. <em>Action: Audit job descriptions for masculine-coded language.</em></li>}
          {(apac < 30 || mena < 20) && <li><strong style={{color:"#E8C35A"}}>Geographic Concentration:</strong> Heavy reliance on local talent. <em>Action: Expand sourcing to {apac < 30 ? "APAC" : ""} {mena < 20 ? "& MENA" : ""} regions to capture emerging market insights and lower wage arbitrage.</em></li>}
          {bootcamp < 20 && <li><strong style={{color:"#6BAED6"}}>Educational Elitism:</strong> Only {bootcamp}% of hires are from non-traditional paths (bootcamps). You are overpaying for Ivy-league/Tier-1 degrees when skills-based assessments prove bootcampers perform equally well.</li>}
          {profitBoost >= 30 && <li style={{color: "#74C476", listStyleType: "none", marginLeft: "-1.2rem", marginTop: "0.5rem"}}>✅ <strong>Excellent Health:</strong> Your metrics align with top-quartile global companies. You are structurally positioned to outperform competitors by up to 33%.</li>}
        </ul>

        {/* Tombol Print untuk presentasi ke CEO */}
        <button onClick={() => window.print()} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #C8A97E", color: "#C8A97E", padding: "1rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase", marginTop: "1.5rem", transition: "all 0.3s" }} onMouseOver={(e) => { e.target.style.background = "#C8A97E"; e.target.style.color = "#000"; }} onMouseOut={(e) => { e.target.style.background = "#1A1A1A"; e.target.style.color = "#C8A97E"; }}>
          📄 Export D&I Impact Report for Leadership
        </button>
      </div>

      {/* FITUR LAMA: SCIENCE & BUSINESS IMPACT (TETAP ADA) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "#0F1F0F", border: "1px solid #1A3A1A", borderRadius: 8, padding: "1.5rem" }}>
          <div style={{ color: "#74C476", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>SCIENCE BASIS</div>
          <div style={{ color: "#CCC", fontSize: "0.83rem", lineHeight: 1.7 }}>
            Blind screening removes names, photos & university from first-round review.
            Research shows identical resumes with "white-sounding" names get <span style={{ color: "#74C476", fontWeight: 600 }}>50% more callbacks</span> (Bertrand & Mullainathan, 2004).
          </div>
        </div>
        <div style={{ background: "#0F1A2F", border: "1px solid #1A2A4A", borderRadius: 8, padding: "1.5rem" }}>
          <div style={{ color: "#6BAED6", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>BUSINESS IMPACT</div>
          <div style={{ color: "#CCC", fontSize: "0.83rem", lineHeight: 1.7 }}>
            Companies with diverse executive teams are <span style={{ color: "#6BAED6", fontWeight: 600 }}>33% more likely</span> to outperform on profitability (McKinsey).
            Diverse teams spot opportunities homogeneous teams miss.
          </div>
        </div>
      </div>
    </motion.div>
  );
}


// ── ONBOARDING ──
function Onboarding() {
  const [hireName, setHireName] = useState("");
  const [checked, setChecked] = useState({});
  const [blocker, setBlocker] = useState(""); // State buat fitur kendala/report

  // Data 100% dari PDF, diseimbangkan jadi 5 Task per fase biar simetris & rapi
  const tasks = [
    // Week 1 (5 Tasks)
    { id: "w1_1", phase: "Week 1 (Days 1-5)", task: "IT Setup: Laptop, accounts, tool access", owner: "IT Team", deliverable: "GA4, Meta, LinkedIn ready", color: "#6BAED6" },
    { id: "w1_2", phase: "Week 1 (Days 1-5)", task: "Meet manager for 1-on-1 kickoff", owner: "Manager", deliverable: "Clear 90-day objectives", color: "#C8A97E" },
    { id: "w1_3", phase: "Week 1 (Days 1-5)", task: "Meet onboarding buddy", owner: "HR", deliverable: "Schedule weekly check-ins", color: "#9B8EC4" },
    { id: "w1_4", phase: "Week 1 (Days 1-5)", task: "Shadow customer service (2 hours)", owner: "CS Manager", deliverable: "3+ key insights documented", color: "#C8A97E" },
    { id: "w1_5", phase: "Week 1 (Days 1-5)", task: "Audit current social media channels", owner: "Self", deliverable: "3+ improvement recommendations", color: "#74C476" },

    // Days 6-30 (5 Tasks)
    { id: "d30_1", phase: "Days 6-30 (Learning)", task: "Take over daily social media & drafts", owner: "Self", deliverable: "Consistent posting, manager approval", color: "#74C476" },
    { id: "d30_2", phase: "Days 6-30 (Learning)", task: "Setup tracking for new campaign", owner: "Self", deliverable: "Pixels & GA4 goals firing correctly", color: "#74C476" },
    { id: "d30_3", phase: "Days 6-30 (Learning)", task: "Month 1 / 30-Day performance review", owner: "Manager", deliverable: "Feedback session & alignment", color: "#C8A97E" },
    { id: "d30_4", phase: "Days 6-30 (Learning)", task: "Complete platform certifications", owner: "Self", deliverable: "Google Ads / Meta certs uploaded", color: "#74C476" },
    { id: "d30_5", phase: "Days 6-30 (Learning)", task: "Review competitor ad strategies", owner: "Self", deliverable: "Competitor matrix document", color: "#74C476" },

    // Days 31-60 (5 Tasks)
    { id: "d60_1", phase: "Days 31-60 (Execution)", task: "Launch & monitor independent campaign", owner: "Self", deliverable: "Campaign live, tracked daily", color: "#74C476" },
    { id: "d60_2", phase: "Days 31-60 (Execution)", task: "A/B test email subject lines", owner: "Self", deliverable: "Implement winning variant", color: "#74C476" },
    { id: "d60_3", phase: "Days 31-60 (Execution)", task: "Optimize underperforming ad campaign", owner: "Self", deliverable: "CPA reduced 10%+", color: "#74C476" },
    { id: "d60_4", phase: "Days 31-60 (Execution)", task: "60-day competency assessment", owner: "Manager", deliverable: "Progress on 2-3 development areas", color: "#C8A97E" },
    { id: "d60_5", phase: "Days 31-60 (Execution)", task: "Present monthly results to team", owner: "Self", deliverable: "Clear action items identified", color: "#74C476" },

    // Days 61-90 (5 Tasks)
    { id: "d90_1", phase: "Days 61-90 (Impact)", task: "Lead major campaign end-to-end", owner: "Self", deliverable: "ROI positive, learnings documented", color: "#74C476" },
    { id: "d90_2", phase: "Days 61-90 (Impact)", task: "Identify & implement process improvement", owner: "Self", deliverable: "Team efficiency +10%", color: "#74C476" },
    { id: "d90_3", phase: "Days 61-90 (Impact)", task: "Participate in budget planning", owner: "Manager", deliverable: "Data-driven allocation", color: "#C8A97E" },
    { id: "d90_4", phase: "Days 61-90 (Impact)", task: "90-day comprehensive review", owner: "Manager", deliverable: "Performance score 4.0+/5.0", color: "#C8A97E" },
    { id: "d90_5", phase: "Days 61-90 (Impact)", task: "Mentor new marketing team member", owner: "Self", deliverable: "Onboarding support provided", color: "#74C476" }
  ];

  const totalTasks = tasks.length;
  const completedTasks = Object.values(checked).filter(Boolean).length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getRiskStatus = () => {
    if (progressPercent < 25) return { label: "⚠️ HIGH FLIGHT RISK", desc: `${hireName || "New Hire"} is in the critical setup phase. Highly vulnerable to turnover if neglected.`, color: "#E8835A" };
    if (progressPercent < 60) return { label: "⚖️ RAMPING UP", desc: `${hireName || "New Hire"} is gaining momentum, but still requires continuous manager support.`, color: "#E8C35A" };
    if (progressPercent < 90) return { label: "📈 PRODUCTIVE", desc: `${hireName || "New Hire"} is executing independently. Approaching positive ROI for the company.`, color: "#7EB5A6" };
    return { label: "✅ FULLY AUTONOMOUS", desc: `${hireName || "New Hire"} is 100% integrated. Running campaigns independently with minimal oversight.`, color: "#74C476" };
  };

  const risk = getRiskStatus();
  const phases = [...new Set(tasks.map(t => t.phase))];

  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  // AI Obstacle Intervention Logic
  const getBlockerAdvice = () => {
    if (blocker === "it") return <span><strong>Action Plan:</strong> Escalate to IT Helpdesk via priority channel. Provide offline reading materials (Brand Book, Strategy PDFs) so {hireName || "the employee"} isn't sitting idle. Assign a temporary buddy for shadowing.</span>;
    if (blocker === "skill") return <span><strong>Action Plan:</strong> Adjust 30-day goals to prioritize learning over output. Pair {hireName || "them"} with a senior team member for a 2-hour technical walkthrough. Assign specific online certifications.</span>;
    if (blocker === "manager") return <span><strong>Action Plan:</strong> The manager is the #1 reason people resign. HR must enforce daily 15-minute morning standups between {hireName || "the employee"} and the manager to unblock immediate tasks and provide clear direction.</span>;
    if (blocker === "culture") return <span><strong>Action Plan:</strong> Schedule a casual 1-on-1 coffee break with an empathetic peer (not the manager). Revisit Pulse Digital's core values and ensure they feel psychologically safe asking "dumb" questions.</span>;
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 06 — Ramp-Up & Retention</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 1rem" }}>Interactive 90-Day Onboarding Engine</h2>
        <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem", maxWidth: 800 }}>
          Structured onboarding reduces early turnover by 82%. Use this interactive 30-60-90 day tracker to assign clear deliverables, monitor time-to-productivity, and mitigate flight risks. If obstacles occur, use the Intervention tool below.
        </p>
      </div>

      {/* Identitas & Real-Time Dashboard */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
        
        {/* Kolom Nama Karyawan */}
        <div style={{ flex: "1 1 250px", background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>New Hire Name</label>
          <input 
            value={hireName} onChange={e => setHireName(e.target.value)} placeholder="e.g. Budi Santoso"
            style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#C8A97E", padding: "0.75rem", fontFamily: "'DM Mono', monospace", fontSize: "1rem", width: "100%", boxSizing: "border-box", fontWeight: "bold" }} 
          />
        </div>

        <div style={{ flex: "1 1 300px", background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", textTransform: "uppercase" }}>Time-to-Productivity Progress</span>
            <span style={{ color: "#F0EAE0", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 700 }}>{progressPercent}%</span>
          </div>
          <div style={{ width: "100%", height: 8, background: "#222", borderRadius: 4, overflow: "hidden", marginBottom: "0.5rem" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", background: risk.color, transition: "width 0.5s ease-in-out, background 0.5s" }} />
          </div>
          <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", textAlign: "right" }}>{completedTasks} of {totalTasks} Deliverables Met</div>
        </div>

        <div style={{ flex: "1 1 300px", background: `${risk.color}15`, border: `1px solid ${risk.color}40`, borderRadius: 8, padding: "1.5rem", transition: "all 0.5s" }}>
          <div style={{ color: risk.color, fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "0.5rem" }}>
            {risk.label}
          </div>
          <div style={{ color: "#AAA", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {risk.desc}
          </div>
        </div>
      </div>

      {/* Interactive Checklist Columns (SIMETRIS: 4 Kolom, 5 Task per Kolom) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {phases.map(phase => (
          <div key={phase} style={{ background: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "1rem", color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              {phase}
            </div>
            <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {tasks.filter(t => t.phase === phase).map(t => (
                <div key={t.id} onClick={() => toggleCheck(t.id)} style={{ display: "flex", gap: "0.75rem", cursor: "pointer", opacity: checked[t.id] ? 0.4 : 1, transition: "opacity 0.2s" }}>
                  <div style={{ marginTop: "0.1rem" }}>
                    <div style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${checked[t.id] ? risk.color : "#444"}`, background: checked[t.id] ? risk.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {checked[t.id] && <span style={{ color: "#0D0D0D", fontSize: "0.6rem", fontWeight: "bold" }}>✓</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: checked[t.id] ? "#888" : "#E0E0E0", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.3rem", textDecoration: checked[t.id] ? "line-through" : "none", lineHeight: 1.3 }}>{t.task}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40`, padding: "0.15rem 0.3rem", borderRadius: 3, fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", textTransform: "uppercase" }}>{t.owner}</span>
                      <span style={{ color: "#666", fontSize: "0.65rem" }}>↪ {t.deliverable}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FITUR BARU: Obstacle Management & AI Intervention */}
      <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ color: "#E8835A", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", borderBottom: "1px solid #222", paddingBottom: "0.5rem" }}>
          [ BOTTLENECK & OBSTACLE INTERVENTION ]
        </div>
        <p style={{ color: "#AAA", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Onboarding rarely goes perfectly. Is {hireName || "the new hire"} stuck on a task? Select a bottleneck to generate a Manager Action Plan.
        </p>
        
        <select value={blocker} onChange={(e) => setBlocker(e.target.value)} style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", padding: "0.8rem", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", width: "100%", maxWidth: "500px", marginBottom: "1rem", cursor: "pointer" }}>
          <option value="">✅ No current bottlenecks (On Track)</option>
          <option value="it">⚠️ IT & System Access Delays</option>
          <option value="skill">⚠️ Skill Gap: Technical Execution</option>
          <option value="manager">⚠️ Lack of Manager Direction / Unavailable</option>
          <option value="culture">⚠️ Culture & Team Integration Struggles</option>
        </select>

        {blocker && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ background: "#1A0A0A", borderLeft: "3px solid #E8835A", padding: "1rem", color: "#DDD", fontSize: "0.85rem", lineHeight: 1.6 }}>
            {getBlockerAdvice()}
          </motion.div>
        )}
      </div>

      <button onClick={() => window.print()} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #333", color: "#888", padding: "1rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase", transition: "all 0.3s" }} onMouseOver={(e) => { e.target.style.background = "#2A2A2A"; e.target.style.color = "#FFF"; }} onMouseOut={(e) => { e.target.style.background = "#1A1A1A"; e.target.style.color = "#888"; }}>
        📄 Export 90-Day Ramp-Up & Intervention Plan
      </button>

    </motion.div>
  );
}

// ── QUESTION BANK ──
function QuestionBank() {
  const [activeRound, setActiveRound] = useState("all");
  const [activeComp, setActiveComp] = useState("all");
  const [notes, setNotes] = useState({});

  const QUESTIONS = [
    { id: 1, round: "Round 1", comp: "culture", text: "Walk me through your journey into digital marketing. What drew you to this field, and how has your focus evolved over time?", intent: "Self-awareness, career narrative clarity" },
    { id: 2, round: "Round 1", comp: "culture", text: "Looking at our company's current social media presence, what's your first impression? What would you keep doing, and what might you try differently?", intent: "Preparation, critical thinking, diplomacy" },
    { id: 3, round: "Round 1", comp: "culture", text: "Tell me about a time when a campaign you worked on completely flopped. What happened, and what did you take away from it?", intent: "Growth mindset, psychological safety signal" },
    { id: 4, round: "Round 1", comp: "analytics", text: "If I asked you to set up a lead generation campaign tomorrow, what platforms would you consider and why? Walk me through your thinking process.", intent: "Strategic thinking, platform knowledge" },
    { id: 5, round: "Round 1", comp: "email", text: "How do you typically approach audience segmentation for email campaigns? Give me a real example from your past work.", intent: "Technical depth, real-world application" },
    { id: 6, round: "Round 2", comp: "pm", text: "Our content calendar is running two weeks behind schedule, there's a product launch happening in 10 days, and your paid ad budget just got cut by 30%. How do you prioritize?", intent: "Prioritization under pressure, resourcefulness" },
    { id: 7, round: "Round 2", comp: "culture", text: "Describe a situation where you and a colleague had completely different ideas about how to approach a campaign. How did you work through it?", intent: "Collaborative problem-solving, ego-free communication" },
    { id: 8, round: "Round 2", comp: "analytics", text: "What's your process for staying current with platform algorithm changes and industry trends? How do you decide what's worth paying attention to versus what's just noise?", intent: "Learning agility, information filtering" },
    { id: 9, round: "Round 2", comp: "copy", text: "Tell me about a time you had to explain marketing metrics to someone who wasn't marketing-savvy. How did you make it meaningful to them?", intent: "Data storytelling, stakeholder communication" },
    { id: 10, round: "Round 3", comp: "culture", text: "Where do you see digital marketing heading in the next 2-3 years, and how are you preparing yourself for those changes?", intent: "Future orientation, proactive learning" },
    { id: 11, round: "Round 3", comp: "culture", text: "Think about the best manager you've ever had. What did they do that brought out your best work?", intent: "Management style fit, self-awareness" },
    { id: 12, round: "Round 3", comp: "culture", text: "We're a growing company, which means things change fast and roles evolve. How do you feel about your responsibilities potentially shifting as we scale?", intent: "Adaptability, ambiguity tolerance" },
    { id: 13, round: "Round 3", comp: "analytics", text: "If you could only focus on three metrics for the next quarter, which would you choose and why?", intent: "Strategic prioritization, business acumen" },
    { id: 14, round: "Round 3", comp: "culture", text: "Describe your ideal work environment. What helps you do your best work, and what tends to drain your energy?", intent: "Culture fit, self-awareness, retention signal" },
    { id: 15, round: "Round 3", comp: "culture", text: "What questions do you have for us?", intent: "Candidate engagement, critical evaluation of opportunity" },
  ];

  const rounds = ["all", "Round 1", "Round 2", "Round 3"];
  const compFilters = [
    { id: "all", label: "All Topics" },
    { id: "analytics", label: "Analytics" },
    { id: "email", label: "Email / CRM" },
    { id: "copy", label: "Copywriting" },
    { id: "pm", label: "Project Mgmt" },
    { id: "culture", label: "Culture & Soft" },
  ];

  const filtered = QUESTIONS.filter(q =>
    (activeRound === "all" || q.round === activeRound) &&
    (activeComp === "all" || q.comp === activeComp)
  );

  const roundColors = { "Round 1": "#C8A97E", "Round 2": "#7EB5A6", "Round 3": "#9B8EC4" };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 07 — Interview Intelligence</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 0.5rem" }}>Question Bank</h2>
        <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 700 }}>
          All 15 structured interview questions from the Pulse Digital framework, mapped by round and competency. Add your notes directly for each question.
        </p>
      </div>

      {/* Filter Round */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {rounds.map(r => (
          <button key={r} onClick={() => setActiveRound(r)} style={{
            background: activeRound === r ? "#C8A97E" : "#111",
            border: `1px solid ${activeRound === r ? "#C8A97E" : "#2A2A2A"}`,
            color: activeRound === r ? "#0D0D0D" : "#666",
            padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: "0.72rem",
            fontWeight: activeRound === r ? 700 : 400, textTransform: "uppercase"
          }}>{r === "all" ? "All Rounds" : r}</button>
        ))}
      </div>

      {/* Filter Competency */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {compFilters.map(c => (
          <button key={c.id} onClick={() => setActiveComp(c.id)} style={{
            background: activeComp === c.id ? "#1A1A1A" : "transparent",
            border: `1px solid ${activeComp === c.id ? "#C8A97E" : "#2A2A2A"}`,
            color: activeComp === c.id ? "#C8A97E" : "#555",
            padding: "0.4rem 0.85rem", borderRadius: 20, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: "0.68rem"
          }}>{c.label}</button>
        ))}
      </div>

      {/* Question Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map(q => (
          <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ background: `${roundColors[q.round]}20`, color: roundColors[q.round], border: `1px solid ${roundColors[q.round]}40`, padding: "0.25rem 0.6rem", borderRadius: 3, fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", fontWeight: 700 }}>{q.round}</span>
                <span style={{ color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>Q{q.id}</span>
              </div>
            </div>

            <p style={{ color: "#F0EAE0", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 1rem", fontWeight: 500 }}>
              "{q.text}"
            </p>

            <div style={{ background: "#0A0A0A", borderLeft: "2px solid #333", padding: "0.6rem 0.8rem", marginBottom: "1rem" }}>
              <span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", textTransform: "uppercase" }}>Evaluation Lens: </span>
              <span style={{ color: "#888", fontSize: "0.78rem" }}>{q.intent}</span>
            </div>

            <textarea
              value={notes[q.id] || ""}
              onChange={e => setNotes(n => ({ ...n, [q.id]: e.target.value }))}
              placeholder="Add interview notes here..."
              style={{ background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 4, color: "#AAA", padding: "0.75rem", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 60 }}
            />
          </motion.div>
        ))}
      </div>

      <button onClick={() => window.print()} style={{ width: "100%", marginTop: "2rem", background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888", padding: "1rem", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
        📄 Print / Export Question Bank with Notes
      </button>
    </motion.div>
  );
}

// ── EXECUTIVE BI COMMAND CENTER ──
function ExecutiveBI() {
  const [stats] = useState(() => JSON.parse(localStorage.getItem("pulse_stats") || '{"scores":[]}'));
  const [candidates] = useState(() => {
    // Mengambil data detail kandidat dari localStorage jika ada, atau simulasi data
    return JSON.parse(localStorage.getItem("pulse_candidates") || "[]");
  });

  const total = stats.scores.length;
  const avgScore = total > 0 ? (stats.scores.reduce((a, b) => a + b, 0) / total).toFixed(2) : 0;
  
  // Data untuk Pie Chart: Rasio Keputusan
  const pieData = [
    { name: 'Strong Hire', value: stats.scores.filter(s => s >= 4.0).length, color: "#74C476" },
    { name: 'Maybe/Hire', value: stats.scores.filter(s => s >= 3.0 && s < 4.0).length, color: "#C8A97E" },
    { name: 'No Hire', value: stats.scores.filter(s => s < 3.0).length, color: "#E8835A" },
  ].filter(d => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Module 08 — Business Intelligence</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#F0EAE0", margin: "0.5rem 0" }}>Executive Command Center</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* KPI Cards */}
        <div style={{ background: "#111", padding: "1.5rem", borderRadius: 8, border: "1px solid #1E1E1E", textAlign: "center" }}>
          <div style={{ color: "#666", fontSize: "0.7rem", textTransform: "uppercase" }}>Avg. Technical Merit</div>
          <div style={{ color: "#C8A97E", fontSize: "3rem", fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>{avgScore}</div>
        </div>
        <div style={{ background: "#111", padding: "1.5rem", borderRadius: 8, border: "1px solid #1E1E1E", textAlign: "center" }}>
          <div style={{ color: "#666", fontSize: "0.7rem", textTransform: "uppercase" }}>Total Candidates Processed</div>
          <div style={{ color: "#F0EAE0", fontSize: "3rem", fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>{total}</div>
        </div>
      </div>

      <div style={{ background: "#0A0A0A", padding: "2rem", borderRadius: 8, border: "1px solid #1E1E1E" }}>
        <h3 style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", marginBottom: "2rem", textTransform: "uppercase" }}>[ Hiring Quality Distribution ]</h3>
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis tick={{ fill: '#888' }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: "#444", textAlign: "center", padding: "3rem" }}>Awaiting data for intelligence mapping...</div>
        )}
      </div>
    </motion.div>
  );
}


// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onStart, stats, onReset }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "center", textAlign: "center", padding: "2rem",
      background: "radial-gradient(ellipse at 50% 0%, #1A1208 0%, #0D0D0D 60%)"
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          ✦ Pulse Digital · HR Technical Analysis ✦
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
          color: "#F0EAE0", fontWeight: 700, lineHeight: 1.1,
          margin: "0 0 1.5rem"
        }}>
          Hiring Intelligence<br /><span style={{ color: "#C8A97E" }}>Platform</span>
        </h1>
        <p style={{ color: "#666", fontSize: "1rem", maxWidth: 540, lineHeight: 1.7, margin: "0 auto 2.5rem" }}>
          A living, interactive system built on the Pulse Digital HR Technical Analysis.
          Science-backed · Data-driven · Non-compensatory scoring logic.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
          {["8 Competencies", "T-Shaped Scoring", "D&I Dashboard", "90-Day Blueprint"].map(tag => (
            <motion.span whileHover={{ scale: 1.1, backgroundColor: "#C8A97E", color: "#000" }} key={tag} style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 20, padding: "0.4rem 0.9rem", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.06em", cursor: "default", transition: "all 0.2s" }}>{tag}</motion.span>
          ))}
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 50px #C8A97E66" }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart} style={{
          background: "#C8A97E", border: "none", borderRadius: 4,
          color: "#0D0D0D", padding: "1rem 2.5rem",
          fontFamily: "'DM Mono', monospace", fontSize: "0.85rem",
          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          cursor: "pointer", boxShadow: "0 0 30px #C8A97E33"
        }}>Enter Platform →</motion.button>
        {stats.total > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Total Evaluated", val: stats.total },
                { label: "Strong Hires", val: stats.strongHires },
                { label: "Avg Score", val: stats.avgScore.toFixed(2) },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ color: "#C8A97E", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700 }}>{s.val}</div>
                  <div style={{ color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
            
            {/* Tombol Reset Data */}
            <button 
              onClick={onReset}
              style={{
                background: "transparent", border: "1px solid #E8835A", color: "#E8835A", padding: "0.4rem 0.8rem", borderRadius: 4, fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", cursor: "pointer", textTransform: "uppercase", marginTop: "0.5rem", transition: "all 0.3s"
              }}
              onMouseOver={(e) => { e.target.style.background = "#E8835A"; e.target.style.color = "#000"; }}
              onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#E8835A"; }}
            >
              ↺ Reset Data
            </button>
          </div>
        )}
)}
        <div style={{ marginTop: "1rem", color: "#333", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>
          by Alfin Yudistira · Pulse Digital · 2025
        </div>
      </motion.div>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("pulse_tab") || "calculator");
  const [toast, setToast] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem("pulse_stats") || '{"total":0,"strongHires":0,"avgScore":0,"scores":[]}'));

  const showToast = (message, color = "#C8A97E") => setToast({ message, color });
  const fireConfetti = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); };

  const recordEval = (score, label) => {
    setStats(prev => {
      const newScores = [...prev.scores, score];
      const updated = { total: prev.total + 1, strongHires: prev.strongHires + (score >= 4 ? 1 : 0), avgScore: (newScores.reduce((a,b) => a+b, 0) / newScores.length), scores: newScores };
      localStorage.setItem("pulse_stats", JSON.stringify(updated));
      return updated;
    });
  };

  const resetStats = () => {
    if (window.confirm("Are you sure you want to reset all evaluation data history?")) {
      const initialStats = {total:0, strongHires:0, avgScore:0, scores:[]};
      localStorage.setItem("pulse_stats", JSON.stringify(initialStats));
      setStats(initialStats);
      showToast?.("Data history successfully reset!", "#74C476");
    }
  };

  
  useEffect(() => { localStorage.setItem("pulse_tab", activeTab); }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const tabIds = ["calculator","funnel","salary","scorecard","di","onboarding","questions"];
      if (e.key >= "1" && e.key <= "7") setActiveTab(tabIds[parseInt(e.key) - 1]);
      if (e.key === "Escape") setShowApp(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const views = { calculator: Calculator, funnel: FunnelChart, salary: SalaryBench, scorecard: Scorecard, di: DIMetrics, onboarding: Onboarding, questions: QuestionBank, bi: ExecutiveBI };
const ActiveView = views[activeTab];
const viewProps = { showToast, fireConfetti, recordEval };

    if (!showApp) return <Hero onStart={() => setShowApp(true)} stats={stats} onReset={resetStats} />;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#0D0D0D", borderBottom: "1px solid #1A1A1A", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ color: "#C8A97E", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Pulse Digital</div>
          <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, marginTop: "0.1rem" }}>Hiring Intelligence Platform</div>
        </div>
        <button onClick={() => setShowApp(false)} style={{ background: "transparent", border: "1px solid #2A2A2A", borderRadius: 4, color: "#555", padding: "0.4rem 0.8rem", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", cursor: "pointer" }}>← Home</button>
      </div>

      <NavBar active={activeTab} setActive={setActiveTab} />

      <main style={{ flex: 1, padding: "2.5rem 2rem", overflowY: "auto" }}>
  <ActiveView {...viewProps} />
</main>

      <footer style={{ borderTop: "1px solid #1A1A1A", padding: "0.75rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>© 2025 Alfin Yudistira · Pulse Digital HR Technical Analysis</span>
        <span style={{ color: "#252525", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>Schmidt & Hunter (2016) · Bertrand & Mullainathan (2004) · McKinsey (2023)</span>
      </footer>

      <div style={{ background: "#080808", borderTop: "1px solid #141414", padding: "0.4rem 2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {[
          { key: "1-7", desc: "Switch tabs" },
          { key: "P", desc: "Print/Export" },
          { key: "R", desc: "Reset form" },
          { key: "ESC", desc: "Go home" },
        ].map(s => (
          <span key={s.key} style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem" }}>
            <span style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 3, padding: "0.1rem 0.4rem", color: "#555", marginRight: "0.4rem" }}>{s.key}</span>
            {s.desc}
          </span>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0D0D0D; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        button:hover { opacity: 0.85; }
        input:focus, textarea:focus, select:focus { outline: 1px solid #C8A97E44; }
@media print {
  nav, footer, button, input[type="range"] { display: none !important; }
  body, #root { background: #fff !important; color: #000 !important; }
  * { font-family: Georgia, serif !important; }
  main::before { content: "PULSE DIGITAL — HIRING INTELLIGENCE REPORT"; display: block; font-size: 0.7rem; letter-spacing: 0.2em; color: #888 !important; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
  main { padding: 0 !important; }
}
      `}</style>
      <AnimatePresence>
  {toast && <Toast message={toast.message} color={toast.color} onDone={() => setToast(null)} />}
</AnimatePresence>
{showConfetti && <Confetti />}
            <Analytics />
      <SpeedInsights />
    </div>
  );
}
