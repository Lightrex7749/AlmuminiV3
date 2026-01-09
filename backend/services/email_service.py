"""Email service for sending OTPs and notifications"""
import os
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

# Email configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
# Check RESEND_FROM_EMAIL first, then fallback to FROM_EMAIL, then default
FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', os.environ.get('FROM_EMAIL', 'noreply@alumunity.com'))
USE_MOCK_EMAIL = not RESEND_API_KEY  # Use mock if no API key


class EmailService:
    """Email service with Resend support"""
    
    def __init__(self):
        self.use_mock = USE_MOCK_EMAIL
        # Initialize Resend client for making HTTP requests
        self.resend_api_key = RESEND_API_KEY
        self.resend_api_url = "https://api.resend.com/emails"
        if self.use_mock:
            logger.info("Mock email service initialized (no Resend API key)")
        else:
            logger.info("Resend client ready for email sending")
    
    async def send_verification_email(self, to_email: str, otp_code: str) -> bool:
        """Send email verification OTP"""
        subject = "Verify Your Email - AlumUnity"
        content = f"""
        <h2>Welcome to AlumUnity!</h2>
        <p>Your email verification code is: <strong>{otp_code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        """
        
        return await self._send_email(to_email, subject, content)
    
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """Send password reset link"""
        # In production, this would be a frontend URL
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        
        subject = "Reset Your Password - AlumUnity"
        content = f"""
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>Or copy this link: {reset_link}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        """
        
        return await self._send_email(to_email, subject, content)
    
    async def send_welcome_email(self, to_email: str, name: str) -> bool:
        """Send welcome email after successful verification"""
        subject = "Welcome to AlumUnity!"
        content = f"""
        <h2>Welcome to AlumUnity, {name}!</h2>
        <p>Your account has been successfully verified.</p>
        <p>You can now access all features of the platform.</p>
        <p>Get started by completing your profile!</p>
        """
        
        return await self._send_email(to_email, subject, content)
    
    async def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using SendGrid or mock"""
        if self.use_mock:
            return self._send_mock_email(to_email, subject, html_content)
        else:
            return await self._send_sendgrid_email(to_email, subject, html_content)
    
    def _send_mock_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Mock email sending (log to console)"""
        logger.info(f"\n{'='*60}")
        logger.info(f"MOCK EMAIL SENT")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Content:\n{html_content}")
        logger.info(f"{'='*60}\n")
        return True
    
    async def _send_sendgrid_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using Resend"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "from": FROM_EMAIL,
                    "to": to_email,
                    "subject": subject,
                    "html": html_content
                }
                
                headers = {
                    "Authorization": f"Bearer {self.resend_api_key}",
                    "Content-Type": "application/json"
                }
                
                response = await client.post(
                    self.resend_api_url,
                    json=payload,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    logger.info(f"Email sent to {to_email} via Resend, status: {response.status_code}")
                    return True
                else:
                    logger.error(f"Resend API error: {response.status_code} - {response.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False


# Singleton instance
email_service = EmailService()
