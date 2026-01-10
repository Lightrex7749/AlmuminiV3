"""
End-to-End Demo: Phase 3 (Blob Storage) + Phase 5 (Application Insights)

This script demonstrates how file uploads with monitoring work together:
1. User uploads a file
2. File is stored in Azure Blob Storage
3. Event is tracked in Application Insights
4. Download link is returned to user
5. All metrics visible in Azure monitoring dashboard

Run this to see the complete workflow
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.azure_blob_service import AzureBlobStorageService
from services.azure_monitoring_service import AzureMonitoringService
from config.azure_config import AzureConfig

async def demo_file_upload_with_monitoring():
    """
    Demo: Upload file to blob storage and track in monitoring
    """
    print("\n" + "="*70)
    print("🎬 PHASE 3 & 5 DEMO: File Upload + Monitoring")
    print("="*70)
    
    # Check prerequisites
    print("\n✅ Prerequisites Check:")
    print(f"   Blob Storage Enabled: {AzureConfig.BLOB_STORAGE_ENABLED}")
    print(f"   Monitoring Enabled: {AzureConfig.APP_INSIGHTS_ENABLED}")
    
    if not AzureConfig.BLOB_STORAGE_ENABLED:
        print("\n❌ Blob Storage not configured. Set these in .env:")
        print("   BLOB_STORAGE_ENABLED=true")
        print("   AZURE_STORAGE_ACCOUNT_NAME=your-account-name")
        print("   AZURE_STORAGE_CONTAINER_NAME=alumunity")
        print("   AZURE_STORAGE_ACCOUNT_KEY=your-key")
        return False
    
    try:
        # Initialize monitoring
        print("\n📊 Initializing monitoring...")
        AzureMonitoringService.initialize()
        print("   ✅ Monitoring ready")
        
        # Create a test file
        print("\n📝 Creating test file...")
        test_file_path = "demo_test_file.txt"
        test_content = "This is a demo file for Azure Blob Storage integration.\nUploaded at: " + str(__import__('datetime').datetime.now())
        
        with open(test_file_path, 'w') as f:
            f.write(test_content)
        print(f"   ✅ Created {test_file_path} ({len(test_content)} bytes)")
        
        # Upload to blob storage
        print("\n📤 Uploading to Azure Blob Storage...")
        file_blob_name = "demo/test_upload.txt"
        
        with open(test_file_path, 'rb') as file:
            await AzureBlobStorageService.upload_file(
                file_content=file.read(),
                blob_name=file_blob_name,
                content_type="text/plain",
                metadata={
                    "demo": "true",
                    "environment": "development"
                }
            )
        print(f"   ✅ Uploaded as '{file_blob_name}'")
        
        # Track event in monitoring
        print("\n📊 Tracking upload event in Application Insights...")
        AzureMonitoringService.track_event(
            event_name="file_uploaded",
            properties={
                "file_name": file_blob_name,
                "file_type": "text/plain",
                "source": "demo",
                "status": "success"
            },
            measurements={
                "file_size_bytes": len(test_content),
                "upload_timestamp": __import__('time').time()
            }
        )
        print("   ✅ Upload event tracked")
        
        # Get file URL
        print("\n🔗 Getting file download URL...")
        file_url = await AzureBlobStorageService.get_file_url(file_blob_name)
        print(f"   ✅ URL: {file_url}")
        
        # List files in blob
        print("\n📋 Listing uploaded files...")
        files = await AzureBlobStorageService.list_files("demo")
        print(f"   ✅ Found {len(files)} files in 'demo' folder")
        for file_info in files:
            print(f"      - {file_info['name']} ({file_info['size']} bytes)")
        
        # Track request performance
        print("\n⏱️  Tracking request performance...")
        AzureMonitoringService.track_request(
            request_name="POST /api/upload-demo",
            duration_ms=250.5,
            success=True,
            response_code=200,
            properties={
                "file_uploaded": file_blob_name,
                "operation": "demo"
            }
        )
        print("   ✅ Performance metrics tracked")
        
        # Cleanup
        print("\n🧹 Cleaning up test file...")
        await AzureBlobStorageService.delete_file(file_blob_name)
        print(f"   ✅ Deleted '{file_blob_name}'")
        
        # Track cleanup event
        AzureMonitoringService.track_event(
            event_name="file_deleted",
            properties={
                "file_name": file_blob_name,
                "reason": "demo_cleanup"
            }
        )
        
        # Remove local test file
        os.remove(test_file_path)
        print(f"   ✅ Removed local {test_file_path}")
        
        # Summary
        print("\n" + "="*70)
        print("✅ DEMO COMPLETE!")
        print("="*70)
        print("\n📊 WHAT HAPPENED:")
        print("   1. ✅ Created test file")
        print("   2. ✅ Uploaded to Azure Blob Storage")
        print("   3. ✅ Tracked upload event in Application Insights")
        print("   4. ✅ Retrieved download URL")
        print("   5. ✅ Listed files in blob")
        print("   6. ✅ Tracked request metrics")
        print("   7. ✅ Deleted file and tracked cleanup")
        
        print("\n👀 CHECK YOUR AZURE PORTAL:")
        print("   1. Application Insights: Check 'Logs' for events")
        print("      - Event: 'file_uploaded'")
        print("      - Event: 'file_deleted'")
        print("      - Request: 'POST /api/upload-demo'")
        print("   2. Storage Account: Blob Storage (should be empty after cleanup)")
        
        print("\n🚀 NEXT STEPS:")
        print("   1. Integrate upload endpoint into backend/routes/")
        print("   2. Use AzureBlobStorageService in your user profile routes")
        print("   3. Monitor metrics in Azure Portal dashboard")
        print("   4. Share dashboard with Imagine Cup judges!")
        
        print("\n" + "="*70 + "\n")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check your Azure credentials are correct")
        print("2. Verify storage account exists and is accessible")
        print("3. Check connection strings in .env file")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(demo_file_upload_with_monitoring())
    sys.exit(0 if success else 1)
