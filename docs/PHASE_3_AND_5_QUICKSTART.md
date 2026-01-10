# ⚡ PHASE 3 + 5 QUICK SETUP (2 Hours Total)

## 🎯 What You'll Have
- ✅ Files upload to cloud (Azure Blob Storage)
- ✅ Real-time monitoring (Application Insights)
- ✅ Error tracking
- ✅ Performance metrics

---

## PHASE 3: BLOB STORAGE SETUP (1 Hour)

### Step 1: Create Storage Account (10 min)

**Option A: Using Azure Portal (Easiest)**
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Storage account"
4. Click Create
5. Fill in:
   - **Resource Group**: Create new or use existing
   - **Storage account name**: `alumunitystorage` (must be unique, try: `alumunity<yourname>`)
   - **Region**: East US
   - Click "Create"

**Option B: Using Azure CLI**
```powershell
az login

$STORAGE_ACCOUNT="alumunitystorage"
$RESOURCE_GROUP="alumunity-rg"
$LOCATION="eastus"

az group create --name $RESOURCE_GROUP --location $LOCATION

az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP
```

### Step 2: Get Connection String (5 min)

**In Azure Portal:**
1. Go to your Storage Account
2. Click "Access keys" on left menu
3. Copy the "Connection string" under key1
4. Save it - you'll need it next

### Step 3: Create Container (5 min)

**In Azure Portal:**
1. Click "Containers" on left menu
2. Click "+ Container"
3. Name: `uploads`
4. Click "Create"

### Step 4: Update .env File (5 min)

```bash
# Edit your .env file and add:
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=alumunitystorage;AccountKey=xxxx...;EndpointSuffix=core.windows.net

# The connection string you copied in Step 2
```

### Step 5: Test Blob Storage (30 min)

**Create test file:** `backend/test_blob_storage.py`

```python
import asyncio
from services.azure_blob_service import AzureBlobStorageService

async def test():
    service = AzureBlobStorageService()
    
    # Test upload
    file_content = b"Hello from AlumUnity!"
    url = await service.upload_file(
        file_name="test/hello.txt",
        file_content=file_content,
        content_type="text/plain"
    )
    print(f"✅ Upload successful: {url}")
    
    # Test download
    downloaded = await service.download_file("test/hello.txt")
    print(f"✅ Download successful: {downloaded}")
    
    # Test list
    files = await service.list_files("test/")
    print(f"✅ Files in test/: {files}")
    
    # Test delete
    deleted = await service.delete_file("test/hello.txt")
    print(f"✅ Delete successful: {deleted}")

asyncio.run(test())
```

**Run it:**
```powershell
cd backend
python test_blob_storage.py
```

**Expected output:**
```
✅ Upload successful: https://alumunitystorage.blob.core.windows.net/uploads/test/hello.txt
✅ Download successful: b'Hello from AlumUnity!'
✅ Files in test/: ['test/hello.txt']
✅ Delete successful: True
```

---

## PHASE 5: APPLICATION INSIGHTS SETUP (1 Hour)

### Step 1: Create Application Insights (10 min)

**Option A: Using Azure Portal (Easiest)**
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Application Insights"
4. Click Create
5. Fill in:
   - **Resource Group**: Same as Storage Account
   - **Name**: `alumunity-insights`
   - **Region**: East US
   - Click "Create"

**Option B: Using Azure CLI**
```powershell
az monitor app-insights component create `
  --app alumunity-insights `
  --location eastus `
  --resource-group alumunity-rg `
  --application-type web
```

### Step 2: Get Connection String (5 min)

**In Azure Portal:**
1. Go to Application Insights resource
2. Click "Properties" (or look for connection string)
3. Copy the "Connection String"
4. Save it

### Step 3: Update .env File (5 min)

```bash
# Add to .env:
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxx;IngestionEndpoint=https://xxxx.applicationinsights.azure.com/;LiveEndpoint=https://xxxx.applicationinsights.azure.com/

APPLICATIONINSIGHTS_ENABLED=true
```

### Step 4: Add to Your Server (20 min)

**Edit `backend/server.py`:**

Add these imports at the top:
```python
from services.azure_monitoring_service import (
    AzureMonitoringService, 
    initialize_azure_monitoring
)
from fastapi import Request
import time
```

