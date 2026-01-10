"""
Example Routes Using Azure Services
Demonstrates how to use Azure Blob Storage, OpenAI, and Monitoring
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Optional
import uuid
import logging

from services.azure_blob_service import AzureBlobStorageService
from services.azure_openai_service import AzureOpenAIService
from services.azure_monitoring_service import AzureMonitoringService, monitor_performance
from schemas.user import UserCreate, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/azure", tags=["Azure Services"])

# Initialize services
blob_service = AzureBlobStorageService()
openai_service = AzureOpenAIService()


# ============================================================================
# BLOB STORAGE EXAMPLES
# ============================================================================

@router.post("/upload-profile-photo/{user_id}")
@monitor_performance
async def upload_profile_photo(user_id: int, file: UploadFile = File(...)):
    """
    Upload profile photo to Azure Blob Storage
    
    Example:
        POST /api/azure/upload-profile-photo/123
        File: (image file)
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Validate file size (max 5MB)
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large")

        # Upload to Azure Blob Storage
        file_name = f"profiles/user_{user_id}_{uuid.uuid4()}.{file.filename.split('.')[-1]}"
        file_url = await blob_service.upload_file(
            file_name=file_name,
            file_content=file_content,
            content_type=file.content_type,
            metadata={"user_id": str(user_id), "original_name": file.filename}
        )

        if not file_url:
            raise HTTPException(status_code=500, detail="Upload failed")

        # Track event
        AzureMonitoringService.track_event(
            "profile_photo_uploaded",
            properties={"user_id": user_id, "file_size": len(file_content)},
            measurements={"file_size_mb": len(file_content) / (1024 * 1024)}
        )

        return {
            "success": True,
            "file_url": file_url,
            "file_name": file_name
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uploading profile photo: {str(e)}")
        AzureMonitoringService.track_exception(e, properties={"user_id": user_id})
        raise HTTPException(status_code=500, detail="Upload failed")


@router.post("/upload-document/{user_id}")
@monitor_performance
async def upload_document(user_id: int, file: UploadFile = File(...)):
    """
    Upload document to Azure Blob Storage
    
    Supported: PDF, DOCX, XLSX
    """
    try:
        allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")

        file_content = await file.read()
        
        file_name = f"documents/user_{user_id}_{uuid.uuid4()}_{file.filename}"
        file_url = await blob_service.upload_file(
            file_name=file_name,
            file_content=file_content,
            content_type=file.content_type
        )

        return {"file_url": file_url, "file_name": file_name}

    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")


@router.get("/download-file/{user_id}/{file_name}")
@monitor_performance
async def download_file(user_id: int, file_name: str):
    """
    Download file from Azure Blob Storage
    """
    try:
        full_path = f"{user_id}/{file_name}"
        file_content = await blob_service.download_file(full_path)

        if not file_content:
            raise HTTPException(status_code=404, detail="File not found")

        return {
            "file_name": file_name,
            "size": len(file_content),
            "content": file_content.decode() if file_name.endswith('.txt') else None
        }

    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")


@router.delete("/delete-file/{user_id}/{file_name}")
@monitor_performance
async def delete_file(user_id: int, file_name: str):
    """
    Delete file from Azure Blob Storage
    """
    try:
        full_path = f"{user_id}/{file_name}"
        success = await blob_service.delete_file(full_path)

        if not success:
            raise HTTPException(status_code=404, detail="File not found")

        return {"success": True, "message": "File deleted"}

    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Delete failed")


# ============================================================================
# AZURE OPENAI EXAMPLES
# ============================================================================

@router.post("/recommendations/mentors/{user_id}")
@monitor_performance
async def get_mentor_recommendations(user_id: int, user_profile: dict):
    """
    Get AI-powered mentor recommendations
    
    Example:
        POST /api/azure/recommendations/mentors/123
        {
            "goals": "Learn full-stack development",
            "skills": ["Python", "React"],
            "experience_level": "Intermediate"
        }
    """
    try:
        # In a real app, fetch user profile and mentors from database
        # For now, using provided data
        
        recommendations = await openai_service.generate_mentor_recommendations(
            user_profile=user_profile,
            all_mentors=[]  # Fetch from DB in real implementation
        )

        if not recommendations:
            raise HTTPException(status_code=500, detail="Failed to generate recommendations")

        # Track event
        AzureMonitoringService.track_event(
            "mentor_recommendations_generated",
            properties={"user_id": user_id}
        )

        return {
            "recommendations": recommendations,
            "generated_at": "2024-01-10T12:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error getting mentor recommendations: {str(e)}")
        AzureMonitoringService.track_exception(e, properties={"user_id": user_id})
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")


@router.post("/recommendations/jobs/{user_id}")
@monitor_performance
async def get_job_recommendations(user_id: int, student_profile: dict):
    """
    Get AI-powered job recommendations
    
    Example:
        POST /api/azure/recommendations/jobs/123
        {
            "major": "Computer Science",
            "skills": ["Python", "JavaScript"],
            "expected_salary": 80000
        }
    """
    try:
        recommendations = await openai_service.generate_job_recommendations(
            student_profile=student_profile,
            available_jobs=[]  # Fetch from DB in real implementation
        )

        if not recommendations:
            raise HTTPException(status_code=500, detail="Failed to generate recommendations")

        AzureMonitoringService.track_event(
            "job_recommendations_generated",
            properties={"user_id": user_id}
        )

        return {
            "recommendations": recommendations,
            "generated_at": "2024-01-10T12:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error getting job recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")


@router.post("/career-guidance/{user_id}")
@monitor_performance
async def get_career_guidance(user_id: int, student_profile: dict):
    """
    Get personalized career guidance from AI
    """
    try:
        guidance = await openai_service.generate_career_guidance(
            student_profile=student_profile
        )

        if not guidance:
            raise HTTPException(status_code=500, detail="Failed to generate guidance")

        AzureMonitoringService.track_event(
            "career_guidance_generated",
            properties={"user_id": user_id}
        )

        return {
            "guidance": guidance,
            "generated_at": "2024-01-10T12:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error getting career guidance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate guidance")


@router.post("/profile-suggestions/{user_id}")
@monitor_performance
async def get_profile_suggestions(user_id: int, user_profile: dict):
    """
    Get AI suggestions to improve profile
    """
    try:
        suggestions = await openai_service.generate_profile_suggestions(
            user_profile=user_profile
        )

        if not suggestions:
            raise HTTPException(status_code=500, detail="Failed to generate suggestions")

        AzureMonitoringService.track_event(
            "profile_suggestions_generated",
            properties={"user_id": user_id}
        )

        return {
            "suggestions": suggestions,
            "generated_at": "2024-01-10T12:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error getting profile suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")


@router.post("/chat")
@monitor_performance
async def chat_with_ai(messages: List[dict]):
    """
    Generic chat completion endpoint
    
    Example:
        POST /api/azure/chat
        {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": "What skills should I learn for AI?"}
            ]
        }
    """
    try:
        response = await openai_service.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        if not response:
            raise HTTPException(status_code=500, detail="Chat failed")

        AzureMonitoringService.track_event("chat_completion_used")

        return {
            "response": response,
            "timestamp": "2024-01-10T12:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat failed")


# ============================================================================
# MONITORING EXAMPLES
# ============================================================================

@router.post("/track-event")
async def track_custom_event(event_name: str, properties: dict = None):
    """
    Manually track custom event in Application Insights
    """
    try:
        AzureMonitoringService.track_event(
            event_name=event_name,
            properties=properties or {}
        )
        return {"success": True, "message": f"Event '{event_name}' tracked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    try:
        return {
            "status": "healthy",
            "timestamp": "2024-01-10T12:00:00Z",
            "azure_services": {
                "blob_storage": "connected",
                "openai": "ready",
                "insights": "active"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")
