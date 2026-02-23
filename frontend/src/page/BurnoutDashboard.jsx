import React, { useState, useEffect } from "react";
import {
    LineChart, Line, AreaChart, Area, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
    { id: 1, name: "Ananya Sharma", roll: "CS21001", branch: "CSE", year: 3, riskScore: 82, riskLevel: "High" },
    { id: 2, name: "Rohan Mehta", roll: "CS21045", branch: "CSE", year: 3, riskScore: 54, riskLevel: "Medium" },
    { id: 3, name: "Priya Nair", roll: "ME21012", branch: "ME", year: 2, riskScore: 23, riskLevel: "Low" },
    { id: 4, name: "Karan Singh", roll: "EC21089", branch: "ECE", year: 3, riskScore: 71, riskLevel: "High" },
    { id: 5, name: "Sneha Patel", roll: "CS22011", branch: "CSE", year: 2, riskScore: 38, riskLevel: "Low" },
    { id: 6, name: "Arjun Das", roll: "IT21034", branch: "IT", year: 3, riskScore: 67, riskLevel: "Medium" },
];

const MOCK_STUDENT_DETAIL = {
    1: {
        attendance: [
            { week: "Wk 1", pct: 95 }, { week: "Wk 2", pct: 90 }, { week: "Wk 3", pct: 82 },
            { week: "Wk 4", pct: 74 }, { week: "Wk 5", pct: 61 }, { week: "Wk 6", pct: 48 },
            { week: "Wk 7", pct: 44 }, { week: "Wk 8", pct: 38 },
        ],
        grades: [
            { subject: "DSA", prev: 85, curr: 62 }, { subject: "DBMS", prev: 78, curr: 55 },
            { subject: "OS", prev: 80, curr: 71 }, { subject: "CN", prev: 74, curr: 49 },
            { subject: "ML", prev: 88, curr: 60 },
        ],
        submissions: [
            { week: "Wk 1", onTime: 5, late: 0, missed: 0 },
            { week: "Wk 2", onTime: 4, late: 1, missed: 0 },
            { week: "Wk 3", onTime: 3, late: 2, missed: 0 },
            { week: "Wk 4", onTime: 2, late: 2, missed: 1 },
            { week: "Wk 5", onTime: 1, late: 2, missed: 2 },
            { week: "Wk 6", onTime: 1, late: 1, missed: 3 },
            { week: "Wk 7", onTime: 0, late: 2, missed: 3 },
            { week: "Wk 8", onTime: 0, late: 1, missed: 4 },
        ],
        radarData: [
            { factor: "Attendance", score: 38 }, { factor: "Grades", score: 45 },
            { factor: "Submissions", score: 22 }, { factor: "Engagement", score: 30 },
            { factor: "Social", score: 55 },
        ],
        signals: [
            { label: "Attendance dropped 57% in 8 weeks", severity: "critical" },
            { label: "4 missed assignments last week", severity: "critical" },
            { label: "Grade avg down 22 points since mid-sem", severity: "high" },
            { label: "No forum activity in 3 weeks", severity: "medium" },
            { label: "Late submissions increasing every week", severity: "high" },
        ],
        counselorAlerted: false,
    },
};