After `app = FastAPI()`, add:
```python
# Initialize Azure monitoring
initialize_azure_monitoring()

# Add middleware to track requests
@app.middleware("http")
async def track_requests(request: Request, call_next):
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
        AzureMonitoringService.track_exception(e)
        raise

@app.on_event("startup")
async def startup():
    print("✅ Azure Monitoring Initialized")
    AzureMonitoringService.track_event("app_startup", {"version": "1.0"})

@app.on_event("shutdown")
async def shutdown():
    AzureMonitoringService.track_event("app_shutdown")
    print("✅ App Shutdown Complete")
```

### Step 5: Test Monitoring (20 min)

**Create test file:** `backend/test_monitoring.py`

```python
from services.azure_monitoring_service import AzureMonitoringService

# Test event tracking
AzureMonitoringService.track_event(
    "test_event",
    properties={"user": "test", "action": "signup"},
    measurements={"duration": 1234}
)
print("✅ Event tracked")

# Test request tracking
AzureMonitoringService.track_request(
    "GET /api/test",
    duration_ms=123,
    success=True,
    response_code=200
)
print("✅ Request tracked")

# Test exception tracking
try:
    1 / 0
except Exception as e:
    AzureMonitoringService.track_exception(e)
    print("✅ Exception tracked")

print("\n✅ All monitoring working!")
```

**Run it:**
```powershell
python test_monitoring.py
```

### Step 6: View Metrics in Azure Portal (10 min)

1. Go to your Application Insights resource
2. Click "Metrics"
3. Select "Request duration"
4. You should see your test metrics appear in ~2 minutes
5. Click "Logs" to see detailed events

---

## 📋 Checklist: Phase 3 + 5 Complete

### Phase 3 (Blob Storage)
- [ ] Created Storage Account
- [ ] Created Container named "uploads"
- [ ] Got Connection String
- [ ] Updated .env file
- [ ] Ran test_blob_storage.py
- [ ] All tests passed ✅

### Phase 5 (Application Insights)
- [ ] Created Application Insights resource
- [ ] Got Connection String
- [ ] Updated .env file
- [ ] Added middleware to server.py
- [ ] Ran test_monitoring.py
- [ ] All tests passed ✅

---

## 🧪 Full Integration Test

**After both phases, run your server:**

```powershell
cd backend
python server.py
```

**Then test file upload endpoint:**

```bash
curl -X POST "http://localhost:8000/api/azure/upload-profile-photo/123" \
  -F "file=@/path/to/image.jpg"
```

**Expected response:**
```json
{
  "success": true,
  "file_url": "https://alumunitystorage.blob.core.windows.net/uploads/profiles/user_123_xyz.jpg",
  "file_name": "profiles/user_123_xyz.jpg"
}
```

**Check Application Insights:**
1. Go to Azure Portal
2. Open Application Insights
3. Click "Logs"
4. You should see your events appear!

---

## 🚀 What You Can Demo

✅ "Upload a profile photo" → File saves to Azure cloud
✅ "Check Application Insights" → Show real-time metrics
✅ "File is secure" → HTTPS, encrypted storage
✅ "Scales infinitely" → Azure handles growth
✅ "Enterprise monitoring" → Real dashboards

---

## 💡 Quick Commands Reference

```powershell
# Test blob storage
cd backend
python test_blob_storage.py

# Test monitoring
python test_monitoring.py

# Run server
python server.py

# View logs
az monitor app-insights logs --app alumunity-insights --resource-group alumunity-rg
```

---

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Phase 3 Setup | 45 min |
| Phase 3 Testing | 15 min |
| Phase 5 Setup | 40 min |
| Phase 5 Testing | 20 min |
| **Total** | **~2 hours** |

---

## 🎯 Ready to Start?

**You have 2 choices:**

**Option 1: Use Azure Portal** (Point & click, easiest)
- No CLI needed
- Visual interface
- Takes same time

**Option 2: Use Azure CLI** (Command line, faster)
- More advanced
- Repeatable
- Good practice

**Both are in this guide!**

---

**Next: Which do you prefer - Portal or CLI?**

Or just say **"start"** and I'll do it all for you! 🚀
