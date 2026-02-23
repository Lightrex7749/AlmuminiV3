/**
 * BurnoutDashboard.jsx
 * Place in: frontend/src/page/BurnoutDashboard.jsx
 *
 * Uses burnoutService.js which maps to:
 *   - burnout_analysis   (risk scores, contributing_factors, recommendations)
 *   - burnout_alerts     (counselor alerts, status tracking)
 *   - student_burnout_data (attendance, grades, submissions JSON columns)
 */

import { useState, useEffect } from "react";
import {
    LineChart, Line, AreaChart, Area, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
    getAllStudentsRisk,
    getStudentDetail,
    sendCounselorAlert,
    getBurnoutOverview,
    RISK_DISPLAY,
} from "../services/burnoutService";

// ─── Small reusable components ────────────────────────────────────────────────

const RiskBadge = ({ level }) => {
    const r = RISK_DISPLAY[level] || RISK_DISPLAY.low;
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${r.badge}`}>
            {r.label}
        </span>
    );
};

const ScoreGauge = ({ score, level }) => {
    const color = (RISK_DISPLAY[level] || RISK_DISPLAY.low).color;
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;
    return (
        <div className="relative flex items-center justify-center w-28 h-28">
            <svg width="112" height="112" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                    cx="56" cy="56" r="40" fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 56 56)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
            </svg>
            <div className="absolute text-center">
                <div className="text-2xl font-black" style={{ color }}>{score}</div>
                <div className="text-xs text-gray-400 font-medium">/ 100</div>
            </div>
        </div>
    );
};

const SignalRow = ({ severity, label }) => {
    const styles = {
        critical: "bg-red-50 border-l-4 border-red-500 text-red-800",
        high: "bg-orange-50 border-l-4 border-orange-400 text-orange-800",
        medium: "bg-amber-50 border-l-4 border-amber-400 text-amber-800",
    };
    const icons = { critical: "🚨", high: "⚠️", medium: "📌" };
    return (
        <div className={`px-3 py-2 rounded-r text-sm font-medium ${styles[severity] || styles.medium}`}>
            {icons[severity] || "📌"} {label}
        </div>
    );
};

const StatCard = ({ icon, value, label, colorClass, bgClass }) => (
    <div className={`rounded-xl p-4 border ${bgClass}`}>
        <div className="text-2xl mb-1">{icon}</div>
        <div className={`text-3xl font-black ${colorClass}`}>{value}</div>
        <div className="text-sm text-gray-500 font-medium mt-1">{label}</div>
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function BurnoutDashboard() {
    const [students, setStudents] = useState([]);
    const [overview, setOverview] = useState(null);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("attendance");
    const [alertSent, setAlertSent] = useState({});
    const [alertLoading, setAlertLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load student list + overview on mount
    useEffect(() => {
        async function load() {
            setLoading(true);
            const [studRes, ovRes] = await Promise.all([
                getAllStudentsRisk(),
                getBurnoutOverview(),
            ]);
            if (studRes.data) setStudents(studRes.data);
            if (ovRes.data) setOverview(ovRes.data);
            setLoading(false);
        }
        load();
    }, []);

    // Load detail when student selected
    useEffect(() => {
        if (!selected) return;
        setDetail(null);
        setActiveTab("attendance");
        getStudentDetail(selected.studentId).then((res) => {
            if (res.data) setDetail(res.data);
        });
    }, [selected]);

    const filtered = students.filter((s) => {
        const matchRisk = filter === "all" || s.riskLevel === filter;
        const matchSearch = !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNo.toLowerCase().includes(search.toLowerCase());
        return matchRisk && matchSearch;
    });

    const handleAlert = async () => {
        if (!selected || alertSent[selected.studentId]) return;
        setAlertLoading(true);
        const res = await sendCounselorAlert({
            studentId: selected.studentId,
            analysisId: null,
            riskLevel: selected.riskLevel,
        });
        if (res.success) {
            setAlertSent((prev) => ({ ...prev, [selected.studentId]: true }));
        }
        setAlertLoading(false);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">
                            🧠 Burnout Detection System
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            AI-powered early warning for hidden academic burnout
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">
                            Live · Admin View
                        </span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Stats Row — from burnout_analysis aggregates */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <StatCard icon="🔴" value={overview?.criticalCount ?? "—"} label="Critical Risk"
                        colorClass="text-red-600" bgClass="bg-red-50 border-red-100" />
                    <StatCard icon="🟠" value={overview?.highCount ?? "—"} label="High Risk"
                        colorClass="text-orange-600" bgClass="bg-orange-50 border-orange-100" />
                    <StatCard icon="🟡" value={overview?.mediumCount ?? "—"} label="Medium Risk"
                        colorClass="text-amber-600" bgClass="bg-amber-50 border-amber-100" />
                    <StatCard icon="🔔" value={overview?.alertsPending ?? "—"} label="Alerts Pending"
                        colorClass="text-blue-600" bgClass="bg-blue-50 border-blue-100" />
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* ── Left: Student List ── */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

                            {/* Search + Filter */}
                            <div className="p-4 border-b border-gray-100">
                                <input
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Search name or roll no..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className="flex gap-1.5 mt-3 flex-wrap">
                                    {["all", "critical", "high", "medium", "low"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`text-xs px-3 py-1 rounded-full font-semibold capitalize transition-all ${filter === f
                                                    ? "bg-gray-900 text-white"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Student rows */}
                            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
                                ) : filtered.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-400">No students found</div>
                                ) : filtered.map((s) => {
                                    const color = (RISK_DISPLAY[s.riskLevel] || RISK_DISPLAY.low).color;
                                    const isSelected = selected?.studentId === s.studentId;
                                    return (
                                        <div
                                            key={s.studentId}
                                            onClick={() => setSelected(s)}
                                            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-gray-800 text-sm">{s.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {s.rollNo} · {s.branch} Yr {s.year}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black" style={{ color }}>{s.riskScore}</div>
                                                    <RiskBadge level={s.riskLevel} />
                                                </div>
                                            </div>
                                            {/* Risk bar */}
                                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${s.riskScore}%`, backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Detail Panel ── */}
                    <div className="col-span-8">
                        {!selected ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full
                              flex items-center justify-center text-center p-12">
                                <div>
                                    <div className="text-6xl mb-4">🧠</div>
                                    <h3 className="text-lg font-bold text-gray-700">Select a student</h3>
                                    <p className="text-sm text-gray-400 mt-2 max-w-xs">
                                        Click any student on the left to view their burnout analysis, signals, and alerts.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {/* Student header card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white"
                                                style={{ backgroundColor: (RISK_DISPLAY[selected.riskLevel] || RISK_DISPLAY.low).color }}
                                            >
                                                {selected.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-gray-900">{selected.name}</h2>
                                                <p className="text-sm text-gray-500">
                                                    {selected.rollNo} · {selected.branch} · Year {selected.year}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <RiskBadge level={selected.riskLevel} />
                                                    <span className="text-xs text-gray-400 capitalize">
                                                        Trend: {selected.trend}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <ScoreGauge score={selected.riskScore} level={selected.riskLevel} />
                                            <div className="text-right space-y-2">
                                                {alertSent[selected.studentId] || selected.alertSent ? (
                                                    <span className="text-xs text-green-600 font-semibold block">
                                                        ✅ Counselor Alerted
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={handleAlert}
                                                        disabled={alertLoading}
                                                        className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-60
                                       text-white px-4 py-2 rounded-lg font-semibold transition-all"
                                                    >
                                                        {alertLoading ? "Sending..." : "🔔 Alert Counselor"}
                                                    </button>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    {selected.analysisSummary?.slice(0, 60)}...
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations from burnout_analysis.recommendations JSON */}
                                    {selected.recommendations?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                AI Recommendations
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {selected.recommendations.map((rec, i) => (
                                                    <span key={i}
                                                        className="text-xs bg-blue-50 text-blue-700 border border-blue-100
                                       px-2 py-1 rounded-lg">
                                                        💡 {rec}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Signals — from burnout_analysis.contributing_factors */}
                                {detail?.signals?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                                            🚨 Detected Signals
                                        </h3>
                                        <div className="space-y-2">
                                            {detail.signals.map((sig, i) => (
                                                <SignalRow key={i} {...sig} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Charts — from student_burnout_data JSON columns */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    {/* Tab bar */}
                                    <div className="flex gap-2 mb-5 flex-wrap">
                                        {[
                                            { key: "attendance", label: "📅 Attendance" },
                                            { key: "grades", label: "📈 Grades" },
                                            { key: "submissions", label: "📝 Submissions" },
                                            { key: "radar", label: "🕸️ Overview" },
                                        ].map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === tab.key
                                                        ? "bg-gray-900 text-white"
                                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {!detail ? (
                                        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                                            Loading chart data...
                                        </div>
                                    ) : (
                                        <>
                                            {/* Attendance — student_burnout_data.attendance_records */}
                                            {activeTab === "attendance" && (
                                                <>
                                                    <p className="text-xs text-gray-400 mb-3">
                                                        Weekly attendance % — from <code>student_burnout_data.attendance_records</code>
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={220}>
                                                        <AreaChart data={detail.attendanceRecords}>
                                                            <defs>
                                                                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                                            <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "Attendance"]} />
                                                            <Area type="monotone" dataKey="pct" stroke="#ef4444"
                                                                strokeWidth={2} fill="url(#attGrad)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </>
                                            )}

                                            {/* Grades — student_burnout_data.grade_records */}
                                            {activeTab === "grades" && (
                                                <>
                                                    <p className="text-xs text-gray-400 mb-3">
                                                        Previous vs current semester — from <code>student_burnout_data.grade_records</code>
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={220}>
                                                        <BarChart data={detail.gradeRecords} barCategoryGap="30%">
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                            <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="prev" name="Prev Sem" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                                                            <Bar dataKey="curr" name="Curr Sem" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </>
                                            )}

                                            {/* Submissions — student_burnout_data.assignment_submissions */}
                                            {activeTab === "submissions" && (
                                                <>
                                                    <p className="text-xs text-gray-400 mb-3">
                                                        Submission pattern — from <code>student_burnout_data.assignment_submissions</code>
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={220}>
                                                        <BarChart data={detail.assignmentSubmissions} barCategoryGap="20%">
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                                            <YAxis tick={{ fontSize: 11 }} />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="onTime" name="On Time" stackId="a" fill="#22c55e" />
                                                            <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
                                                            <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </>
                                            )}

                                            {/* Radar — burnout_analysis.contributing_factors */}
                                            {activeTab === "radar" && (
                                                <>
                                                    <p className="text-xs text-gray-400 mb-3">
                                                        Wellbeing overview — from <code>burnout_analysis.contributing_factors</code>
                                                        &nbsp;(higher = healthier)
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={220}>
                                                        <RadarChart data={detail.radarData}>
                                                            <PolarGrid stroke="#e5e7eb" />
                                                            <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                                                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                                            <Radar name="Student" dataKey="score"
                                                                stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                                            <Tooltip />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Contributing factors breakdown — burnout_analysis.contributing_factors */}
                                {detail?.stressLevel !== undefined && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                                            📊 Contributing Factors
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                {
                                                    label: "Attendance Concern", value: selected.contributingFactors?.attendance_concern ? "Yes" : "No",
                                                    bad: selected.contributingFactors?.attendance_concern
                                                },
                                                {
                                                    label: "Grade Drop", value: selected.contributingFactors?.grade_drop ? "Yes" : "No",
                                                    bad: selected.contributingFactors?.grade_drop
                                                },
                                                {
                                                    label: "Submission Issues", value: selected.contributingFactors?.submission_issues ? "Yes" : "No",
                                                    bad: selected.contributingFactors?.submission_issues
                                                },
                                                {
                                                    label: "Stress Level", value: `${detail.stressLevel} / 10`,
                                                    bad: detail.stressLevel >= 7
                                                },
                                            ].map((f) => (
                                                <div key={f.label}
                                                    className={`p-3 rounded-xl border text-sm ${f.bad
                                                            ? "bg-red-50 border-red-100 text-red-700"
                                                            : "bg-green-50 border-green-100 text-green-700"
                                                        }`}
                                                >
                                                    <div className="font-semibold">{f.label}</div>
                                                    <div className="mt-0.5 font-black text-base">{f.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}