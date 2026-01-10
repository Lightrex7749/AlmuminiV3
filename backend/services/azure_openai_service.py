"""
Azure OpenAI Service
AI-powered features using Azure OpenAI Service
"""

import logging
import json
from typing import Optional, List

from azure.core.exceptions import AzureError
from openai import AzureOpenAI, APIError

from config.azure_config import AzureServiceFactory, AzureConfig

logger = logging.getLogger(__name__)


class AzureOpenAIService:
    """Service for AI operations using Azure OpenAI"""

    def __init__(self):
        self.client = AzureServiceFactory.get_openai_client()
        self.deployment_name = AzureConfig.OPENAI_DEPLOYMENT_NAME

    async def generate_mentor_recommendations(
        self,
        user_profile: dict,
        all_mentors: List[dict]
    ) -> Optional[str]:
        """
        Generate mentor recommendations using Azure OpenAI

        Args:
            user_profile: Student profile data
            all_mentors: List of available mentors

        Returns:
            JSON string with recommendations or None if failed
        """
        try:
            if not self.client:
                logger.error("❌ Azure OpenAI client not initialized")
                return None

            prompt = f"""
            You are an expert mentor matching AI. Based on the following student profile, 
            recommend the top 5 ideal mentors from the provided list.

            STUDENT PROFILE:
            - Name: {user_profile.get('name', 'Unknown')}
            - Goals: {user_profile.get('goals', 'Not specified')}
            - Skills: {', '.join(user_profile.get('skills', []))}
            - Experience Level: {user_profile.get('experience_level', 'Beginner')}
            - Interests: {', '.join(user_profile.get('interests', []))}

            AVAILABLE MENTORS:
            {json.dumps(all_mentors[:20], indent=2)}

            Provide recommendations in JSON format:
            {{
                "recommendations": [
                    {{"mentor_id": int, "name": str, "match_score": float, "reason": str}}
                ]
            }}
            """

            response = self.client.chat.completions.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": "You are an expert mentor matching AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            result = response.choices[0].message.content
            logger.info("✅ Generated mentor recommendations successfully")
            return result

        except APIError as e:
            logger.error(f"❌ OpenAI API error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Error generating mentor recommendations: {str(e)}")
            return None

    async def generate_job_recommendations(
        self,
        student_profile: dict,
        available_jobs: List[dict]
    ) -> Optional[str]:
        """
        Generate job recommendations using Azure OpenAI

        Args:
            student_profile: Student profile data
            available_jobs: List of available jobs

        Returns:
            JSON string with recommendations or None if failed
        """
        try:
            if not self.client:
                logger.error("❌ Azure OpenAI client not initialized")
                return None

            prompt = f"""
            You are a career advisor AI. Based on the following student profile,
            recommend the top 5 ideal job opportunities from the provided list.

            STUDENT PROFILE:
            - Name: {student_profile.get('name', 'Unknown')}
            - Major: {student_profile.get('major', 'Unknown')}
            - Skills: {', '.join(student_profile.get('skills', []))}
            - Expected Salary: ${student_profile.get('expected_salary', 'Flexible')}
            - Location Preference: {student_profile.get('location', 'Any')}
            - Work Type: {student_profile.get('work_type', 'Any')}

            AVAILABLE JOBS:
            {json.dumps(available_jobs[:20], indent=2)}

            Provide recommendations in JSON format:
            {{
                "recommendations": [
                    {{"job_id": int, "title": str, "company": str, "match_score": float, "reason": str}}
                ]
            }}
            """

            response = self.client.chat.completions.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": "You are a career advisor AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            result = response.choices[0].message.content
            logger.info("✅ Generated job recommendations successfully")
            return result

        except APIError as e:
            logger.error(f"❌ OpenAI API error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Error generating job recommendations: {str(e)}")
            return None

    async def generate_career_guidance(self, student_profile: dict) -> Optional[str]:
        """
        Generate personalized career guidance

        Args:
            student_profile: Student profile data

        Returns:
            Career guidance text or None if failed
        """
        try:
            if not self.client:
                logger.error("❌ Azure OpenAI client not initialized")
                return None

            prompt = f"""
            You are a career counselor. Provide personalized career guidance for this student:

            STUDENT PROFILE:
            - Name: {student_profile.get('name', 'Unknown')}
            - Major: {student_profile.get('major', 'Unknown')}
            - Skills: {', '.join(student_profile.get('skills', []))}
            - Goals: {student_profile.get('goals', 'Not specified')}
            - Experience: {student_profile.get('experience', 'None')}

            Provide:
            1. Career path recommendations
            2. Skills to develop
            3. Immediate next steps
            4. Resources to explore
            """

            response = self.client.chat.completions.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": "You are a career counselor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=1500
            )

            result = response.choices[0].message.content
            logger.info("✅ Generated career guidance successfully")
            return result

        except Exception as e:
            logger.error(f"❌ Error generating career guidance: {str(e)}")
            return None

    async def generate_profile_suggestions(self, user_profile: dict) -> Optional[str]:
        """
        Generate suggestions to improve user profile

        Args:
            user_profile: Current user profile data

        Returns:
            Improvement suggestions or None if failed
        """
        try:
            if not self.client:
                logger.error("❌ Azure OpenAI client not initialized")
                return None

            prompt = f"""
            You are a professional profile optimizer. Analyze this profile and suggest improvements:

            CURRENT PROFILE:
            {json.dumps(user_profile, indent=2)}

            Provide specific, actionable suggestions to:
            1. Improve completeness
            2. Enhance visibility
            3. Better communicate skills
            4. Increase engagement potential
            """

            response = self.client.chat.completions.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": "You are a professional profile optimizer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            result = response.choices[0].message.content
            logger.info("✅ Generated profile suggestions successfully")
            return result

        except Exception as e:
            logger.error(f"❌ Error generating profile suggestions: {str(e)}")
            return None

    async def chat_completion(
        self,
        messages: List[dict],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Optional[str]:
        """
        Generic chat completion endpoint

        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Temperature for response generation
            max_tokens: Maximum tokens in response

        Returns:
            Response text or None if failed
        """
        try:
            if not self.client:
                logger.error("❌ Azure OpenAI client not initialized")
                return None

            response = self.client.chat.completions.create(
                engine=self.deployment_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            result = response.choices[0].message.content
            logger.info("✅ Chat completion successful")
            return result

        except Exception as e:
            logger.error(f"❌ Error in chat completion: {str(e)}")
            return None
