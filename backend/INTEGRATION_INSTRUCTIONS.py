"""
Integration: Add this to your backend/server.py
This enables Azure Blob Storage and Application Insights
"""

# Add these imports at the top of server.py:
from services.azure_blob_service import AzureBlobStorageService
from services.azure_monitoring_service import AzureMonitoringService, initialize_azure_monitoring
from config.azure_config import AzureConfig
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize Azure monitoring on startup
initialize_azure_monitoring()

# Add this middleware to your FastAPI app after app = FastAPI():
@app.middleware("http")
async def track_requests(request: Request, call_next):
    """Track all HTTP requests in Application Insights"""
    import time
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000
        
        AzureMonitoringService.track_request(
            request_name=f"{request.method} {request.url.path}",
            duration_ms=duration,
            success=response.status_code < 400,
            response_code=response.status_code
        )
        
        return response
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        AzureMonitoringService.track_exception(e, properties={
            "path": request.url.path,
            "method": request.method,
            "duration_ms": duration
        })
        raise

# Add this startup event:
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 AlumUnity Backend Starting...")
    logger.info(f"🔷 Environment: {AzureConfig.ENVIRONMENT}")
    logger.info(f"💾 Database: {AzureConfig.DB_HOST}")
    
    if AzureConfig.APP_INSIGHTS_ENABLED:
        logger.info("📊 Application Insights: ENABLED")
    
    # Test blob storage connection
    blob_service = AzureBlobStorageService()
    if blob_service.blob_client:
        logger.info("💾 Blob Storage: CONNECTED")
    else:
        logger.warning("⚠️  Blob Storage: NOT CONFIGURED")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    logger.info("🛑 AlumUnity Backend Shutting Down...")
