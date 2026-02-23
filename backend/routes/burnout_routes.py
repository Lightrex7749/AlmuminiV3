"""
burnout_routes.py — FastAPI routes for Academic Burnout Detection
Updated to match the actual AlumUnity schema:
  - student_burnout_data
  - burnout_analysis
  - burnout_alerts
  - burnout_email_log

Place this file in: backend/routes/burnout_routes.py

Then in server.py add these 2 lines:
    from routes.burnout_routes import burnout_router
    app.include_router(burnout_router, prefix="/api/burnout", tags=["burnout"])
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import uuid

burnout_router = APIRouter()

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class AlertRequest(BaseModel):
    student_id: str
    analysis_id: Optional[str] = None
    counselor_email: Optional[str] = None
    message: Optional[str] = None

class AlertResponse(BaseModel):
    success: bool
    message: str
    alert_id: str

class BurnoutDataInput(BaseModel):
    student_id: str
    attendance_records: Optional[list] = []
    grade_records: Optional[list] = []
    assignment_submissions: Optional[list] = []
    sleep_activity: Optional[list] = []
    stress_level: Optional[int] = 5
    notes: Optional[str] = ""
    week_number: Optional[int] = None
    year: Optional[int] = None

class BurnoutRiskResponse(BaseModel):
    student_id: str
    name: str
    roll_no: str
    risk_score: float
    risk_level: str
    contributing_factors: dict
    recommendations: list
    trend: str
    analysis_summary: str
    alert_sent: bool
    analyzed_at: str


# ─── Scoring Engine ───────────────────────────────────────────────────────────

def calculate_attendance_penalty(records: list) -> tuple:
    """Max penalty: 40. Returns (score, factors, signals)"""
    if not records or len(records) < 2:
        return 0, False, []

    signals = []
    penalty = 0
    total = len(records)
    absences = sum(1 for r in records if r.get("status") == "absent")
    attendance_pct = ((total - absences) / total) * 100 if total > 0 else 100

    # Detect trend — compare first half vs second half
    mid = total // 2
    first_half_absent = sum(1 for r in records[:mid] if r.get("status") == "absent")
    second_half_absent = sum(1 for r in records[mid:] if r.get("status") == "absent")
    declining = second_half_absent > first_half_absent

    if attendance_pct < 50:
        penalty += 40
        signals.append(f"Attendance critically low at {attendance_pct:.1f}%")
    elif attendance_pct < 65:
        penalty += 25
        signals.append(f"Attendance below threshold at {attendance_pct:.1f}%")
    elif attendance_pct < 75:
        penalty += 15
        signals.append(f"Attendance trending low at {attendance_pct:.1f}%")

    if declining and penalty < 40:
        penalty += 10
        signals.append("Attendance declining in recent weeks")

    return min(penalty, 40), attendance_pct < 75, signals


def calculate_grade_penalty(records: list) -> tuple:
    """Max penalty: 30. Returns (score, factors, signals)"""
    if not records:
        return 0, False, []

    signals = []
    penalty = 0
    drops = [r["previous_grade"] - r["grade"] for r in records
             if r.get("previous_grade") and r.get("grade")]

    if not drops:
        return 0, False, []

    avg_drop = sum(drops) / len(drops)
    severe = [r for r in records if r.get("previous_grade") and r.get("grade")
              and (r["previous_grade"] - r["grade"]) > 20]

    if avg_drop > 20:
        penalty += 30
        signals.append(f"Average grade dropped {avg_drop:.1f} points")
    elif avg_drop > 10:
        penalty += 18
        signals.append("Grades dropping across multiple subjects")
    elif avg_drop > 5:
        penalty += 8
        signals.append("Minor grade dip detected")

    for r in severe[:2]:
        signals.append(f"{r.get('course', 'Subject')} grade fell by {r['previous_grade'] - r['grade']:.0f} points")

    return min(penalty, 30), avg_drop > 10, signals


def calculate_submission_penalty(records: list) -> tuple:
    """Max penalty: 30. Returns (score, factors, signals)"""
    if not records:
        return 0, False, []

    signals = []
    penalty = 0
    recent = records[-10:] if len(records) >= 10 else records
    missed = sum(1 for r in recent if r.get("status") == "missed")
    late = sum(1 for r in recent if r.get("status") == "late")

    if missed >= 5:
        penalty += 30
        signals.append(f"{missed} assignments missed recently")
    elif missed >= 3:
        penalty += 18
        signals.append(f"{missed} missed assignments detected")

    if late >= 5:
        penalty += 15
        signals.append(f"Increasing pattern of late submissions ({late} recent)")
    elif late >= 3:
        penalty += 8
        signals.append("Pattern of late submissions detected")

    return min(penalty, 30), missed >= 3 or late >= 5, signals


def calculate_stress_penalty(stress_level: int) -> tuple:
    """Bonus 0–10 points from self-reported stress"""
    if stress_level >= 9:
        return 10, "Self-reported stress critically high"
    elif stress_level >= 7:
        return 6, "Self-reported stress level high"
    elif stress_level >= 5:
        return 3, "Moderate stress reported"
    return 0, None


def compute_burnout_risk(data: dict) -> dict:
    """
    Computes risk score (0–100) from student_burnout_data JSON fields.
    Maps to burnout_analysis table columns.
    """
    att_penalty, att_concern, att_signals = calculate_attendance_penalty(
        data.get("attendance_records") or []
    )
    grade_penalty, grade_concern, grade_signals = calculate_grade_penalty(
        data.get("grade_records") or []
    )
    sub_penalty, sub_concern, sub_signals = calculate_submission_penalty(
        data.get("assignment_submissions") or []
    )
    stress_bonus, stress_signal = calculate_stress_penalty(
        data.get("stress_level", 5)
    )

    total = att_penalty + grade_penalty + sub_penalty + stress_bonus
    total = min(total, 100)

    # Map to burnout_analysis.risk_level ENUM
    if total >= 80:
        risk_level = "critical"
    elif total >= 60:
        risk_level = "high"
    elif total >= 35:
        risk_level = "medium"
    else:
        risk_level = "low"

    # contributing_factors → JSON column in burnout_analysis
    contributing_factors = {
        "attendance_concern": att_concern,
        "grade_drop": grade_concern,
        "submission_issues": sub_concern,
        "stress_level": data.get("stress_level", 5),
        "sleep_deprivation": False,  # extend when sleep_activity data available
    }

    all_signals = att_signals + grade_signals + sub_signals
    if stress_signal:
        all_signals.append(stress_signal)

    # recommendations → JSON array column in burnout_analysis
    recommendations = []
    if att_concern:
        recommendations.append("Attend all scheduled classes — consistency matters")
    if grade_concern:
        recommendations.append("Schedule sessions with academic advisor to review grades")
    if sub_concern:
        recommendations.append("Use a planner to track assignment due dates")
    if data.get("stress_level", 5) >= 7:
        recommendations.append("Speak with a counselor about stress management techniques")
    if not recommendations:
        recommendations.append("Keep up the good work — maintain your current habits")

    summary_parts = [f"Risk score: {total:.1f}/100 ({risk_level.upper()})."]
    if all_signals:
        summary_parts.append("Detected signals: " + "; ".join(all_signals) + ".")
    summary_parts.append("Recommendations: " + " | ".join(recommendations))
    analysis_summary = " ".join(summary_parts)

    return {
        "risk_score": round(total, 2),
        "risk_level": risk_level,
        "contributing_factors": contributing_factors,
        "recommendations": recommendations,
        "analysis_summary": analysis_summary,
        "signals": all_signals,
        "data_points_analyzed": (
            len(data.get("attendance_records") or []) +
            len(data.get("grade_records") or []) +
            len(data.get("assignment_submissions") or [])
        ),
        "confidence_level": min(1.0, round(
            (len(data.get("attendance_records") or []) +
             len(data.get("grade_records") or []) +
             len(data.get("assignment_submissions") or [])) / 30, 2
        )),
    }


# ─── API Routes ───────────────────────────────────────────────────────────────

@burnout_router.get("/students")
async def get_all_students_risk(
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
):
    """
    Returns latest burnout_analysis records for all students.

    In production replace mock with:
        rows = await db.fetch_all(
            "SELECT ba.*, u.full_name, u.email FROM burnout_analysis ba
             INNER JOIN (
                 SELECT student_id, MAX(analyzed_at) AS latest
                 FROM burnout_analysis GROUP BY student_id
             ) latest ON ba.student_id = latest.student_id
                     AND ba.analyzed_at = latest.latest
             INNER JOIN users u ON ba.student_id = u.id"
        )
    """
    # Mock response — replace with real DB query above
    mock = [
        {
            "student_id": "user-001", "name": "Ananya Sharma", "roll_no": "CS21001",
            "risk_score": 82.0, "risk_level": "critical",
            "contributing_factors": {"attendance_concern": True, "grade_drop": True, "stress_level": 9},
            "recommendations": ["Speak with counselor", "Track assignments"],
            "trend": "declining", "alert_sent": False,
            "analysis_summary": "Critical burnout risk detected.",
            "analyzed_at": datetime.now().isoformat(),
        },
        {
            "student_id": "user-002", "name": "Rohan Mehta", "roll_no": "CS21045",
            "risk_score": 54.0, "risk_level": "medium",
            "contributing_factors": {"attendance_concern": False, "grade_drop": True, "stress_level": 6},
            "recommendations": ["Review grades with advisor"],
            "trend": "stable", "alert_sent": False,
            "analysis_summary": "Medium burnout risk. Grade drop detected.",
            "analyzed_at": datetime.now().isoformat(),
        },
        {
            "student_id": "user-003", "name": "Priya Nair", "roll_no": "ME21012",
            "risk_score": 20.0, "risk_level": "low",
            "contributing_factors": {"attendance_concern": False, "grade_drop": False, "stress_level": 3},
            "recommendations": ["Keep up the good work"],
            "trend": "improving", "alert_sent": False,
            "analysis_summary": "Low risk. Student performing well.",
            "analyzed_at": datetime.now().isoformat(),
        },
        {
            "student_id": "user-004", "name": "Karan Singh", "roll_no": "EC21089",
            "risk_score": 71.0, "risk_level": "high",
            "contributing_factors": {"attendance_concern": True, "grade_drop": True, "stress_level": 8},
            "recommendations": ["Attend classes", "Seek academic support"],
            "trend": "declining", "alert_sent": True,
            "analysis_summary": "High burnout risk. Multiple signals detected.",
            "analyzed_at": datetime.now().isoformat(),
        },
    ]

    if risk_level:
        mock = [s for s in mock if s["risk_level"] == risk_level]

    return mock


@burnout_router.get("/student/{student_id}")
async def get_student_detail(student_id: str):
    """
    Returns detailed burnout data for one student, pulling from:
    - student_burnout_data (raw records)
    - burnout_analysis (computed scores)
    - burnout_alerts (alert history)

    In production:
        raw = await db.fetch_one(
            "SELECT * FROM student_burnout_data
             WHERE student_id = :sid ORDER BY created_at DESC LIMIT 1",
            {"sid": student_id}
        )
        analysis = await db.fetch_one(
            "SELECT * FROM burnout_analysis
             WHERE student_id = :sid ORDER BY analyzed_at DESC LIMIT 1",
            {"sid": student_id}
        )
    """
    # Mock detail — replace with real DB queries above
    return {
        "student_id": student_id,
        "name": "Ananya Sharma",
        "roll_no": "CS21001",
        "risk_score": 82.0,
        "risk_level": "critical",
        "trend": "declining",
        "stress_level": 9,
        "contributing_factors": {
            "attendance_concern": True,
            "grade_drop": True,
            "submission_issues": True,
            "stress_level": 9,
        },
        "recommendations": [
            "Attend all scheduled classes",
            "Schedule sessions with academic advisor",
            "Speak with a counselor about stress management",
        ],
        "analysis_summary": "Critical burnout risk detected across all indicators.",
        "alert_sent": False,
        "analyzed_at": datetime.now().isoformat(),
        # Chart data pulled from student_burnout_data JSON columns
        "attendance_records": [
            {"week": "Wk 1", "pct": 95}, {"week": "Wk 2", "pct": 90},
            {"week": "Wk 3", "pct": 82}, {"week": "Wk 4", "pct": 74},
            {"week": "Wk 5", "pct": 61}, {"week": "Wk 6", "pct": 48},
            {"week": "Wk 7", "pct": 44}, {"week": "Wk 8", "pct": 38},
        ],
        "grade_records": [
            {"subject": "DSA",  "prev": 85, "curr": 62},
            {"subject": "DBMS", "prev": 78, "curr": 55},
            {"subject": "OS",   "prev": 80, "curr": 71},
            {"subject": "CN",   "prev": 74, "curr": 49},
            {"subject": "ML",   "prev": 88, "curr": 60},
        ],
        "assignment_submissions": [
            {"week": "Wk 1", "onTime": 5, "late": 0, "missed": 0},
            {"week": "Wk 2", "onTime": 4, "late": 1, "missed": 0},
            {"week": "Wk 3", "onTime": 3, "late": 2, "missed": 0},
            {"week": "Wk 4", "onTime": 2, "late": 2, "missed": 1},
            {"week": "Wk 5", "onTime": 1, "late": 2, "missed": 2},
            {"week": "Wk 6", "onTime": 1, "late": 1, "missed": 3},
            {"week": "Wk 7", "onTime": 0, "late": 2, "missed": 3},
            {"week": "Wk 8", "onTime": 0, "late": 1, "missed": 4},
        ],
        "radar_data": [
            {"factor": "Attendance",  "score": 38},
            {"factor": "Grades",      "score": 45},
            {"factor": "Submissions", "score": 22},
            {"factor": "Stress",      "score": 10},
            {"factor": "Social",      "score": 55},
        ],
        "signals": [
            {"label": "Attendance critically low at 38%",      "severity": "critical"},
            {"label": "4 assignments missed in last 2 weeks",  "severity": "critical"},
            {"label": "Average grade dropped 22 points",       "severity": "high"},
            {"label": "Self-reported stress critically high",  "severity": "high"},
            {"label": "Increasing pattern of late submissions","severity": "medium"},
        ],
    }


@burnout_router.post("/analyze")
async def analyze_student(data: BurnoutDataInput):
    """
    Accepts raw student data, computes burnout risk, and stores results.

    In production:
    1. INSERT into student_burnout_data
    2. Run compute_burnout_risk()
    3. INSERT result into burnout_analysis
    4. If risk >= 'high', INSERT into burnout_alerts
    """
    result = compute_burnout_risk(data.dict())

    # In production:
    # analysis_id = str(uuid.uuid4())
    # await db.execute("""
    #     INSERT INTO student_burnout_data
    #     (id, student_id, attendance_records, grade_records,
    #      assignment_submissions, sleep_activity, stress_level, notes, week_number, year)
    #     VALUES (:id, :student_id, :attendance_records, :grade_records,
    #             :assignment_submissions, :sleep_activity, :stress_level, :notes, :week_number, :year)
    # """, {**data.dict(), "id": str(uuid.uuid4()),
    #       "attendance_records": json.dumps(data.attendance_records), ...})
    #
    # await db.execute("""
    #     INSERT INTO burnout_analysis
    #     (id, student_id, risk_score, risk_level, contributing_factors,
    #      recommendations, trend, analysis_summary, data_points_analyzed, confidence_level)
    #     VALUES (:id, :student_id, :risk_score, :risk_level, :contributing_factors,
    #             :recommendations, :trend, :analysis_summary, :data_points_analyzed, :confidence_level)
    # """, {**result, "id": analysis_id, "student_id": data.student_id,
    #       "contributing_factors": json.dumps(result["contributing_factors"]),
    #       "recommendations": json.dumps(result["recommendations"]), "trend": "stable"})

    return {
        "success": True,
        "student_id": data.student_id,
        **result,
        "analyzed_at": datetime.now().isoformat(),
    }


