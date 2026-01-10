"""
Azure Application Insights & Monitoring Service
Application telemetry, logging, and performance monitoring
"""

import logging
import time
from functools import wraps
from typing import Callable, Any
from datetime import datetime

from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace, metrics
from opencensus.ext.azure.log_exporter import AzureLogHandler

from config.azure_config import AzureConfig

logger = logging.getLogger(__name__)


class AzureMonitoringService:
    """Service for Azure Application Insights monitoring"""

    _initialized = False

    @classmethod
    def initialize(cls):
        """Initialize Azure monitoring and telemetry"""
        if cls._initialized:
            return

        if not AzureConfig.APP_INSIGHTS_ENABLED:
            logger.warning("⚠️ Application Insights is disabled")
            return

        try:
            # Configure Azure Monitor with OpenTelemetry
            configure_azure_monitor(
                connection_string=AzureConfig.APP_INSIGHTS_CONNECTION_STRING
            )

            # Add Azure Log Handler
            handler = AzureLogHandler(
                connection_string=AzureConfig.APP_INSIGHTS_CONNECTION_STRING
            )
            handler.setLevel(logging.INFO)
            logger.addHandler(handler)

            cls._initialized = True
            logger.info("✅ Azure Application Insights initialized successfully")

        except Exception as e:
            logger.error(f"❌ Failed to initialize Application Insights: {str(e)}")

    @staticmethod
    def track_event(event_name: str, properties: dict = None, measurements: dict = None):
        """
        Track custom event in Application Insights

        Args:
            event_name: Name of the event
            properties: Event properties dict
            measurements: Event measurements dict
        """
        try:
            if not AzureConfig.APP_INSIGHTS_ENABLED:
                return

            logger.info(
                f"📊 Event: {event_name}",
                extra={
                    "custom_dimensions": properties or {},
                    "custom_measurements": measurements or {}
                }
            )
        except Exception as e:
            logger.error(f"❌ Error tracking event: {str(e)}")

    @staticmethod
    def track_exception(exception: Exception, properties: dict = None):
        """
        Track exception in Application Insights

        Args:
            exception: The exception to track
            properties: Additional properties dict
        """
        try:
            if not AzureConfig.APP_INSIGHTS_ENABLED:
                return

            logger.exception(
                f"❌ Exception: {str(exception)}",
                extra={"custom_dimensions": properties or {}}
            )
        except Exception as e:
            logger.error(f"❌ Error tracking exception: {str(e)}")

    @staticmethod
    def track_request(
        request_name: str,
        duration_ms: float,
        success: bool,
        response_code: int = 200,
        properties: dict = None
    ):
        """
        Track HTTP request

        Args:
            request_name: Request name/path
            duration_ms: Duration in milliseconds
            success: Whether request was successful
            response_code: HTTP response code
            properties: Additional properties
        """
        try:
            if not AzureConfig.APP_INSIGHTS_ENABLED:
                return

            logger.info(
                f"📤 Request: {request_name}",
                extra={
                    "custom_dimensions": {
                        "response_code": response_code,
                        "success": success,
                        **(properties or {})
                    },
                    "custom_measurements": {"duration_ms": duration_ms}
                }
            )
        except Exception as e:
            logger.error(f"❌ Error tracking request: {str(e)}")

    @staticmethod
    def track_dependency(
        dependency_name: str,
        dependency_type: str,
        duration_ms: float,
        success: bool,
        properties: dict = None
    ):
        """
        Track dependency (DB, API call, etc.)

        Args:
            dependency_name: Name of the dependency
            dependency_type: Type (SQL, HTTP, etc.)
            duration_ms: Duration in milliseconds
            success: Whether call was successful
            properties: Additional properties
        """
        try:
            if not AzureConfig.APP_INSIGHTS_ENABLED:
                return

            logger.info(
                f"🔗 Dependency: {dependency_name}",
                extra={
                    "custom_dimensions": {
                        "dependency_type": dependency_type,
                        "success": success,
                        **(properties or {})
                    },
                    "custom_measurements": {"duration_ms": duration_ms}
                }
            )
        except Exception as e:
            logger.error(f"❌ Error tracking dependency: {str(e)}")


def monitor_performance(func: Callable) -> Callable:
    """
    Decorator to monitor function performance

    Usage:
        @monitor_performance
        async def my_function():
            pass
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs) -> Any:
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            AzureMonitoringService.track_event(
                f"function_call_{func.__name__}",
                properties={"status": "success"},
                measurements={"duration_ms": duration_ms}
            )
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            AzureMonitoringService.track_exception(
                e,
                properties={
                    "function": func.__name__,
                    "duration_ms": duration_ms
                }
            )
            raise

    @wraps(func)
    def sync_wrapper(*args, **kwargs) -> Any:
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            AzureMonitoringService.track_event(
                f"function_call_{func.__name__}",
                properties={"status": "success"},
                measurements={"duration_ms": duration_ms}
            )
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            AzureMonitoringService.track_exception(
                e,
                properties={
                    "function": func.__name__,
                    "duration_ms": duration_ms
                }
            )
            raise

    # Return appropriate wrapper based on function type
    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper


def log_database_operation(operation: str):
    """
    Decorator to log database operations

    Usage:
        @log_database_operation("create_user")
        async def create_user(user_data):
            pass
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                AzureMonitoringService.track_dependency(
                    operation,
                    "SQL",
                    duration_ms,
                    True
                )
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                AzureMonitoringService.track_dependency(
                    operation,
                    "SQL",
                    duration_ms,
                    False,
                    properties={"error": str(e)}
                )
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                AzureMonitoringService.track_dependency(
                    operation,
                    "SQL",
                    duration_ms,
                    True
                )
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                AzureMonitoringService.track_dependency(
                    operation,
                    "SQL",
                    duration_ms,
                    False,
                    properties={"error": str(e)}
                )
                raise

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator
