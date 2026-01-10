"""
Test Blob Storage Integration
Run this to verify Azure Blob Storage is working
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.azure_blob_service import AzureBlobStorageService
from config.azure_config import AzureConfig

async def main():
    print("\n" + "="*60)
    print("🧪 TESTING AZURE BLOB STORAGE")
    print("="*60)
    
    # Check configuration
    print("\n📋 Checking Configuration...")
    if not AzureConfig.STORAGE_CONNECTION_STRING:
        print("❌ AZURE_STORAGE_CONNECTION_STRING not set in .env")
        return False
    print("✅ Connection string found")
    
    try:
        service = AzureBlobStorageService()
        
        if not service.blob_client:
            print("❌ Failed to initialize Blob Storage client")
            return False
        print("✅ Blob Storage client initialized")
        
        # Test 1: Upload
        print("\n📤 Test 1: Uploading test file...")
        test_content = b"Hello from AlumUnity! This is a test file."
        file_url = await service.upload_file(
            file_name="test/hello_alumunity.txt",
            file_content=test_content,
            content_type="text/plain",
            metadata={"test": "true"}
        )
        
        if file_url:
            print(f"✅ Upload successful!")
            print(f"   📍 URL: {file_url}")
        else:
            print("❌ Upload failed")
            return False
        
        # Test 2: Download
        print("\n📥 Test 2: Downloading file...")
        downloaded = await service.download_file("test/hello_alumunity.txt")
        
        if downloaded and downloaded == test_content:
            print("✅ Download successful!")
            print(f"   📄 Content: {downloaded.decode()}")
        else:
            print("❌ Download failed or content mismatch")
            return False
        
        # Test 3: Get URL
        print("\n🔗 Test 3: Getting file URL...")
        url = await service.get_file_url("test/hello_alumunity.txt")
        if url:
            print(f"✅ URL retrieved: {url}")
        else:
            print("❌ Failed to get URL")
            return False
        
        # Test 4: Get file size
        print("\n📊 Test 4: Getting file size...")
        size = await service.get_file_size("test/hello_alumunity.txt")
        if size:
            print(f"✅ File size: {size} bytes")
        else:
            print("❌ Failed to get file size")
            return False
        
        # Test 5: List files
        print("\n📂 Test 5: Listing files...")
        files = await service.list_files("test/")
        if files:
            print(f"✅ Found {len(files)} file(s):")
            for f in files:
                print(f"   - {f}")
        else:
            print("❌ Failed to list files")
            return False
        
        # Test 6: Delete
        print("\n🗑️  Test 6: Deleting file...")
        deleted = await service.delete_file("test/hello_alumunity.txt")
        if deleted:
            print("✅ File deleted successfully")
        else:
            print("❌ Failed to delete file")
            return False
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED! Blob Storage is working!")
        print("="*60 + "\n")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