// Fill missing detail with generic data
[2, 3, 4, 5, 6].forEach((id) => {
    const student = MOCK_STUDENTS.find((s) => s.id === id);
    const base = student.riskScore;
    MOCK_STUDENT_DETAIL[id] = {
        attendance: Array.from({ length: 8 }, (_, i) => ({
            week: `Wk ${i + 1}`,
            pct: Math.max(30, Math.min(100, 95 - i * (base / 30) + Math.random() * 5)),
        })),
        grades: ["DSA", "DBMS", "OS", "CN", "ML"].map((subject) => ({
            subject,
            prev: Math.round(70 + Math.random() * 20),
            curr: Math.round(70 + Math.random() * 20 - base / 5),
        })),
        submissions: Array.from({ length: 8 }, (_, i) => ({
            week: `Wk ${i + 1}`,
            onTime: Math.max(0, 5 - Math.floor(i * base / 80)),
            late: Math.min(5, Math.floor(i * base / 120)),
            missed: Math.min(5, Math.floor(i * base / 100)),
        })),
        radarData: [
            { factor: "Attendance", score: Math.round(100 - base * 0.7) },
            { factor: "Grades", score: Math.round(100 - base * 0.6) },
            { factor: "Submissions", score: Math.round(100 - base * 0.8) },
            { factor: "Engagement", score: Math.round(100 - base * 0.5) },
            { factor: "Social", score: Math.round(100 - base * 0.3) },
        ],
        signals: [],
        counselorAlerted: false,
    };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const riskColor = (level) =>
    ({ High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" }[level] || "#64748b");

const riskBg = (level) =>
    ({ High: "#fef2f2", Medium: "#fffbeb", Low: "#f0fdf4" }[level] || "#f8fafc");

const riskBadge = (level) => {
    const colors = {
        High: "bg-red-100 text-red-700 border border-red-200",
        Medium: "bg-amber-100 text-amber-700 border border-amber-200",
        Low: "bg-green-100 text-green-700 border border-green-200",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
};

const ScoreGauge = ({ score }) => {
    const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
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

const SignalBadge = ({ severity, label }) => {
    const styles = {
        critical: "bg-red-50 border-l-4 border-red-500 text-red-800",
        high: "bg-orange-50 border-l-4 border-orange-400 text-orange-800",
        medium: "bg-amber-50 border-l-4 border-amber-400 text-amber-800",
    };
    const icons = { critical: "🚨", high: "⚠️", medium: "📌" };
    return (
        <div className={`px-3 py-2 rounded-r text-sm font-medium ${styles[severity]}`}>
            {icons[severity]} {label}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BurnoutDashboard() {
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [filter, setFilter] = useState("All");
    const [alertSent, setAlertSent] = useState({});
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("attendance");

    useEffect(() => {
        if (selected) {
            setDetail(MOCK_STUDENT_DETAIL[selected.id]);
            setActiveTab("attendance");
        }
    }, [selected]);

    const filtered = MOCK_STUDENTS.filter((s) => {
        const matchRisk = filter === "All" || s.riskLevel === filter;
        const matchSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.roll.toLowerCase().includes(search.toLowerCase());
        return matchRisk && matchSearch;
    });

    const stats = {
        high: MOCK_STUDENTS.filter((s) => s.riskLevel === "High").length,
        medium: MOCK_STUDENTS.filter((s) => s.riskLevel === "Medium").length,
        low: MOCK_STUDENTS.filter((s) => s.riskLevel === "Low").length,
        avg: Math.round(MOCK_STUDENTS.reduce((a, b) => a + b.riskScore, 0) / MOCK_STUDENTS.length),
    };

    const handleAlert = (studentId) => {
        setAlertSent((prev) => ({ ...prev, [studentId]: true }));
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* ── Header ── */}
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
                            Last synced: 2 min ago
                        </span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* ── Stats Row ── */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "High Risk", value: stats.high, icon: "🔴", color: "text-red-600", bg: "bg-red-50 border-red-100" },
                        { label: "Medium Risk", value: stats.medium, icon: "🟡", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                        { label: "Low Risk", value: stats.low, icon: "🟢", color: "text-green-600", bg: "bg-green-50 border-green-100" },
                        { label: "Avg Risk Score", value: stats.avg, icon: "📊", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                    ].map((stat) => (
                        <div key={stat.label} className={`rounded-xl p-4 border ${stat.bg}`}>
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                            <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* ── Left Panel: Student List ── */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-4 border-b border-gray-100">
                                <input
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Search student / roll no..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className="flex gap-2 mt-3">
                                    {["All", "High", "Medium", "Low"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${filter === f
                                                    ? "bg-gray-900 text-white"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                                {filtered.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => setSelected(student)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selected?.id === student.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-gray-800 text-sm">{student.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {student.roll} · {student.branch} Yr {student.year}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div
                                                    className="text-lg font-black"
                                                    style={{ color: riskColor(student.riskLevel) }}
                                                >
                                                    {student.riskScore}
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${riskBadge(student.riskLevel)}`}>
                                                    {student.riskLevel}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mini progress bar */}
                                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${student.riskScore}%`,
                                                    backgroundColor: riskColor(student.riskLevel),
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Panel: Detail ── */}
                    <div className="col-span-8">
                        {!selected ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex items-center justify-center text-center p-12">
                                <div>
                                    <div className="text-6xl mb-4">🧠</div>
                                    <h3 className="text-lg font-bold text-gray-700">Select a student</h3>
                                    <p className="text-sm text-gray-400 mt-2 max-w-xs">
                                        Click on any student on the left to view their burnout analysis, signals, and alerts.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Student Header */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white"
                                                style={{ backgroundColor: riskColor(selected.riskLevel) }}
                                            >
                                                {selected.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-gray-900">{selected.name}</h2>
                                                <p className="text-sm text-gray-500">
                                                    {selected.roll} · {selected.branch} · Year {selected.year}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <ScoreGauge score={selected.riskScore} />
                                            <div className="text-right">
                                                <span
                                                    className={`inline-block text-sm px-3 py-1 rounded-full font-bold ${riskBadge(selected.riskLevel)}`}
                                                >
                                                    {selected.riskLevel} Risk
                                                </span>
                                                <div className="mt-2">
                                                    {alertSent[selected.id] ? (
                                                        <span className="text-xs text-green-600 font-semibold">✅ Counselor Alerted</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAlert(selected.id)}
                                                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-semibold transition-all"
                                                        >
                                                            🔔 Alert Counselor
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning Signals */}
                                {detail?.signals?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                                            🚨 Detected Signals
                                        </h3>
                                        <div className="space-y-2">
                                            {detail.signals.map((sig, i) => (
                                                <SignalBadge key={i} {...sig} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Charts */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-5">
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

                                    {/* Attendance Chart */}
                                    {activeTab === "attendance" && (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-3">Weekly attendance % over the past 8 weeks</p>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <AreaChart data={detail?.attendance}>
                                                    <defs>
                                                        <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                                    <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, "Attendance"]} />
                                                    <Area
                                                        type="monotone" dataKey="pct" stroke="#ef4444"
                                                        strokeWidth={2} fill="url(#attGrad)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}

                                    {/* Grades Chart */}
                                    {activeTab === "grades" && (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-3">Grade comparison: Previous vs Current semester</p>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={detail?.grades} barCategoryGap="30%">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="prev" name="Prev Sem" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="curr" name="Curr Sem" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}

                                    {/* Submissions Chart */}
                                    {activeTab === "submissions" && (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-3">Assignment submission pattern over 8 weeks</p>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={detail?.submissions} barCategoryGap="20%">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="onTime" name="On Time" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                                                    <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
                                                    <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}

                                    {/* Radar Chart */}
                                    {activeTab === "radar" && (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-3">Overall wellbeing score across all factors (higher = better)</p>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <RadarChart data={detail?.radarData}>
                                                    <PolarGrid stroke="#e5e7eb" />
                                                    <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                                    <Radar
                                                        name="Student" dataKey="score"
                                                        stroke="#6366f1" fill="#6366f1" fillOpacity={0.3}
                                                    />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}