"""Database connection management"""
import aiomysql
import pymysql
import os
from typing import Optional
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables immediately
load_dotenv(Path(__file__).parent.parent / '.env')

logger = logging.getLogger(__name__)

db_pool: Optional[aiomysql.Pool] = None
USE_MOCK_DB = os.environ.get('USE_MOCK_DB', 'false').lower() == 'true'
_db_connection_attempted = False
_auto_mock_mode = False


async def get_db_pool() -> Optional[aiomysql.Pool]:
    """Get or create database connection pool with automatic fallback to mock mode"""
    global db_pool, USE_MOCK_DB, _db_connection_attempted, _auto_mock_mode
    
    # If explicitly set to mock mode in .env
    if USE_MOCK_DB and not _auto_mock_mode:
        logger.info("🔄 Using mock database mode (USE_MOCK_DB=true in .env)")
        return None
    
    # If auto mock mode was triggered previously
    if _auto_mock_mode:
        return None
        
    if db_pool is None and not _db_connection_attempted:
        _db_connection_attempted = True
        try:
            db_pool = await aiomysql.create_pool(
                host=os.environ.get('DB_HOST', 'localhost'),
                port=int(os.environ.get('DB_PORT', 3306)),
                user=os.environ.get('DB_USER', 'alumni_user'),
                password=os.environ.get('DB_PASSWORD', 'alumni_pass_123'),
                db=os.environ.get('DB_NAME', 'AlumUnity'),
                charset='utf8mb4',
                autocommit=False,
                minsize=1,
                maxsize=10,
                connect_timeout=10
            )
            logger.info("✅ Database connection pool created successfully")
            USE_MOCK_DB = False
            _auto_mock_mode = False
        except Exception as e:
            logger.warning(f"⚠️ Database connection failed: {str(e)}")
            logger.info("🔄 Automatically switching to MOCK MODE")
            USE_MOCK_DB = True
            _auto_mock_mode = True
            db_pool = None
            return None
    
    # Check if pool connection is still alive, reconnect if needed
    if db_pool is not None:
        try:
            async with db_pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute("SELECT 1")
                    await cursor.fetchone()
        except Exception as e:
            logger.warning(f"⚠️ Database connection lost: {str(e)}")
            logger.info("🔄 Reconnecting to database...")
            # Reset and try to reconnect
            _db_connection_attempted = False
            if db_pool:
                try:
                    db_pool.close()
                    await db_pool.wait_closed()
                except:
                    pass
            db_pool = None
            return await get_db_pool()
    
    return db_pool


async def close_db_pool():
    """Close database connection pool"""
    global db_pool
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()
        db_pool = None
        logger.info("Database connection pool closed")


async def get_db_connection():
    """Get database connection from pool (context manager) - FOR ASYNC USE ONLY"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        yield conn


def get_sync_db_connection():
    """Get synchronous database connection - FOR SYNC ROUTES"""
    try:
        connection = pymysql.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            port=int(os.environ.get('DB_PORT', 3306)),
            user=os.environ.get('DB_USER', 'alumni_user'),
            password=os.environ.get('DB_PASSWORD', 'alumni_pass_123'),
            database=os.environ.get('DB_NAME', 'AlumUnity'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Exception as e:
        logger.error(f"Failed to create sync database connection: {str(e)}")
        raise
