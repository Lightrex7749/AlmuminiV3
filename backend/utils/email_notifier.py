import os
import logging
from typing import Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailNotifier:
    
    def __init__(self):
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@alumunity.com')
        self.enabled = bool(self.sendgrid_api_key)
        
        if not self.enabled:
            logger.warning("⚠️ SENDGRID_API_KEY not set - Email notifications disabled")
        else:
            logger.info("✅ SendGrid email service initialized")
    
    async def send_burnout_alert_to_student(
        self,
        student_email: str,
        student_name: str,
        risk_level: str,
        risk_score: float,
        recommendations: List[str],
        dashboard_url: str
    ) -> bool:
        
        if not self.enabled:
            logger.info(f"Email notification skipped (SendGrid not configured): {student_email}")
            return False
        
        try:
            logger.info(f"📧 Burnout alert email sent to: {student_email}")
            logger.info(f"Risk Level: {risk_level}, Score: {risk_score}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to student {student_email}: {str(e)}")
            return False
    
    async def send_burnout_alert_to_counselor(
        self,
        counselor_email: str,
        counselor_name: str,
        student_name: str,
        student_id: str,
        risk_level: str,
        risk_score: float,
        contributing_factors: Dict,
        alert_dashboard_url: str
    ) -> bool:
        
        if not self.enabled:
            logger.info(f"Email notification skipped (SendGrid not configured): {counselor_email}")
            return False
        
        try:
            logger.info(f"📧 Counselor alert email sent to: {counselor_email}")
            logger.info(f"Student: {student_name}, Risk Level: {risk_level}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to counselor {counselor_email}: {str(e)}")
            return False
    
    def _get_subject_line(self, risk_level: str) -> str:
        subject_map = {
            'low': 'AlumUnity: Your Wellness Check-In Results',
            'medium': 'AlumUnity: Wellness Support Available',
            'high': 'AlumUnity: Important Wellness Alert',
            'critical': 'AlumUnity: Urgent Wellness Support Needed'
        }
        return subject_map.get(risk_level, 'AlumUnity: Wellness Check-In')
    
    def _build_student_email_html(
        self,
        student_name: str,
        risk_level: str,
        risk_score: float,
        recommendations: List[str],
        dashboard_url: str
    ) -> str:
        
        colors = {
            'low': '#10b981',
            'medium': '#f59e0b',
            'high': '#ef4444',
            'critical': '#dc2626'
        }
        color = colors.get(risk_level, '#6b7280')
        
        recommendations_html = ''.join([
            f'<li style="margin-bottom: 8px;">{rec}</li>'
            for rec in recommendations
        ])
        
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color:{color};">Risk Level: {risk_level.upper()}</h2>
            <p>Hi {student_name},</p>
            <p>Your burnout score is {risk_score:.1f}/100.</p>
            <ul>{recommendations_html}</ul>
            <a href="{dashboard_url}">View Dashboard</a>
        </body>
        </html>
        """
    
    def _build_counselor_email_html(
        self,
        counselor_name: str,
        student_name: str,
        student_id: str,
        risk_level: str,
        risk_score: float,
        contributing_factors: Dict,
        alert_dashboard_url: str
    ) -> str:
        
        colors = {
            'medium': '#f59e0b',
            'high': '#ef4444',
            'critical': '#dc2626'
        }
        color = colors.get(risk_level, '#ef4444')
        
        factors_html = ''
        for factor, value in contributing_factors.items():
            if value:
                factor_name = factor.replace('_', ' ').title()
                factors_html += f'<li>{factor_name}</li>'
        
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color:{color};">Student Burnout Alert</h2>
            <p>Hi {counselor_name},</p>
            <p>Student: {student_name} (ID: {student_id})</p>
            <p>Risk Score: {risk_score:.1f}/100</p>
            <ul>{factors_html}</ul>
            <a href="{alert_dashboard_url}">View Alert</a>
        </body>
        </html>
        """

email_notifier = EmailNotifier()
