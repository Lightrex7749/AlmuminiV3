\"\"\"
AI-Powered Burnout Analysis Service
Uses OpenAI GPT to analyze student data and detect burnout patterns
\"\"\"
import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class BurnoutAnalyzer:
    \"\"\"AI-powered burnout detection and analysis service\"\"\"
    
    def __init__(self):
        \"\"\"Initialize OpenAI client\"\"\"
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            logger.warning(\"⚠️ OPENAI_API_KEY not set - Burnout analysis will use fallback logic\")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=self.api_key)
            logger.info(\"✅ OpenAI client initialized for burnout analysis\")
    
    async def analyze_student_burnout(
        self,
        student_id: str,
        attendance_records: List[Dict],
        grade_records: List[Dict],
        assignment_submissions: List[Dict],
        sleep_activity: List[Dict],
        stress_level: int,
        previous_analysis: Optional[Dict] = None
    ) -> Dict[str, Any]:
        \"\"\"
        Comprehensive burnout analysis using AI
        
        Args:
            student_id: Student identifier
            attendance_records: List of attendance records
            grade_records: List of grade records
            assignment_submissions: List of assignment submissions
            sleep_activity: List of sleep/activity records
            stress_level: Self-reported stress (1-10)
            previous_analysis: Previous analysis for trend comparison
            
        Returns:
            Analysis result with risk score, level, factors, and recommendations
        \"\"\"
        try:
            # Calculate basic metrics
            metrics = self._calculate_metrics(
                attendance_records,
                grade_records,
                assignment_submissions,
                sleep_activity,
                stress_level
            )
            
            # Use AI for analysis if available, otherwise use rule-based fallback
            if self.client and self.api_key:
                analysis = await self._ai_analysis(metrics, previous_analysis)
            else:
                analysis = self._fallback_analysis(metrics, previous_analysis)
            
            # Add metadata
            analysis['student_id'] = student_id
            analysis['data_points_analyzed'] = metrics['total_data_points']
            analysis['analyzed_at'] = datetime.utcnow().isoformat()
            
            return analysis
            
        except Exception as e:
            logger.error(f\"Error in burnout analysis for student {student_id}: {str(e)}\")
            # Return safe fallback
            return self._create_safe_fallback_analysis(stress_level)
    
    def _calculate_metrics(
        self,
        attendance_records: List[Dict],
        grade_records: List[Dict],
        assignment_submissions: List[Dict],
        sleep_activity: List[Dict],
        stress_level: int
    ) -> Dict[str, Any]:
        \"\"\"Calculate key metrics from raw data\"\"\"
        
        metrics = {
            'total_data_points': 0,
            'attendance': {},
            'grades': {},
            'assignments': {},
            'sleep': {},
            'stress': stress_level
        }
        
        # Attendance metrics
        if attendance_records:
            total_days = len(attendance_records)
            absent_days = sum(1 for r in attendance_records if r.get('status') == 'absent')
            late_days = sum(1 for r in attendance_records if r.get('status') == 'late')
            
            metrics['attendance'] = {
                'total_days': total_days,
                'absent_days': absent_days,
                'late_days': late_days,
                'attendance_rate': ((total_days - absent_days) / total_days * 100) if total_days > 0 else 100,
                'concern': absent_days > 2 or late_days > 3
            }
            metrics['total_data_points'] += total_days
        
        # Grade metrics
        if grade_records:
            sorted_grades = sorted(grade_records, key=lambda x: x.get('date', ''))
            current_avg = sum(g.get('grade', 0) for g in grade_records) / len(grade_records)
            
            # Check for grade drops
            grade_drops = []
            for record in grade_records:
                if record.get('previous_grade'):
                    drop = record['previous_grade'] - record.get('grade', 0)
                    if drop > 0:
                        grade_drops.append(drop)
            
            metrics['grades'] = {
                'current_average': round(current_avg, 2),
                'total_courses': len(grade_records),
                'grade_drops': grade_drops,
                'average_drop': round(sum(grade_drops) / len(grade_drops), 2) if grade_drops else 0,
                'concern': bool(grade_drops and sum(grade_drops) / len(grade_drops) > 5)
            }
            metrics['total_data_points'] += len(grade_records)
        
        # Assignment metrics
        if assignment_submissions:
            late_submissions = sum(1 for a in assignment_submissions if a.get('status') == 'late')
            missed_submissions = sum(1 for a in assignment_submissions if a.get('status') == 'missed')
            total_assignments = len(assignment_submissions)
            
            metrics['assignments'] = {
                'total': total_assignments,
                'late': late_submissions,
                'missed': missed_submissions,
                'on_time_rate': ((total_assignments - late_submissions - missed_submissions) / total_assignments * 100) if total_assignments > 0 else 100,
                'concern': missed_submissions > 1 or late_submissions > 2
            }
            metrics['total_data_points'] += total_assignments
        
        # Sleep and activity metrics
        if sleep_activity:
            avg_sleep = sum(s.get('sleep_hours', 0) for s in sleep_activity) / len(sleep_activity)
            low_sleep_days = sum(1 for s in sleep_activity if s.get('sleep_hours', 0) < 6)
            low_activity_days = sum(1 for s in sleep_activity if s.get('activity_level') == 'low')
            
            metrics['sleep'] = {
                'average_sleep_hours': round(avg_sleep, 1),
                'low_sleep_days': low_sleep_days,
                'low_activity_days': low_activity_days,
                'total_tracked_days': len(sleep_activity),
                'concern': avg_sleep < 6 or low_sleep_days > 3
            }
            metrics['total_data_points'] += len(sleep_activity)
        
        return metrics
    
    async def _ai_analysis(self, metrics: Dict, previous_analysis: Optional[Dict]) -> Dict[str, Any]:
        \"\"\"Use OpenAI to analyze metrics and generate insights\"\"\"
        
        # Build the prompt
        prompt = self._build_analysis_prompt(metrics, previous_analysis)
        
        try:
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=\"gpt-4o\",  # Using GPT-4 for better analysis
                messages=[
                    {
                        \"role\": \"system\",
                        \"content\": \"\"\"You are an expert educational psychologist specializing in student mental health and academic burnout detection. 
                        Analyze the provided student data and provide a comprehensive burnout risk assessment. 
                        Your analysis should be empathetic, evidence-based, and actionable.\"\"\"
                    },
                    {
                        \"role\": \"user\",
                        \"content\": prompt
                    }
                ],
                response_format={\"type\": \"json_object\"},
                temperature=0.3,  # Lower temperature for more consistent analysis
                max_tokens=1500
            )
            
            # Parse AI response
            ai_response = json.loads(response.choices[0].message.content)
            
            # Validate and structure the response
            analysis = {
                'risk_score': float(ai_response.get('risk_score', 50)),
                'risk_level': ai_response.get('risk_level', 'medium'),
                'contributing_factors': ai_response.get('contributing_factors', {}),
                'recommendations': ai_response.get('recommendations', []),
                'analysis_summary': ai_response.get('analysis_summary', ''),
                'trend': ai_response.get('trend', 'stable'),
                'confidence_level': float(ai_response.get('confidence_level', 0.7))
            }
            
            # Ensure risk_level matches risk_score
            analysis['risk_level'] = self._determine_risk_level(analysis['risk_score'])
            
            return analysis
            
        except Exception as e:
            logger.error(f\"OpenAI API error: {str(e)}\")
            # Fallback to rule-based analysis
            return self._fallback_analysis(metrics, previous_analysis)
    
    def _build_analysis_prompt(self, metrics: Dict, previous_analysis: Optional[Dict]) -> str:
        \"\"\"Build detailed prompt for AI analysis\"\"\"
        
        prompt = f\"\"\"Analyze the following student burnout indicators and provide a comprehensive assessment.

**STUDENT DATA SUMMARY:**

Stress Level: {metrics['stress']}/10

Attendance:
{json.dumps(metrics.get('attendance', {}), indent=2)}

Academic Performance:
{json.dumps(metrics.get('grades', {}), indent=2)}

Assignment Submissions:
{json.dumps(metrics.get('assignments', {}), indent=2)}

Sleep & Activity:
{json.dumps(metrics.get('sleep', {}), indent=2)}
\"\"\"

        if previous_analysis:
            prompt += f\"\"\"
**PREVIOUS ANALYSIS:**
- Previous Risk Score: {previous_analysis.get('risk_score', 'N/A')}
- Previous Risk Level: {previous_analysis.get('risk_level', 'N/A')}
- Trend: Compare current data with previous assessment
\"\"\"

        prompt += \"\"\"
**REQUIRED OUTPUT (JSON FORMAT):**
{
    \"risk_score\": <number 0-100>,
    \"risk_level\": \"<low|medium|high|critical>\",
    \"contributing_factors\": {
        \"attendance_concern\": <boolean>,
        \"grade_decline\": <boolean>,
        \"sleep_deprivation\": <boolean>,
        \"assignment_struggles\": <boolean>,
        \"high_stress\": <boolean>
    },
    \"recommendations\": [
        \"<actionable recommendation 1>\",
        \"<actionable recommendation 2>\",
        \"<actionable recommendation 3>\"
    ],
    \"analysis_summary\": \"<2-3 sentence summary of the burnout assessment>\",
    \"trend\": \"<improving|stable|declining|critical>\",
    \"confidence_level\": <number 0-1 indicating confidence in assessment>
}

**RISK LEVEL GUIDELINES:**
- low (0-30): Student is managing well with minimal concerns
- medium (31-60): Some concerning patterns emerging, monitoring recommended
- high (61-85): Multiple risk factors present, intervention advised
- critical (86-100): Severe burnout indicators, immediate intervention required

Provide your analysis in valid JSON format.
\"\"\"
        
        return prompt
    
    def _fallback_analysis(self, metrics: Dict, previous_analysis: Optional[Dict]) -> Dict[str, Any]:
        \"\"\"Rule-based fallback analysis when AI is not available\"\"\"
        
        risk_factors = []
        concern_count = 0
        
        # Analyze each metric
        if metrics.get('attendance', {}).get('concern'):
            concern_count += 1
            risk_factors.append(\"attendance_concern\")
        
        if metrics.get('grades', {}).get('concern'):
            concern_count += 1
            risk_factors.append(\"grade_decline\")
        
        if metrics.get('assignments', {}).get('concern'):
            concern_count += 1
            risk_factors.append(\"assignment_struggles\")
        
        if metrics.get('sleep', {}).get('concern'):
            concern_count += 1
            risk_factors.append(\"sleep_deprivation\")
        
        if metrics.get('stress', 0) >= 7:
            concern_count += 1
            risk_factors.append(\"high_stress\")
        
        # Calculate risk score
        base_score = concern_count * 15
        stress_weight = metrics.get('stress', 5) * 3
        risk_score = min(base_score + stress_weight, 100)
        
        # Determine risk level
        risk_level = self._determine_risk_level(risk_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(risk_factors, metrics)
        
        # Determine trend
        trend = 'stable'
        if previous_analysis:
            prev_score = previous_analysis.get('risk_score', 50)
            if risk_score > prev_score + 10:
                trend = 'declining'
            elif risk_score < prev_score - 10:
                trend = 'improving'
            elif risk_score > 85:
                trend = 'critical'
        
        return {
            'risk_score': float(risk_score),
            'risk_level': risk_level,
            'contributing_factors': {factor: True for factor in risk_factors},
            'recommendations': recommendations,
            'analysis_summary': self._generate_summary(risk_level, risk_factors),
            'trend': trend,
            'confidence_level': 0.75  # Moderate confidence for rule-based
        }
    
    def _determine_risk_level(self, risk_score: float) -> str:
        \"\"\"Determine risk level from score\"\"\"
        if risk_score <= 30:
            return 'low'
        elif risk_score <= 60:
            return 'medium'
        elif risk_score <= 85:
            return 'high'
        else:
            return 'critical'
    
    def _generate_recommendations(self, risk_factors: List[str], metrics: Dict) -> List[str]:
        \"\"\"Generate actionable recommendations based on risk factors\"\"\"
        recommendations = []
        
        if 'attendance_concern' in risk_factors:
            recommendations.append(\"Improve attendance consistency - consider speaking with academic advisor about barriers\")
        
        if 'grade_decline' in risk_factors:
            recommendations.append(\"Seek tutoring or study group support for struggling subjects\")
        
        if 'assignment_struggles' in risk_factors:
            recommendations.append(\"Work with academic counselor on time management and organization strategies\")
        
        if 'sleep_deprivation' in risk_factors:
            recommendations.append(\"Prioritize sleep hygiene - aim for 7-8 hours per night and establish consistent sleep schedule\")
        
        if 'high_stress' in risk_factors:
            recommendations.append(\"Connect with campus counseling services for stress management support\")
        
        # Add general wellness recommendations
        if len(risk_factors) >= 2:
            recommendations.append(\"Consider scheduling a wellness check-in with student support services\")
        
        if not recommendations:
            recommendations.append(\"Continue maintaining healthy academic and wellness habits\")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def _generate_summary(self, risk_level: str, risk_factors: List[str]) -> str:
        \"\"\"Generate analysis summary\"\"\"
        factor_count = len(risk_factors)
        
        if risk_level == 'low':
            return f\"Student shows minimal burnout indicators with {factor_count} areas of concern. Overall wellness appears stable.\"
        elif risk_level == 'medium':
            return f\"Student shows {factor_count} concerning patterns that warrant monitoring. Early intervention may prevent escalation.\"
        elif risk_level == 'high':
            return f\"Student displays {factor_count} significant burnout indicators. Intervention is strongly recommended to support student wellbeing.\"
        else:  # critical
            return f\"Student exhibits {factor_count} severe burnout indicators requiring immediate attention. Urgent intervention needed.\"
    
    def _create_safe_fallback_analysis(self, stress_level: int) -> Dict[str, Any]:
        \"\"\"Create a safe fallback analysis when errors occur\"\"\"
        return {
            'risk_score': min(stress_level * 10, 100),
            'risk_level': self._determine_risk_level(stress_level * 10),
            'contributing_factors': {'high_stress': stress_level >= 7},
            'recommendations': ['Please submit complete data for comprehensive analysis'],
            'analysis_summary': 'Insufficient data for complete analysis',
            'trend': 'stable',
            'confidence_level': 0.3,
            'data_points_analyzed': 1,
            'analyzed_at': datetime.utcnow().isoformat()
        }


# Singleton instance
burnout_analyzer = BurnoutAnalyzer()
