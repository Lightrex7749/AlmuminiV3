# Phase 3 & 5 Integration Guide: Add Blob Storage + Monitoring to Your Backend

This guide shows how to integrate the Azure Blob Storage and Application Insights services into your existing FastAPI `server.py`.

## 📋 Quick Overview

**Phase 3: Azure Blob Storage**
- Replace AWS S3 with Azure Blob Storage for file uploads
- Users can upload profile photos, documents, resumes
- Files stored securely in Azure cloud

**Phase 5: Application Insights**
- Real-time application monitoring and metrics
- Track user actions, performance, errors
- Beautiful Azure Portal dashboard for analysis

**Combined benefit**: Enterprise-grade cloud infrastructure for your Imagine Cup submission

---

## 🔧 Integration Steps

### Step 1: Add Imports to `server.py`

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from services.azure_blob_service import AzureBlobStorageService
from services.azure_monitoring_service import AzureMonitoringService
from config.azure_config import AzureConfig

app = FastAPI()

# Initialize monitoring at startup
@app.on_event("startup")
async def startup_event():
    if AzureConfig.APP_INSIGHTS_ENABLED:
        AzureMonitoringService.initialize()
        print("✅ Application Insights monitoring initialized")
    print("✅ Server started successfully")
```

### Step 2: Add File Upload Endpoint

Replace or supplement your current S3 upload endpoint:

```python
@app.post("/api/upload-profile-photo/{user_id}")
async def upload_profile_photo(user_id: str, file: UploadFile = File(...)):
    """
    Upload user profile photo to Azure Blob Storage
    
    Example:
        curl -X POST \
          -F "file=@photo.jpg" \
          http://localhost:8000/api/upload-profile-photo/user123
    """
    try:
        # Validate file
        allowed_types = ["image/jpeg", "image/png", "image/gif"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Read file content
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=413, detail="File too large")
        
        # Create blob name
        blob_name = f"user-profiles/{user_id}/{file.filename}"
        
        # Upload to Azure
        await AzureBlobStorageService.upload_file(
            file_content=content,
            blob_name=blob_name,
            content_type=file.content_type,
            metadata={
                "user_id": user_id,
                "upload_type": "profile_photo"
            }
        )
        
        # Track event
        AzureMonitoringService.track_event(
            event_name="profile_photo_uploaded",
            properties={
                "user_id": user_id,
                "file_name": file.filename,
                "file_type": file.content_type
            },
            measurements={
                "file_size_bytes": len(content)
            }
        )
        
        # Get download URL
        file_url = await AzureBlobStorageService.get_file_url(blob_name)
        
        return {
            "status": "success",
            "message": "Profile photo uploaded",
            "file_url": file_url,
            "file_name": file.filename
        }
        
    except Exception as e:
        # Track error
        AzureMonitoringService.track_exception(
            e,
            properties={
                "endpoint": "/api/upload-profile-photo",
                "user_id": user_id
            }
        )
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 3: Add File Download Endpoint

```python
@app.get("/api/download-file/{user_id}/{file_name}")
async def download_file(user_id: str, file_name: str):
    """
    Get download URL for user file
    
    Example:
        GET http://localhost:8000/api/download-file/user123/photo.jpg
    """
    try:
        blob_name = f"user-profiles/{user_id}/{file_name}"
        
        # Get file URL
        file_url = await AzureBlobStorageService.get_file_url(blob_name)
        
        # Track event
        AzureMonitoringService.track_event(
            event_name="file_downloaded",
            properties={
                "user_id": user_id,
                "file_name": file_name
            }
        )
        
        return {
            "status": "success",
            "download_url": file_url,
            "file_name": file_name
        }
        
    except Exception as e:
        AzureMonitoringService.track_exception(
            e,
            properties={
                "endpoint": "/api/download-file",
                "user_id": user_id,
                "file_name": file_name
            }
        )
        raise HTTPException(status_code=404, detail="File not found")
```

### Step 4: Add Monitoring Decorator to Existing Endpoints

Use the decorator on your existing endpoints to track performance:

```python
from services.azure_monitoring_service import monitor_performance

@app.get("/api/users/{user_id}")
@monitor_performance  # Add this line
async def get_user(user_id: str):
    # Your existing code
    return {"user_id": user_id, "name": "John Doe"}

@app.post("/api/mentorship/request")
@monitor_performance  # Add this line
async def request_mentorship(request_data: dict):
    # Your existing code
    return {"status": "success"}
```

### Step 5: Manual Event Tracking

Track important user actions:

```python
# In any endpoint where you want to track an event
AzureMonitoringService.track_event(
    event_name="user_action_name",
    properties={
        "user_id": user_id,
        "action_type": "mentorship_request",
        "status": "submitted"
    },
    measurements={
        "duration_ms": 123.45,
        "score": 95
    }
)
```

