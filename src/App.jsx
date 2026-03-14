import { useState, useEffect, useRef } from "react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


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
function Calculator() {
  const [scores, setScores] = useState({});
  const [candidateName, setCandidateName] = useState("");
  const [animated, setAnimated] = useState(false);

  useEffect(() => { setAnimated(true); }, []);

  const decision = getDecision(scores);
  const allFilled = COMPETENCIES.every(c => scores[c.id] !== undefined);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 01 — Competency Scoring</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: 0 }}>Candidate Fit Calculator</h2>
        <p style={{ color: "#666", marginTop: "0.75rem", fontSize: "0.85rem" }}>Non-compensatory scoring model · Data Analytics & Paid Ads are critical hurdles</p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Candidate Name</label>
        <input value={candidateName} onChange={e => setCandidateName(e.target.value)}
          placeholder="e.g. Alfin Yudistira"
          style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", padding: "0.75rem 1rem", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", width: "100%", maxWidth: 360, boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {COMPETENCIES.map((c, i) => (
          <div key={c.id} style={{
            background: "#111", border: `1px solid ${scores[c.id] >= 3 ? "#1E1E1E" : c.critical && scores[c.id] < 3 && scores[c.id] !== undefined ? "#4A1A0A" : "#1E1E1E"}`,
            borderLeft: `3px solid ${c.critical ? c.color : "#2A2A2A"}`,
            borderRadius: 6, padding: "1.25rem 1.5rem",
            transform: animated ? "translateX(0)" : "translateX(-20px)",
            opacity: animated ? 1 : 0,
            transition: `all 0.4s ease ${i * 0.05}s`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{c.icon}</span>
                  <span style={{ color: "#F0EAE0", fontWeight: 600, fontSize: "0.9rem" }}>{c.label}</span>
                  {c.critical && <span style={{ background: "#2A1A0A", color: c.color, fontSize: "0.6rem", fontFamily: "'DM Mono', monospace", padding: "0.15rem 0.4rem", borderRadius: 2, letterSpacing: "0.08em" }}>CRITICAL HURDLE</span>}
                </div>
                <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", marginTop: "0.25rem", letterSpacing: "0.06em" }}>
                  Weight: {(c.weight * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setScores(s => ({ ...s, [c.id]: n }))}
                    style={{
                      width: 38, height: 38, borderRadius: 4,
                      background: scores[c.id] >= n ? c.color : "#1A1A1A",
                      border: `1px solid ${scores[c.id] >= n ? c.color : "#333"}`,
                      color: scores[c.id] >= n ? "#0D0D0D" : "#555",
                      fontFamily: "'DM Mono', monospace", fontWeight: 700,
                      fontSize: "0.85rem", cursor: "pointer",
                      transition: "all 0.15s"
                    }}>{n}</button>
                ))}
                {scores[c.id] && (
                  <span style={{ color: c.color, fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 700, minWidth: 32, textAlign: "center" }}>
                    {(scores[c.id] * c.weight).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {c.critical && scores[c.id] < 3 && scores[c.id] !== undefined && (
              <div style={{ marginTop: "0.75rem", background: "#2A0D00", border: "1px solid #4A1A0A", borderRadius: 4, padding: "0.5rem 0.75rem", color: "#E8835A", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace" }}>
                ⚠ Critical hurdle not met — candidate disqualified regardless of other scores
              </div>
            )}
          </div>
        ))}
      </div>

      {allFilled && (
        <div style={{
          marginTop: "2rem", background: "#111", border: `2px solid ${decision.color}`,
          borderRadius: 8, padding: "2rem", textAlign: "center",
          animation: "fadeIn 0.5s ease"
        }}>
          <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Final Decision</div>
          {candidateName && <div style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{candidateName}</div>}
          <div style={{ fontSize: "clamp(2rem, 8vw, 4rem)", fontFamily: "'Playfair Display', serif", color: decision.color, fontWeight: 700, lineHeight: 1 }}>
            {decision.score.toFixed(2)}
          </div>
          <div style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", marginTop: "0.25rem" }}>/ 5.00 weighted score</div>
          <div style={{ marginTop: "1.25rem", display: "inline-block", background: `${decision.color}22`, border: `1px solid ${decision.color}`, borderRadius: 4, padding: "0.6rem 1.5rem", color: decision.color, fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            {decision.label}
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {COMPETENCIES.map(c => (
              <div key={c.id} style={{ textAlign: "center" }}>
                <div style={{ color: c.color, fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700 }}>{scores[c.id]}/5</div>
                <div style={{ color: "#444", fontSize: "0.6rem", fontFamily: "'DM Mono', monospace" }}>{c.short}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── FUNNEL ──
function FunnelChart() {
  const max = 150;
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 02 — Funnel Analysis</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 2rem" }}>Hiring Funnel Optimizer</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Time-to-Hire", old: "45 days", new: "30 days", delta: "-33%", color: "#C8A97E" },
          { label: "Cost-per-Hire", old: "$3,200", new: "$2,400", delta: "-25%", color: "#74C476" },
          { label: "Offer Accept Rate", old: "50–60%", new: "75–85%", delta: "+25%", color: "#7EB5A6" },
          { label: "Quality of Hire", old: "7.2 / 10", new: "9.0 / 10", delta: "+25%", color: "#9B8EC4" },
        ].map(m => (
          <div key={m.label} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.25rem" }}>
            <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "0.75rem" }}>
              <div>
                <div style={{ color: "#444", fontSize: "0.85rem", textDecoration: "line-through" }}>{m.old}</div>
                <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700 }}>{m.new}</div>
              </div>
              <div style={{ color: m.color, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.1rem" }}>{m.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "1.5rem", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: 12, height: 12, background: "#333", borderRadius: 2 }} /><span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>Traditional</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: 12, height: 12, background: "#C8A97E", borderRadius: 2 }} /><span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>Pulse Optimized</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 500 }}>
          {FUNNEL_DATA.map((row, i) => (
            <div key={row.stage}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>{row.stage}</span>
                <span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>Day {row.day_trad} → Day {row.day_opt}</span>
              </div>
              <div style={{ position: "relative", height: 20 }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: `${(row.traditional / max) * 100}%`, height: "100%", background: "#252525", borderRadius: 2, transition: "width 1s ease" }} />
                <div style={{ position: "absolute", top: 4, left: 0, width: `${(row.optimized / max) * 100}%`, height: 12, background: "#C8A97E", borderRadius: 2, opacity: 0.9, transition: "width 1s ease" }} />
                <span style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>{row.traditional} vs {row.optimized}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 03 — Compensation Intelligence</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 2rem" }}>Salary Benchmarking</h2>

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

      <div style={{ background: "#111", border: "2px solid #C8A97E", borderRadius: 8, padding: "1.5rem" }}>
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
        <div style={{ marginTop: "1rem", color: "#555", fontSize: "0.8rem", lineHeight: 1.6 }}>
          Strategy: Index against developed APAC hubs (Singapore, Sydney) to neutralize local agency competition.
          Projected to reduce voluntary turnover by <span style={{ color: "#C8A97E", fontWeight: 600 }}>~40%</span> in first 24 months.
        </div>

        {/* Visual bar */}
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ position: "relative", height: 24, background: "#1A1A1A", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: `${(data[0] / data[2]) * 100}%`, height: "100%", background: "#2A2A2A" }} />
            <div style={{ position: "absolute", left: `${(data[0] / data[2]) * 100}%`, top: 0, width: `${((data[2] - data[0]) / data[2]) * 100}%`, height: "100%", background: "#333" }} />
            <div style={{ position: "absolute", left: `${(pulse[0] / data[2]) * 120}%`, top: 0, width: 3, height: "100%", background: "#C8A97E" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", marginTop: "0.25rem" }}>
            <span>Market 25th</span><span style={{ color: "#C8A97E" }}>↑ Pulse Floor</span><span>Market 75th</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCORECARD ──
function Scorecard() {
  const [candidate, setCandidate] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [round, setRound] = useState("Round 1");
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [isBlindMode, setIsBlindMode] = useState(false); 
  
  const decision = getDecision(scores);
  const allFilled = COMPETENCIES.every(c => scores[c.id] !== undefined);

  const handlePrint = () => window.print();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 04 — Interview Evaluation</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 1rem" }}>Interview Scorecard</h2>
        </div>
        
        {/* Tombol Blind Mode */}
        <button onClick={() => setIsBlindMode(!isBlindMode)} style={{
          background: isBlindMode ? "#C8A97E" : "#111", border: `1px solid ${isBlindMode ? "#C8A97E" : "#2A2A2A"}`,
          color: isBlindMode ? "#0D0D0D" : "#888", padding: "0.6rem 1rem", borderRadius: 6,
          fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
          marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.3s"
        }}>
          {isBlindMode ? "👁️‍🗨️ BLIND MODE: ON" : "👁️ BLIND MODE: OFF"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Candidate Name</label>
          <input value={candidate} onChange={e => setCandidate(e.target.value)} placeholder="Full Name"
            style={{ 
              background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", 
              padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", 
              width: "100%", boxSizing: "border-box",
              filter: isBlindMode && candidate ? "blur(5px)" : "none",
              transition: "filter 0.3s ease"
            }} 
            disabled={isBlindMode}
          />
        </div>
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Interviewer</label>
          <input value={interviewer} onChange={e => setInterviewer(e.target.value)} placeholder="Your Name"
            style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Interview Round</label>
          <select value={round} onChange={e => setRound(e.target.value)}
            style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, color: "#F0EAE0", padding: "0.65rem 0.9rem", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", width: "100%", boxSizing: "border-box" }}>
            <option>Round 1 — Phone Screen</option>
            <option>Round 2 — Assessment</option>
            <option>Round 3 — Leadership</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
        {COMPETENCIES.map(c => (
          <motion.div whileHover={{ scale: 1.01 }} key={c.id} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: notes[c.id] !== undefined ? "0.75rem" : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{c.icon}</span>
                <div>
                  <div style={{ color: "#DDD", fontSize: "0.85rem", fontWeight: 500 }}>{c.short}</div>
                  {c.critical && <span style={{ color: "#E8835A", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem" }}>● CRITICAL</span>}
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
                  style={{ background: "transparent", border: "1px solid #2E2E2E", borderRadius: 4, color: "#555", width: 34, height: 34, cursor: "pointer", fontSize: "0.85rem" }}>
                  📝
                </button>
              </div>
            </div>
            {notes[c.id] !== undefined && (
              <textarea value={notes[c.id]} onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))}
                placeholder="Observed behaviors / evidence..."
                style={{ background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 4, color: "#AAA", padding: "0.5rem 0.75rem", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 60 }} />
            )}
          </motion.div>
        ))}
      </div>

      {allFilled && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#111", border: `2px solid ${decision.color}`, borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Scorecard Result</div>
              <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginTop: "0.25rem", filter: isBlindMode && candidate ? "blur(4px)" : "none", transition: "filter 0.3s" }}>
                {candidate || "Candidate"} · {round}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: decision.color, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}>{decision.score.toFixed(2)}</div>
              <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>weighted avg / 5.00</div>
            </div>
            <div style={{ background: `${decision.color}22`, border: `1px solid ${decision.color}`, borderRadius: 4, padding: "0.75rem 1.25rem", color: decision.color, fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 700, textAlign: "center", maxWidth: 200 }}>
              {decision.label}
            </div>
          </div>
          {interviewer && <div style={{ marginTop: "1rem", color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>Evaluated by: {interviewer} · {new Date().toLocaleDateString()}</div>}
        </motion.div>
      )}

      <button onClick={handlePrint} style={{
        background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 4,
        color: "#888", padding: "0.75rem 1.5rem", fontFamily: "'DM Mono', monospace",
        fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer"
      }}>⬡ Print / Export Scorecard</button>
    </motion.div>
  );
}


// ── D&I ──
function DIMetrics() {
  const statusColor = { exceeded: "#74C476", met: "#C8A97E", progress: "#6BAED6", "needs-work": "#E8835A" };
  const statusLabel = { exceeded: "✦ EXCEEDED", met: "✓ MET", progress: "↗ IN PROGRESS", "needs-work": "⚠ NEEDS WORK" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 05 — Diversity & Inclusion</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 0.5rem" }}>D&I Metrics Dashboard</h2>
      <p style={{ color: "#555", fontSize: "0.82rem", marginBottom: "2rem" }}>Q1 2025 Implementation · Blind Screening Pipeline Active</p>

      <div style={{ display: "grid", gap: "1rem" }}>
        {DI_METRICS.map((m, i) => {
          const pct = Math.min((m.current / m.target) * 100, 100);
          const color = statusColor[m.status];
          return (
            <div key={m.label} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ color: "#CCC", fontSize: "0.87rem" }}>{m.label}</span>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>Target: {m.target}%</span>
                  <span style={{ color: "#F0EAE0", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>{m.current}%</span>
                  <span style={{ color, fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em" }}>{statusLabel[m.status]}</span>
                </div>
              </div>
              <div style={{ position: "relative", height: 8, background: "#1A1A1A", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${pct}%`, background: color, borderRadius: 4,
                  transition: "width 1.2s ease",
                  boxShadow: `0 0 8px ${color}66`
                }} />
                {m.target > 0 && (
                  <div style={{ position: "absolute", left: `${Math.min(m.target, 100)}%`, top: -2, width: 2, height: 12, background: "#555" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginTop: "2rem" }}>
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
    </div>
  );
}

// ── ONBOARDING ──
function Onboarding() {
  const [activeWeek, setActiveWeek] = useState(0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Module 06 — People Operations</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", color: "#F0EAE0", fontWeight: 700, margin: "0 0 0.5rem" }}>90-Day Onboarding Blueprint</h2>
      <p style={{ color: "#555", fontSize: "0.82rem", marginBottom: "2rem" }}>Target: 4.0+/5.0 performance at 90-day review · Week-by-week milestone tracking</p>

      {/* Timeline */}
      <div style={{ position: "relative", marginBottom: "2rem", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 0, minWidth: 500 }}>
          {ONBOARDING_WEEKS.map((w, i) => (
            <button key={w.week} onClick={() => setActiveWeek(i)} style={{
              flex: i === 4 ? 2 : 1, background: activeWeek === i ? w.color : "#111",
              border: `1px solid ${activeWeek === i ? w.color : "#2A2A2A"}`,
              color: activeWeek === i ? "#0D0D0D" : "#555",
              padding: "0.75rem 0.5rem", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: "0.65rem",
              fontWeight: activeWeek === i ? 700 : 400,
              letterSpacing: "0.05em", transition: "all 0.2s",
              borderRight: i < 4 ? "none" : "1px solid #2A2A2A"
            }}>{w.week}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "#111", border: `2px solid ${ONBOARDING_WEEKS[activeWeek].color}`, borderRadius: 8, padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ color: ONBOARDING_WEEKS[activeWeek].color, fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{ONBOARDING_WEEKS[activeWeek].week}</div>
            <div style={{ color: "#F0EAE0", fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, marginTop: "0.25rem" }}>{ONBOARDING_WEEKS[activeWeek].theme}</div>
          </div>
          <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
            {ONBOARDING_WEEKS[activeWeek].items.length} milestones
          </div>
        </div>
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {ONBOARDING_WEEKS[activeWeek].items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ONBOARDING_WEEKS[activeWeek].color, marginTop: "0.45rem", flexShrink: 0 }} />
              <span style={{ color: "#CCC", fontSize: "0.87rem", lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { day: "30-Day", goal: "Baseline competency assessment", metric: "Team integration complete", color: "#C8A97E" },
          { day: "60-Day", goal: "Priority development check", metric: "Own one major campaign", color: "#7EB5A6" },
          { day: "90-Day", goal: "Comprehensive performance review", metric: "Target: 4.0+ / 5.0", color: "#74C476" },
        ].map(g => (
          <div key={g.day} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "1.25rem", borderTop: `2px solid ${g.color}` }}>
            <div style={{ color: g.color, fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.5rem" }}>{g.day} Gate</div>
            <div style={{ color: "#DDD", fontSize: "0.83rem", marginBottom: "0.5rem" }}>{g.goal}</div>
            <div style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>{g.metric}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "center", textAlign: "center", padding: "2rem",
      background: "radial-gradient(ellipse at 50% 0%, #1A1208 0%, #0D0D0D 60%)"
    }}>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 1s ease" }}>
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
            <span key={tag} style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 20, padding: "0.4rem 0.9rem", color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.06em" }}>{tag}</span>
          ))}
        </div>
        <button onClick={onStart} style={{
          background: "#C8A97E", border: "none", borderRadius: 4,
          color: "#0D0D0D", padding: "1rem 2.5rem",
          fontFamily: "'DM Mono', monospace", fontSize: "0.85rem",
          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          cursor: "pointer", transition: "all 0.2s",
          boxShadow: "0 0 40px #C8A97E33"
        }}>Enter Platform →</button>
        <div style={{ marginTop: "1rem", color: "#333", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>
          by Alfin Yudistira · Pulse Digital · 2025
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");

  const views = { calculator: Calculator, funnel: FunnelChart, salary: SalaryBench, scorecard: Scorecard, di: DIMetrics, onboarding: Onboarding };
  const ActiveView = views[activeTab];

  if (!showApp) return <Hero onStart={() => setShowApp(true)} />;

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
        <ActiveView />
      </main>

      <footer style={{ borderTop: "1px solid #1A1A1A", padding: "0.75rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>© 2025 Alfin Yudistira · Pulse Digital HR Technical Analysis</span>
        <span style={{ color: "#252525", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>Schmidt & Hunter (2016) · Bertrand & Mullainathan (2004) · McKinsey (2023)</span>
      </footer>

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
      `}</style>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
