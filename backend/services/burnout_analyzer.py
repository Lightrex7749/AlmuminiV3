import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class BurnoutAnalyzer:
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            logger.warning("⚠️ OpenAI API key not found. Burnout analysis will use fallback logic.")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=self.api_key)
            logger.info("✅ OpenAI client initialized for burnout analysis")
    
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
        try:
            metrics = self._calculate_metrics(
                attendance_records,
                grade_records,
                assignment_submissions,
                sleep_activity,
                stress_level
            )
            
            if self.client and self.api_key:
                analysis = await self._ai_analysis(metrics, previous_analysis)
            else:
                analysis = self._fallback_analysis(metrics, previous_analysis)
            
            analysis['student_id'] = student_id
            analysis['data_points_analyzed'] = metrics['total_data_points']
            analysis['analyzed_at'] = datetime.utcnow().isoformat()
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in burnout analysis for student {student_id}: {str(e)}")
            return self._create_safe_fallback_analysis(stress_level)
    
    def _calculate_metrics(
        self,
        attendance_records: List[Dict],
        grade_records: List[Dict],
        assignment_submissions: List[Dict],
        sleep_activity: List[Dict],
        stress_level: int
    ) -> Dict[str, Any]:
        
        metrics = {
            'total_data_points': 0,
            'attendance': {},
            'grades': {},
            'assignments': {},
            'sleep': {},
            'stress': stress_level
        }
        
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
        
        if grade_records:
            current_avg = sum(g.get('grade', 0) for g in grade_records) / len(grade_records)
            
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
        prompt = self._build_analysis_prompt(metrics, previous_analysis)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "Analyze student burnout data and provide JSON output."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1500
            )
            
            ai_response = json.loads(response.choices[0].message.content)
            
            analysis = {
                'risk_score': float(ai_response.get('risk_score', 50)),
                'risk_level': ai_response.get('risk_level', 'medium'),
                'contributing_factors': ai_response.get('contributing_factors', {}),
                'recommendations': ai_response.get('recommendations', []),
                'analysis_summary': ai_response.get('analysis_summary', ''),
                'trend': ai_response.get('trend', 'stable'),
                'confidence_level': float(ai_response.get('confidence_level', 0.7))
            }
            
            analysis['risk_level'] = self._determine_risk_level(analysis['risk_score'])
            return analysis
            
        except Exception:
            return self._fallback_analysis(metrics, previous_analysis)
    
    def _fallback_analysis(self, metrics: Dict, previous_analysis: Optional[Dict]) -> Dict[str, Any]:
        risk_factors = []
        concern_count = 0
        
        if metrics.get('attendance', {}).get('concern'):
            concern_count += 1
            risk_factors.append("attendance_concern")
        
        if metrics.get('grades', {}).get('concern'):
            concern_count += 1
            risk_factors.append("grade_decline")
        
        if metrics.get('assignments', {}).get('concern'):
            concern_count += 1
            risk_factors.append("assignment_struggles")
        
        if metrics.get('sleep', {}).get('concern'):
            concern_count += 1
            risk_factors.append("sleep_deprivation")
        
        if metrics.get('stress', 0) >= 7:
            concern_count += 1
            risk_factors.append("high_stress")
        
        base_score = concern_count * 15
        stress_weight = metrics.get('stress', 5) * 3
        risk_score = min(base_score + stress_weight, 100)
        
        return {
            'risk_score': float(risk_score),
            'risk_level': self._determine_risk_level(risk_score),
            'contributing_factors': {factor: True for factor in risk_factors},
            'recommendations': ["Monitor student wellbeing and provide support"],
            'analysis_summary': "Rule-based burnout assessment generated.",
            'trend': 'stable',
            'confidence_level': 0.75
        }
    
    def _determine_risk_level(self, risk_score: float) -> str:
        if risk_score <= 30:
            return 'low'
        elif risk_score <= 60:
            return 'medium'
        elif risk_score <= 85:
            return 'high'
        else:
            return 'critical'
    
    def _create_safe_fallback_analysis(self, stress_level: int) -> Dict[str, Any]:
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

burnout_analyzer = BurnoutAnalyzer()
