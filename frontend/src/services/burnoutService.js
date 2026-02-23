/**
 * burnoutService.js — Frontend service for Burnout Detection API
 * Updated to match actual AlumUnity schema:
 *   - burnout_analysis.risk_level ENUM: 'low' | 'medium' | 'high' | 'critical'
 *   - burnout_alerts.status ENUM: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'
 *   - burnout_alerts.alert_type ENUM: 'medium_risk' | 'high_risk' | 'critical_risk' | 'sudden_decline'
 *
 * Place in: frontend/src/services/burnoutService.js
 * Toggle mock/real with: REACT_APP_USE_MOCK_DATA=true in .env
 */

import axios from "axios";

const USE_MOCK = process.env.REACT_APP_USE_MOCK_DATA === "true";
const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// ─── Mock Data (matches burnout_analysis schema) ──────────────────────────────
const MOCK_STUDENTS = [
    {
        studentId: "user-001", name: "Ananya Sharma", rollNo: "CS21001",
        branch: "CSE", year: 3,
        riskScore: 82, riskLevel: "critical",   // matches ENUM in burnout_analysis
        trend: "declining",
        alertSent: false,
        contributingFactors: { attendance_concern: true, grade_drop: true, stress_level: 9, submission_issues: true },
        recommendations: ["Speak with counselor", "Track assignments", "Attend all classes"],
        analysisSummary: "Critical burnout risk detected across all indicators.",
        analyzedAt: new Date().toISOString(),
    },
    {
        studentId: "user-002", name: "Rohan Mehta", rollNo: "CS21045",
        branch: "CSE", year: 3,
        riskScore: 54, riskLevel: "medium",
        trend: "stable",
        alertSent: false,
        contributingFactors: { attendance_concern: false, grade_drop: true, stress_level: 6, submission_issues: false },
        recommendations: ["Schedule sessions with academic advisor"],
        analysisSummary: "Medium burnout risk. Grade drop detected.",
        analyzedAt: new Date().toISOString(),
    },
    {
        studentId: "user-003", name: "Priya Nair", rollNo: "ME21012",
        branch: "ME", year: 2,
        riskScore: 20, riskLevel: "low",
        trend: "improving",
        alertSent: false,
        contributingFactors: { attendance_concern: false, grade_drop: false, stress_level: 3, submission_issues: false },
        recommendations: ["Keep up the good work"],
        analysisSummary: "Low risk. Student performing well.",
        analyzedAt: new Date().toISOString(),
    },
    {
        studentId: "user-004", name: "Karan Singh", rollNo: "EC21089",
        branch: "ECE", year: 3,
        riskScore: 71, riskLevel: "high",
        trend: "declining",
        alertSent: true,
        contributingFactors: { attendance_concern: true, grade_drop: true, stress_level: 8, submission_issues: true },
        recommendations: ["Attend classes", "Seek academic support"],
        analysisSummary: "High burnout risk. Multiple signals detected.",
        analyzedAt: new Date().toISOString(),
    },
    {
        studentId: "user-005", name: "Sneha Patel", rollNo: "CS22011",
        branch: "CSE", year: 2,
        riskScore: 35, riskLevel: "medium",
        trend: "stable",
        alertSent: false,
        contributingFactors: { attendance_concern: false, grade_drop: false, stress_level: 5, submission_issues: true },
        recommendations: ["Use a planner to track assignment due dates"],
        analysisSummary: "Medium risk. Submission issues detected.",
        analyzedAt: new Date().toISOString(),
    },
    {
        studentId: "user-006", name: "Arjun Das", rollNo: "IT21034",
        branch: "IT", year: 3,
        riskScore: 65, riskLevel: "high",
        trend: "declining",
        alertSent: false,
        contributingFactors: { attendance_concern: true, grade_drop: false, stress_level: 7, submission_issues: true },
        recommendations: ["Attend all classes", "Manage stress with counselor"],
        analysisSummary: "High risk. Attendance and stress concerns.",
        analyzedAt: new Date().toISOString(),
    },
];