---

## 🧪 Testing Your Integration

### Run the Test Files:

```bash
# Test Phase 3 (Blob Storage)
python backend/test_phase3_blob_storage.py

# Test Phase 5 (Monitoring)
python backend/test_phase5_monitoring.py

# Run full demo
python backend/demo_phase3_and_5.py
```

### Check Azure Portal:

1. **Blob Storage**:
   - Go to https://portal.azure.com
   - Find "alumunity" Storage Account
   - Click "Containers" → "alumunity"
   - See your uploaded files

2. **Application Insights**:
   - Go to https://portal.azure.com
   - Find "alumunity-insights"
   - Click "Logs"
   - Query: `customEvents | where name == "profile_photo_uploaded"`
   - See real-time events from your app

---

## 🚀 Deployment Considerations

### Migration from AWS S3

If you're currently using S3, here's the migration plan:

```python
# OLD: S3 code
import boto3
s3_client = boto3.client('s3')
s3_client.upload_fileobj(file_content, bucket_name, key)

# NEW: Azure code
from services.azure_blob_service import AzureBlobStorageService
await AzureBlobStorageService.upload_file(file_content, blob_name)
```

### Environment Variables Required

Make sure your `.env` file has:

```
# Blob Storage (Phase 3)
BLOB_STORAGE_ENABLED=true
AZURE_STORAGE_ACCOUNT_NAME=your-account-name
AZURE_STORAGE_CONTAINER_NAME=alumunity
AZURE_STORAGE_ACCOUNT_KEY=your-key

# Application Insights (Phase 5)
APP_INSIGHTS_ENABLED=true
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

---

## 📊 Monitoring Dashboard for Judges

After integration, you can show judges a professional dashboard:

1. **Metrics Dashboard**:
   - File uploads per day
   - User engagement metrics
   - Performance trends

2. **Performance Monitoring**:
   - API response times
   - Error rates
   - Database query performance

3. **User Analytics**:
   - Most used features
   - User journey analysis
   - Retention metrics

### Quick Dashboard URL

After setting up, share this with judges:
```
https://portal.azure.com/#@yourdomain.onmicrosoft.com/resource/subscriptions/{subscriptionId}/resourceGroups/alumunity-resources/providers/microsoft.insights/components/alumunity-insights/overview
```

---

## 🎯 Impressive Features to Demo for Imagine Cup

1. **Show Azure Portal**:
   - "Real-time monitoring of 10,000+ user interactions"
   - "Application Insights tracks every user action"
   - "See API performance metrics in real-time"

2. **Show Blob Storage**:
   - "Files stored securely in Microsoft Azure cloud"
   - "User profile photos and documents automatically backed up"
   - "Scalable to millions of files"

3. **Show Code**:
   - "Simple integration with existing FastAPI"
   - "Event tracking with just 3 lines of code"
   - "Professional enterprise-grade infrastructure"

---

## 📝 Complete Code Example

Here's a minimal working example:

```python
from fastapi import FastAPI, UploadFile, File
from services.azure_blob_service import AzureBlobStorageService
from services.azure_monitoring_service import AzureMonitoringService
from config.azure_config import AzureConfig

app = FastAPI()

@app.on_event("startup")
async def startup():
    if AzureConfig.APP_INSIGHTS_ENABLED:
        AzureMonitoringService.initialize()

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    
    # Upload to Azure
    await AzureBlobStorageService.upload_file(
        file_content=content,
        blob_name=f"uploads/{file.filename}"
    )
    
    # Track event
    AzureMonitoringService.track_event(
        event_name="file_uploaded",
        properties={"filename": file.filename}
    )
    
    return {"status": "uploaded"}
```

---

## ✅ Success Checklist

- [ ] Updated `.env` with Azure credentials
- [ ] Added imports to `server.py`
- [ ] Added startup event for monitoring
- [ ] Added file upload endpoint
- [ ] Added file download endpoint
- [ ] Added monitoring decorators
- [ ] Ran test files successfully
- [ ] Uploaded a test file to Azure
- [ ] Verified event appears in Application Insights
- [ ] Shared Azure Portal link with team

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection string not found" | Check `.env` has `APPLICATIONINSIGHTS_CONNECTION_STRING` |
| "Storage account not found" | Verify `AZURE_STORAGE_ACCOUNT_NAME` matches Azure |
| "File upload fails" | Check container name is lowercase and exists |
| "Events not appearing" | Wait 1-2 minutes for Application Insights to index |
| "403 Forbidden on file access" | Verify storage account key is correct |

---

## 🎓 Learning Resources

- [Azure Blob Storage Python SDK](https://docs.microsoft.com/en-us/python/api/azure-storage-blob/)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/)

---

**Ready to deploy?** You now have enterprise-grade file storage and monitoring! 🚀
