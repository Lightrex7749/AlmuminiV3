/**
 * burnoutService.js — Frontend service for Burnout Detection API
 * Place in: frontend/src/services/burnoutService.js
 *
 * Follows the same mock/real toggle pattern used elsewhere in AlumUnity.
 * Toggle with: REACT_APP_USE_MOCK_DATA=true in your .env
 */

import axios from "axios";

const USE_MOCK = process.env.REACT_APP_USE_MOCK_DATA === "true";
const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
    {
        studentId: 1, name: "Ananya Sharma", rollNo: "CS21001",
        branch: "CSE", year: 3, riskScore: 82, riskLevel: "High",
        signals: [
            { label: "Attendance dropped 57% over 8 weeks", severity: "critical" },
            { label: "4 missed assignments last week", severity: "critical" },
            { label: "Grade avg down 22 points since mid-sem", severity: "high" },
        ],
        lastCalculated: new Date().toISOString(),
    },
    {
        studentId: 2, name: "Rohan Mehta", rollNo: "CS21045",
        branch: "CSE", year: 3, riskScore: 54, riskLevel: "Medium",
        signals: [
            { label: "Grades declining trend detected", severity: "high" },
            { label: "Pattern of late submissions", severity: "medium" },
        ],
        lastCalculated: new Date().toISOString(),
    },
    {
        studentId: 3, name: "Priya Nair", rollNo: "ME21012",
        branch: "ME", year: 2, riskScore: 23, riskLevel: "Low",
        signals: [],
        lastCalculated: new Date().toISOString(),
    },
    {
        studentId: 4, name: "Karan Singh", rollNo: "EC21089",
        branch: "ECE", year: 3, riskScore: 71, riskLevel: "High",
        signals: [
            { label: "Attendance below threshold at 48%", severity: "critical" },
            { label: "CN grade fell by 28 points", severity: "high" },
        ],
        lastCalculated: new Date().toISOString(),
    },
];

const MOCK_DETAIL = {
    1: {
        attendance: [
            { week: "Wk 1", pct: 95 }, { week: "Wk 2", pct: 90 },
            { week: "Wk 3", pct: 82 }, { week: "Wk 4", pct: 74 },
            { week: "Wk 5", pct: 61 }, { week: "Wk 6", pct: 48 },
            { week: "Wk 7", pct: 44 }, { week: "Wk 8", pct: 38 },
        ],
        grades: [
            { subject: "DSA", prev: 85, curr: 62 },
            { subject: "DBMS", prev: 78, curr: 55 },
            { subject: "OS", prev: 80, curr: 71 },
            { subject: "CN", prev: 74, curr: 49 },
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
    },
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetch all students with their burnout risk scores.
 * @param {object} filters - { riskLevel?, branch?, year? }
 */
export async function getAllStudentsRisk(filters = {}) {
    if (USE_MOCK) {
        let data = [...MOCK_STUDENTS];
        if (filters.riskLevel) data = data.filter((s) => s.riskLevel === filters.riskLevel);
        if (filters.branch) data = data.filter((s) => s.branch === filters.branch);
        if (filters.year) data = data.filter((s) => s.year === filters.year);
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
 * Fetch detailed burnout analysis for a single student.
 * @param {number} studentId
 */
export async function getStudentBurnoutDetail(studentId) {
    if (USE_MOCK) {
        const student = MOCK_STUDENTS.find((s) => s.studentId === studentId);
        const detail = MOCK_DETAIL[studentId] || null;
        return { data: { ...student, ...detail }, error: null };
    }

    try {
        const res = await axios.get(`${API_BASE}/api/burnout/student/${studentId}`);
        return { data: res.data, error: null };
    } catch (err) {
        return { data: null, error: err.response?.data?.detail || "Failed to fetch student detail" };
    }
}

/**
 * Trigger recalculation of burnout score for a student.
 * @param {number} studentId
 */
export async function recalculateBurnout(studentId) {
    if (USE_MOCK) {
        return { success: true, message: "Risk score recalculated (mock)" };
    }

    try {
        const res = await axios.post(`${API_BASE}/api/burnout/calculate/${studentId}`);
        return { success: true, ...res.data };
    } catch (err) {
        return { success: false, message: err.response?.data?.detail || "Recalculation failed" };
    }
}

/**
 * Send a counselor alert for a high-risk student.
 * @param {object} alertData - { studentId, counselorEmail?, message? }
 */
export async function sendCounselorAlert(alertData) {
    if (USE_MOCK) {
        console.log("[Mock] Alert sent for student:", alertData.studentId);
        return { success: true, message: "Alert sent to counselor (mock)", alertId: 99999 };
    }

    try {
        const res = await axios.post(`${API_BASE}/api/burnout/alert`, {
            student_id: alertData.studentId,
            counselor_email: alertData.counselorEmail,
            message: alertData.message,
        });
        return { success: true, ...res.data };
    } catch (err) {
        return { success: false, message: err.response?.data?.detail || "Alert failed" };
    }
}

/**
 * Get aggregated burnout overview stats for the admin panel.
 */
export async function getBurnoutOverview() {
    if (USE_MOCK) {
        return {
            data: {
                totalStudents: 120,
                highRiskCount: 18,
                mediumRiskCount: 34,
                lowRiskCount: 68,
                alertsSentThisWeek: 12,
                trend: "worsening",
                topRiskSignals: [
                    { signal: "Attendance drop", occurrences: 31 },
                    { signal: "Missed assignments", occurrences: 24 },
                    { signal: "Grade decline", occurrences: 19 },
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