// Detailed chart data per student (maps to student_burnout_data JSON columns)
const MOCK_DETAIL = {
    "user-001": {
        stressLevel: 9,
        attendanceRecords: [
            { week: "Wk 1", pct: 95 }, { week: "Wk 2", pct: 90 },
            { week: "Wk 3", pct: 82 }, { week: "Wk 4", pct: 74 },
            { week: "Wk 5", pct: 61 }, { week: "Wk 6", pct: 48 },
            { week: "Wk 7", pct: 44 }, { week: "Wk 8", pct: 38 },
        ],
        gradeRecords: [
            { subject: "DSA", prev: 85, curr: 62 }, { subject: "DBMS", prev: 78, curr: 55 },
            { subject: "OS", prev: 80, curr: 71 }, { subject: "CN", prev: 74, curr: 49 },
            { subject: "ML", prev: 88, curr: 60 },
        ],
        assignmentSubmissions: [
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
            { factor: "Submissions", score: 22 }, { factor: "Stress", score: 10 },
            { factor: "Social", score: 55 },
        ],
        signals: [
            { label: "Attendance critically low at 38%", severity: "critical" },
            { label: "4 assignments missed in last 2 weeks", severity: "critical" },
            { label: "Average grade dropped 22 points", severity: "high" },
            { label: "Self-reported stress critically high", severity: "high" },
            { label: "Increasing pattern of late submissions", severity: "medium" },
        ],
    },
};

// Auto-generate detail for other students
["user-002", "user-003", "user-004", "user-005", "user-006"].forEach((id) => {
    const s = MOCK_STUDENTS.find((x) => x.studentId === id);
    const base = s.riskScore;
    MOCK_DETAIL[id] = {
        stressLevel: s.contributingFactors.stress_level,
        attendanceRecords: Array.from({ length: 8 }, (_, i) => ({
            week: `Wk ${i + 1}`,
            pct: Math.max(30, Math.min(100, 95 - i * (base / 30) + (Math.random() * 5 - 2))),
        })),
        gradeRecords: ["DSA", "DBMS", "OS", "CN", "ML"].map((subject) => ({
            subject,
            prev: Math.round(72 + Math.random() * 18),
            curr: Math.round(72 + Math.random() * 18 - base / 5),
        })),
        assignmentSubmissions: Array.from({ length: 8 }, (_, i) => ({
            week: `Wk ${i + 1}`,
            onTime: Math.max(0, 5 - Math.floor(i * base / 80)),
            late: Math.min(5, Math.floor(i * base / 120)),
            missed: i > 1 ? Math.min(5, Math.floor(i * base / 100)) : 0,
        })),
        radarData: [
            { factor: "Attendance", score: Math.round(100 - base * 0.7) },
            { factor: "Grades", score: Math.round(100 - base * 0.6) },
            { factor: "Submissions", score: Math.round(100 - base * 0.8) },
            { factor: "Stress", score: Math.round(100 - s.contributingFactors.stress_level * 8) },
            { factor: "Social", score: Math.round(100 - base * 0.3) },
        ],
        signals: s.contributingFactors.attendance_concern
            ? [{ label: "Attendance below threshold", severity: "high" }]
            : [],
    };
});

// ─── Helper ───────────────────────────────────────────────────────────────────
// Maps DB risk_level ENUM to display label
export const RISK_DISPLAY = {
    critical: { label: "Critical", color: "#dc2626", bg: "#fef2f2", badge: "bg-red-100 text-red-700 border border-red-200" },
    high: { label: "High", color: "#f97316", bg: "#fff7ed", badge: "bg-orange-100 text-orange-700 border border-orange-200" },
    medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb", badge: "bg-amber-100 text-amber-700 border border-amber-200" },
    low: { label: "Low", color: "#22c55e", bg: "#f0fdf4", badge: "bg-green-100 text-green-700 border border-green-200" },
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Get all students with latest burnout risk scores.
 * Reads from: burnout_analysis (joined with users)
 */
export async function getAllStudentsRisk(filters = {}) {
    if (USE_MOCK) {
        let data = [...MOCK_STUDENTS];
        if (filters.riskLevel) data = data.filter((s) => s.riskLevel === filters.riskLevel);
        if (filters.branch) data = data.filter((s) => s.branch === filters.branch);
        if (filters.year) data = data.filter((s) => s.year === Number(filters.year));
        return { data, error: null };
    }
    try {
        const params = new URLSearchParams(filters).toString();
        const res = await axios.get(`${API_BASE}/api/burnout/students?${params}`);
        return { data: res.data, error: null };
    } catch (err) {
        return { data: [], error: err.response?.data?.detail || "Failed to fetch students" };
    }
}

/**
 * Get full detail for one student.
 * Reads from: student_burnout_data + burnout_analysis + burnout_alerts
 */
export async function getStudentDetail(studentId) {
    if (USE_MOCK) {
        const student = MOCK_STUDENTS.find((s) => s.studentId === studentId);
        const detail = MOCK_DETAIL[studentId] || {};
        return { data: { ...student, ...detail }, error: null };
    }
    try {
        const res = await axios.get(`${API_BASE}/api/burnout/student/${studentId}`);
        return { data: res.data, error: null };
    } catch (err) {
        return { data: null, error: err.response?.data?.detail || "Failed to fetch student" };
    }
}

/**
 * Submit new student data and trigger analysis.
 * Writes to: student_burnout_data → burnout_analysis
 */
export async function analyzeStudent(studentData) {
    if (USE_MOCK) {
        return { success: true, message: "Analysis complete (mock)", riskScore: 55, riskLevel: "medium" };
    }
    try {
        const res = await axios.post(`${API_BASE}/api/burnout/analyze`, studentData);
        return { success: true, ...res.data };
    } catch (err) {
        return { success: false, message: err.response?.data?.detail || "Analysis failed" };
    }
}

/**
 * Send counselor alert for a high-risk student.
 * Writes to: burnout_alerts + burnout_email_log
 * alert_type maps to ENUM: 'medium_risk' | 'high_risk' | 'critical_risk' | 'sudden_decline'
 */
export async function sendCounselorAlert({ studentId, analysisId, riskLevel, counselorEmail, message }) {
    if (USE_MOCK) {
        return { success: true, message: "Alert sent to counselor (mock)", alertId: "mock-alert-" + studentId };
    }
    try {
        const res = await axios.post(`${API_BASE}/api/burnout/alert`, {
            student_id: studentId,
            analysis_id: analysisId,
            counselor_email: counselorEmail,
            message,
        });
        return { success: true, ...res.data };
    } catch (err) {
        return { success: false, message: err.response?.data?.detail || "Alert failed" };
    }
}

/**
 * Update alert status.
 * Updates: burnout_alerts.status ENUM
 * Valid values: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'
 */
export async function updateAlertStatus(alertId, status, notes = "") {
    if (USE_MOCK) {
        return { success: true, alertId, newStatus: status };
    }
    try {
        const res = await axios.patch(
            `${API_BASE}/api/burnout/alert/${alertId}/status?status=${status}&notes=${encodeURIComponent(notes)}`
        );
        return { success: true, ...res.data };
    } catch (err) {
        return { success: false, message: err.response?.data?.detail || "Update failed" };
    }
}

/**
 * Get admin overview stats.
 * Reads from: burnout_analysis + burnout_alerts (aggregated)
 */
export async function getBurnoutOverview() {
    if (USE_MOCK) {
        return {
            data: {
                totalStudents: 120,
                criticalCount: 8,
                highCount: 18,
                mediumCount: 34,
                lowCount: 60,
                alertsPending: 14,
                alertsResolvedThisWeek: 7,
                trend: "worsening",
                topSignals: [
                    { signal: "Attendance drop", occurrences: 31 },
                    { signal: "Missed assignments", occurrences: 24 },
                    { signal: "Grade decline", occurrences: 19 },
                    { signal: "High stress", occurrences: 15 },
                ],
            },
            error: null,
        };
    }
    try {
        const res = await axios.get(`${API_BASE}/api/burnout/analytics/overview`);
        return { data: res.data, error: null };
    } catch (err) {
        return { data: null, error: "Failed to fetch overview" };
    }
}