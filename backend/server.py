"""
AlumUnity Backend Server
FastAPI application for Alumni Management System
"""
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import asyncio

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Check database configuration
print(f"--- Database Configuration:")
print(f"   DB_HOST: {os.getenv('DB_HOST', 'NOT SET')}")
print(f"   DB_PORT: {os.getenv('DB_PORT', 'NOT SET')}")
print(f"   DB_USER: {os.getenv('DB_USER', 'NOT SET')}")
print(f"   DB_NAME: {os.getenv('DB_NAME', 'NOT SET')}")
print(f"   USE_MOCK_DB: {os.getenv('USE_MOCK_DB', 'NOT SET')}")

# Import database connection
from database.connection import get_db_pool, close_db_pool, USE_MOCK_DB

# Import Phase 10.1 infrastructure
from redis_client import get_redis_client, close_redis_client
from storage import file_storage

# Import routes
from routes.auth import router as auth_router
from routes.profiles import router as profiles_router
from routes.admin import router as admin_router
from routes.jobs import router as jobs_router
from routes.applications import router as applications_router
from routes.recruiter import router as recruiter_router
from routes.mentorship import router as mentorship_router
from routes.events import router as events_router
from routes.forum import router as forum_router
from routes.notifications import router as notifications_router
from routes.privacy import router as privacy_router

# Import Phase 7 routes - Admin Dashboard & Analytics
from routes.admin_dashboard import router as admin_dashboard_router
from routes.analytics import router as analytics_router
from routes.admin_users import router as admin_users_router
from routes.admin_content import router as admin_content_router
from routes.admin_settings import router as admin_settings_router
from routes.admin_jobs import router as admin_jobs_router
from routes.admin_events import router as admin_events_router
from routes.admin_analytics import router as admin_analytics_router
from routes.admin_mentorship import router as admin_mentorship_router
from routes.admin_badges import router as admin_badges_router
from routes.admin_notifications import router as admin_notifications_router
from routes.admin_moderation import router as admin_moderation_router
from routes.admin_files import router as admin_files_router
from routes.admin_wrappers import router as admin_wrappers_router
from routes.admin_audit_logs import router as admin_audit_logs_router

# Import Phase 8 routes - Smart Algorithms & Matching
from routes.matching import router as matching_router
from routes.recommendations import router as recommendations_router
from routes.engagement import router as engagement_router

# Import Phase 9 routes - Innovative Features
from routes.capsules import router as capsules_router
from routes.aes import router as aes_router
from routes.skill_graph import router as skill_graph_router
# from routes.skill_recommendations import router as skill_recommendations_router  # Temporarily disabled - AI model download hangs
from routes.career_paths import router as career_router, career_paths_router
# from routes.career_predictions_router import router as career_predictions_router  # Temporarily disabled due to Python 3.13 compatibility
from routes.career_data_collection import router as career_data_collection_router
from routes.alumni_card import router as alumni_card_router
from routes.heatmap import router as heatmap_router

# Import wrapper routes for frontend compatibility
from routes.knowledge_routes import router as knowledge_router
from routes.messaging import router as messaging_router
# Use fallback skills routes to avoid AI model import issues
from routes.skills_fallback import router as skills_router
from routes.wrapper_routes import router as wrapper_router

# Import Phase 10.2 routes - Admin Dataset Upload
from routes.datasets import router as datasets_router

# Import Phase 10.7 routes - Knowledge Capsules Ranking Engine
from routes.capsule_ranking import router as capsule_ranking_router
from routes.capsule_ranking_wrapper import router as capsule_ranking_wrapper_router

# Import NEW wrapper routes for advanced features (Phase 10.8)
from routes.recommendations_wrapper import router as recommendations_wrapper_router
from routes.leaderboard_wrapper import router as leaderboard_wrapper_router
from routes.alumni_card import admin_router as alumni_card_admin_router

# Import middleware
from middleware.rate_limit import rate_limiter

# Get CORS origins from environment or use defaults
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')

# Background task for rate limiter cleanup
async def periodic_cleanup():
    """Periodic cleanup of rate limiter entries"""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            await rate_limiter.cleanup_old_entries()
        except Exception as e:
            logger.error(f"Rate limiter cleanup error: {str(e)}")

