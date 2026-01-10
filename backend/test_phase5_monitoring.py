"""
Test Application Insights Monitoring
Run this to verify Azure Application Insights is working
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.azure_monitoring_service import AzureMonitoringService
from config.azure_config import AzureConfig

def main():
    print("\n" + "="*60)
    print("🧪 TESTING AZURE APPLICATION INSIGHTS")
    print("="*60)
    
    # Check configuration
    print("\n📋 Checking Configuration...")
    if not AzureConfig.APP_INSIGHTS_ENABLED:
        print("⚠️  Application Insights is disabled in config")
    
    if not AzureConfig.APP_INSIGHTS_CONNECTION_STRING:
        print("❌ APPLICATIONINSIGHTS_CONNECTION_STRING not set in .env")
        return False
    
    print("✅ Connection string found")
    
    try:
        # Initialize monitoring
        AzureMonitoringService.initialize()
        print("✅ Monitoring service initialized")
        
        # Test 1: Track event
        print("\n📊 Test 1: Tracking custom event...")
        AzureMonitoringService.track_event(
            event_name="alumunity_test_event",
            properties={
                "user_type": "student",
                "action": "test_tracking",
                "environment": "development"
            },
            measurements={
                "test_duration_ms": 123.45,
                "score": 95
            }
        )
        print("✅ Event tracked successfully")
        
        # Test 2: Track request
        print("\n📤 Test 2: Tracking HTTP request...")
        AzureMonitoringService.track_request(
            request_name="GET /api/test",
            duration_ms=234.56,
            success=True,
            response_code=200,
            properties={"endpoint": "/api/test"}
        )
        print("✅ Request tracked successfully")
        
        # Test 3: Track dependency
        print("\n🔗 Test 3: Tracking dependency call...")
        AzureMonitoringService.track_dependency(
            dependency_name="database_query",
            dependency_type="SQL",
            duration_ms=456.78,
            success=True,
            properties={"table": "users", "operation": "SELECT"}
        )
        print("✅ Dependency tracked successfully")
        
        # Test 4: Track exception
        print("\n⚠️  Test 4: Tracking exception...")
        try:
            # Intentionally cause an error
            result = 10 / 0
        except ZeroDivisionError as e:
            AzureMonitoringService.track_exception(
                e,
                properties={
                    "context": "division_test",
                    "numerator": 10
                }
            )
            print("✅ Exception tracked successfully")
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED! Application Insights is working!")
        print("="*60)
        print("\n📊 IMPORTANT: Check Azure Portal for events")
        print("   1. Go to https://portal.azure.com")
        print("   2. Find 'alumunity-insights' Application Insights")
        print("   3. Click 'Logs'")
        print("   4. Events should appear within 1-2 minutes")
        print("="*60 + "\n")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check your connection string is correct")
        print("2. Verify APPLICATIONINSIGHTS_ENABLED=true in .env")
        print("3. Make sure Application Insights resource exists in Azure")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