@burnout_router.post("/alert", response_model=AlertResponse)
async def send_counselor_alert(alert: AlertRequest):
    """
    Creates a burnout_alerts record and logs to burnout_email_log.

    In production:
        alert_id = str(uuid.uuid4())
        await db.execute(
            INSERT INTO burnout_alerts
            (id, student_id, analysis_id, alert_type, priority, status)
            VALUES (:id, :student_id, :analysis_id, 'high_risk', 'high', 'pending')
        )
        await db.execute(
            INSERT INTO burnout_email_log
            (id, alert_id, student_id, recipient_email, recipient_type, email_type, email_status)
            VALUES (:id, :alert_id, :student_id, :email, 'counselor', 'alert', 'pending')
        )
        # Then trigger your existing email utility
    """
    alert_id = str(uuid.uuid4())

    return AlertResponse(
        success=True,
        message=f"Alert created for student {alert.student_id}. Counselor will be notified.",
        alert_id=alert_id,
    )


@burnout_router.patch("/alert/{alert_id}/status")
async def update_alert_status(
    alert_id: str,
    status: str,  # pending | acknowledged | in_progress | resolved | dismissed
    notes: Optional[str] = None,
):
    """
    Updates burnout_alerts.status — called when counselor acknowledges or resolves alert.

    In production:
        await db.execute(
            UPDATE burnout_alerts
            SET status = :status, intervention_notes = :notes,
                intervention_date = NOW()
            WHERE id = :alert_id
        )
    """
    valid = ["pending", "acknowledged", "in_progress", "resolved", "dismissed"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid}")

    return {"success": True, "alert_id": alert_id, "new_status": status}


@burnout_router.get("/analytics/overview")
async def get_overview():
    """
    Admin dashboard overview — aggregates from burnout_analysis and burnout_alerts.

    In production:
        SELECT risk_level, COUNT(*) FROM burnout_analysis
        WHERE analyzed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY risk_level
    """
    return {
        "total_students": 120,
        "critical_count": 8,
        "high_count": 18,
        "medium_count": 34,
        "low_count": 60,
        "alerts_pending": 14,
        "alerts_resolved_this_week": 7,
        "trend": "worsening",
        "top_signals": [
            {"signal": "Attendance drop",    "occurrences": 31},
            {"signal": "Missed assignments", "occurrences": 24},
            {"signal": "Grade decline",      "occurrences": 19},
            {"signal": "High stress",        "occurrences": 15},
        ],
    }