# Create FastAPI app
app = FastAPI(
    title="AlumUnity API",
    description="Alumni Management System API with AI Features",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    try:
        # Initialize database pool (or skip if mock mode)
        if USE_MOCK_DB:
            logger.info("🔄 Running in MOCK DATABASE mode - using in-memory mock data")
            logger.info("⚠️  Set USE_MOCK_DB=false in .env to use real MySQL database")
        else:
            await get_db_pool()
            logger.info("✅ Database connection pool initialized")
        
        # Initialize Redis (Phase 10.1)
        try:
            await get_redis_client()
            logger.info("✅ Redis connection established")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {str(e)} - Continuing without Redis")
        
        # Initialize file storage (Phase 10.1)
        logger.info(f"✅ File storage initialized ({file_storage.storage_type})")
        
        logger.info("🚀 AlumUnity API started successfully")
        logger.info("📋 Phase 10.1: Infrastructure Setup - Active")
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    try:
        await close_db_pool()
        logger.info("✅ Database connection pool closed")
        
        # Close Redis connection (Phase 10.1)
        try:
            await close_redis_client()
            logger.info("✅ Redis connection closed")
        except Exception as e:
            logger.warning(f"⚠️ Redis close warning: {str(e)}")
        
        logger.info("👋 AlumUnity API shutdown complete")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {str(e)}")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Root endpoint
@api_router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AlumUnity API",
        "version": "1.0.0",
        "status": "running"
    }

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint to verify server status"""
    try:
        if USE_MOCK_DB:
            return {
                "status": "healthy",
                "mode": "mock",
                "database": "mock-data",
                "service": "AlumUnity API"
            }
        
        pool = await get_db_pool()
        if pool is None:
            return {
                "status": "healthy",
                "mode": "mock-fallback",
                "database": "unavailable-using-mock",
                "service": "AlumUnity API"
            }
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT 1")
                await cursor.fetchone()
        return {
            "status": "healthy",
            "mode": "production",
            "database": "connected",
            "service": "AlumUnity API"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "degraded",
            "mode": "fallback",
            "database": "disconnected",
            "error": str(e),
            "service": "AlumUnity API"
        }, 503

# Include authentication routes
app.include_router(auth_router)

# Include profile routes (Phase 2)
app.include_router(profiles_router)

# Include admin routes (Phase 2)
app.include_router(admin_router)

# Include job routes (Phase 3)
app.include_router(jobs_router)

# Include application routes (Phase 3)
app.include_router(applications_router)

# Include recruiter dashboard routes (Phase 3)
app.include_router(recruiter_router)

# Include mentorship routes (Phase 4)
app.include_router(mentorship_router)

# Include event routes (Phase 5)
app.include_router(events_router)

# Include forum routes (Phase 5)
app.include_router(forum_router)

# Include notification routes (Phase 6)
app.include_router(notifications_router)

# Include privacy settings routes
app.include_router(privacy_router)

# Include Phase 7 routes - Admin Dashboard & Analytics
app.include_router(admin_dashboard_router)
app.include_router(analytics_router)
app.include_router(admin_users_router)
app.include_router(admin_content_router)
app.include_router(admin_settings_router)
app.include_router(admin_jobs_router)
app.include_router(admin_events_router)
app.include_router(admin_analytics_router)
app.include_router(admin_mentorship_router)
app.include_router(admin_badges_router)
app.include_router(admin_notifications_router)
app.include_router(admin_moderation_router)
app.include_router(admin_files_router)
app.include_router(admin_audit_logs_router)
app.include_router(admin_wrappers_router)

# Include Phase 8 routes - Smart Algorithms & Recommendations
app.include_router(matching_router)
app.include_router(recommendations_router)
app.include_router(engagement_router)

# Include Phase 9 routes - Innovative Features
app.include_router(capsules_router)
app.include_router(aes_router)
app.include_router(skill_graph_router)
# app.include_router(skill_recommendations_router)  # Temporarily disabled - AI model download hangs
app.include_router(career_router)
# app.include_router(career_predictions_router)  # Temporarily disabled due to Python 3.13 compatibility
app.include_router(career_data_collection_router)
app.include_router(alumni_card_router)
app.include_router(heatmap_router)

# Include wrapper routes for frontend compatibility
app.include_router(knowledge_router)
app.include_router(messaging_router)
app.include_router(skills_router)
app.include_router(wrapper_router)
app.include_router(career_paths_router)

# Include Phase 10.2 routes - Admin Dataset Upload
app.include_router(datasets_router)

# Include Phase 10.7 routes - Knowledge Capsules Ranking Engine
app.include_router(capsule_ranking_router)
app.include_router(capsule_ranking_wrapper_router)

# Include Phase 10.8 routes - Advanced Features Wrapper Routes
app.include_router(recommendations_wrapper_router)
app.include_router(leaderboard_wrapper_router)
app.include_router(alumni_card_admin_router)

# Include API router in main app
app.include_router(api_router)

# Add CORS middleware
# cors_origins = ["*"]  # Allow all origins for development
logger.info(f"🌐 CORS Origins configured: {CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
            
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
