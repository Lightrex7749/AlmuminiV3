"""
Startup script for safe server initialization with fallback modes
Handles database and Redis connection failures gracefully
"""
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_environment():
    """Check if required environment variables are set"""
    required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    missing = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        logger.warning(f"⚠️  Missing environment variables: {missing}")
        logger.warning("💡 Setting USE_MOCK_DB=true for development mode")
        os.environ['USE_MOCK_DB'] = 'true'
    return len(missing) == 0

def check_redis():
    """Check if Redis is available"""
    import socket
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((redis_host, redis_port))
        sock.close()
        if result == 0:
            logger.info(f"✅ Redis is available at {redis_host}:{redis_port}")
            return True
        else:
            logger.warning(f"⚠️  Redis not available at {redis_host}:{redis_port}")
            return False
    except Exception as e:
        logger.warning(f"⚠️  Could not check Redis: {e}")
        return False

def check_database():
    """Check if database is available"""
    import pymysql
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'alumni_user'),
            password=os.getenv('DB_PASSWORD', 'alumni_pass_123'),
            db=os.getenv('DB_NAME', 'AlumUnity'),
            charset='utf8mb4',
            connect_timeout=5
        )
        conn.close()
        logger.info("✅ Database is available")
        return True
    except Exception as e:
        logger.warning(f"⚠️  Database not available: {e}")
        logger.warning("💡 Server will use mock database mode")
        return False

def startup():
    """Run all startup checks"""
    logger.info("🚀 Starting AlumUnity Backend Server...")
    logger.info("=" * 60)
    
    # Check environment
    env_ok = check_environment()
    
    # Check database (optional - has fallback)
    db_ok = check_database()
    
    # Check Redis (optional - has fallback)
    redis_ok = check_redis()
    
    logger.info("=" * 60)
    
    if not db_ok or not redis_ok:
        logger.info("⚠️  Some services are not available, but server will start in fallback mode")
    
    logger.info("✅ Server is ready to start!")
    return True

if __name__ == "__main__":
    startup()
