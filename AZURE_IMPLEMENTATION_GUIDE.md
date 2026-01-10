# AlumUnity - Azure Implementation Roadmap

## 🎯 PHASE 1: PREREQUISITES (Week 1)

### What You Need:
- [ ] **Azure Account** - Create at https://azure.microsoft.com
- [ ] **Azure Subscription** - Free tier ($200 credit) or Pay-As-You-Go
- [ ] **Azure CLI** - Command-line tools
- [ ] **Service Principal** - For authentication

### Quick Setup (30 minutes):
```bash
# 1. Create Azure account (free)
# https://azure.microsoft.com/free

# 2. Install Azure CLI
# Windows: https://aka.ms/installazurecliwindows

# 3. Login to Azure
az login

# 4. Create Service Principal for CI/CD
az ad sp create-for-rbac --name "AlumUnity-SP" --role contributor
# Save the output - you'll need it for GitHub Actions
```

---

## 💾 PHASE 2: DATABASE MIGRATION (Week 1-2)

### Current: Railway MySQL → Azure Database for MySQL

### Step 1: Create Azure MySQL Database
```bash
# Set variables
RESOURCE_GROUP="alumunity-rg"
LOCATION="eastus"
DB_SERVER="alumunity-mysql-prod"
DB_USER="alumadmin"
DB_PASSWORD="YourSecurePassword123!" # Use strong password

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Database for MySQL
az mysql server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user $DB_USER \
  --admin-password $DB_PASSWORD \
  --sku-name B_Gen5_2 \
  --storage-size 51200 \
  --backup-retention 35 \
  --geo-redundant-backup Enabled \
  --enable-infrastructure-encryption
```

### Step 2: Install Required Packages
```bash
# In backend/ directory
pip install azure-identity azure-keyvault-secrets
```

### Step 3: Update Connection String
```python
# backend/database/connection.py
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("AZURE_DB_HOST", "alumunity-mysql-prod.mysql.database.azure.com")
DB_USER = os.getenv("AZURE_DB_USER", "alumadmin")
DB_PASSWORD = os.getenv("AZURE_DB_PASSWORD")
DB_NAME = os.getenv("AZURE_DB_NAME", "alumunity")
DB_PORT = int(os.getenv("AZURE_DB_PORT", "3306"))

# Connection string with SSL (Azure requirement)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?ssl_ca=/path/to/DigiCertGlobalRootCA.crt"
```

### Step 4: Environment Variables to Add
```bash
AZURE_DB_HOST=alumunity-mysql-prod.mysql.database.azure.com
AZURE_DB_USER=alumadmin
AZURE_DB_PASSWORD=YourSecurePassword123!
AZURE_DB_NAME=alumunity
AZURE_DB_PORT=3306
```

### Step 5: Migrate Data
```bash
# Export from Railway
mysqldump -h old-railway-host -u user -p database > backup.sql

# Import to Azure
mysql -h alumunity-mysql-prod.mysql.database.azure.com -u alumadmin -p < backup.sql
```

---

## 💾 PHASE 3: BLOB STORAGE (Week 2)

### Current: AWS S3 → Azure Blob Storage

### Step 1: Create Storage Account
```bash
STORAGE_ACCOUNT="alumunitystorage"
STORAGE_CONTAINER="uploads"

# Create Storage Account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind BlobStorage \
  --access-tier Hot

# Create Container
az storage container create \
  --name $STORAGE_CONTAINER \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob
```

### Step 2: Install Azure Storage SDK
```bash
pip install azure-storage-blob
```

### Step 3: Update Upload Code
```python
# backend/services/storage_service.py
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential

class AzureStorageService:
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER", "uploads")
        self.blob_service = BlobServiceClient.from_connection_string(
            self.connection_string
        )
    
    async def upload_file(self, file_name: str, file_content: bytes):
        """Upload file to Azure Blob Storage"""
        blob_client = self.blob_service.get_blob_client(
            container=self.container_name, 
            blob=file_name
        )
        await blob_client.upload_blob(file_content, overwrite=True)
        return blob_client.url
    
    async def delete_file(self, file_name: str):
        """Delete file from Azure Blob Storage"""
        blob_client = self.blob_service.get_blob_client(
            container=self.container_name, 
            blob=file_name
        )
        await blob_client.delete_blob()

# Usage in routes
@router.post("/upload-profile-photo")
async def upload_photo(file: UploadFile):
    storage_service = AzureStorageService()
    file_url = await storage_service.upload_file(
        file_name=f"profiles/{uuid.uuid4()}_{file.filename}",
        file_content=await file.read()
    )
    return {"url": file_url}
```

### Step 4: Environment Variables
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=alumunitystorage;AccountKey=...
AZURE_STORAGE_CONTAINER=uploads
```

---

## 🧠 PHASE 4: AZURE OPENAI SERVICE (Week 2-3)

### Current: OpenAI → Azure OpenAI

### Step 1: Create Azure OpenAI Resource
```bash
az cognitiveservices account create \
  --resource-group $RESOURCE_GROUP \
  --name alumunity-openai \
  --location eastus \
  --kind OpenAI \
  --sku S0
```

### Step 2: Deploy Models
```bash
# Deploy GPT-4 model
az cognitiveservices account deployment create \
  --resource-group $RESOURCE_GROUP \
  --name alumunity-openai \
  --deployment-name gpt-4-deployment \
  --model-name gpt-4 \
  --model-version 1106
```

### Step 3: Install Azure OpenAI SDK
```bash
pip install openai>=1.0.0
```

### Step 4: Update AI Code
```python
# backend/services/ai_service.py
from openai import AzureOpenAI

class AzureAIService:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_KEY"),
            api_version="2024-02-15-preview",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        self.deployment_name = "gpt-4-deployment"
    
    async def generate_mentor_recommendations(self, user_profile: dict):
        """Use Azure OpenAI to find matching mentors"""
        prompt = f"""
        Based on this student profile: {user_profile}
        Recommend 5 ideal mentors from our database.
        Consider: skills, experience, goals, location.
        """
        
        response = self.client.chat.completions.create(
            engine=self.deployment_name,
            messages=[
                {"role": "system", "content": "You are an expert mentor matcher."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    async def generate_job_recommendations(self, student_profile: dict):
        """Generate job recommendations using Azure OpenAI"""
        prompt = f"""
        Based on this student profile: {student_profile}
        Recommend 5 job postings from our database.
        Consider: skills match, salary expectations, location.
        """
        
        response = self.client.chat.completions.create(
            engine=self.deployment_name,
            messages=[
                {"role": "system", "content": "You are a career advisor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content

# Usage in routes
@router.get("/api/recommendations/mentors/{user_id}")
async def get_mentor_recommendations(user_id: int):
    user = await get_user(user_id)
    ai_service = AzureAIService()
    recommendations = await ai_service.generate_mentor_recommendations(user)
    return {"recommendations": recommendations}
```

### Step 5: Environment Variables
```bash
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://alumunity-openai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-deployment
```

---

## 📊 PHASE 5: APPLICATION INSIGHTS (Week 3)

### Monitoring & Performance Tracking

### Step 1: Create Application Insights
```bash
az monitor app-insights component create \
  --app alumunity-insights \
  --location eastus \
  --resource-group $RESOURCE_GROUP \
  --application-type web
```

### Step 2: Install SDK
```bash
pip install opencensus-ext-azure
```

### Step 3: Update server.py
```python
# backend/server.py
from opencensus.ext.flask.flask_middleware import FlaskMiddleware
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.samplers import ProbabilitySampler
import logging

app = FastAPI()

# Configure Azure Exporter
azure_exporter = AzureExporter(
    connection_string=os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
)

# Middleware for tracing
tracer = trace.get_tracer(__name__)

# Logging
handler = AzureLogHandler(
    connection_string=os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
)
handler.setLevel(logging.INFO)
logger = logging.getLogger(__name__)
logger.addHandler(handler)

@app.middleware("http")
async def add_telemetry(request: Request, call_next):
    with tracer.span(name=request.url.path):
        response = await call_next(request)
        logger.info(f"{request.method} {request.url.path} - {response.status_code}")
        return response
```

### Step 4: Environment Variable
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key;...
```

---

## 🔐 PHASE 6: AZURE KEY VAULT (Week 3)

### Secrets Management

### Step 1: Create Key Vault
```bash
az keyvault create \
  --name alumunity-kv \
  --resource-group $RESOURCE_GROUP \
  --location eastus \
  --enable-rbac-authorization true
```

### Step 2: Store Secrets
```bash
# Store database password
az keyvault secret set \
  --vault-name alumunity-kv \
  --name "db-password" \
  --value "YourSecurePassword123!"

# Store API keys
az keyvault secret set \
  --vault-name alumunity-kv \
  --name "openai-key" \
  --value "your-openai-key"

az keyvault secret set \
  --vault-name alumunity-kv \
  --name "jwt-secret" \
  --value "your-jwt-secret"
```

### Step 3: Install Azure SDK
```bash
pip install azure-keyvault-secrets azure-identity
```

### Step 4: Update Config
```python
# backend/config.py
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
import os

def get_secret(secret_name: str) -> str:
    """Retrieve secret from Azure Key Vault"""
    credential = DefaultAzureCredential()
    client = SecretClient(
        vault_url=f"https://alumunity-kv.vault.azure.net/",
        credential=credential
    )
    secret = client.get_secret(secret_name)
    return secret.value

# Usage
DB_PASSWORD = get_secret("db-password")
OPENAI_KEY = get_secret("openai-key")
JWT_SECRET = get_secret("jwt-secret")
```

---

## ☁️ PHASE 7: AZURE APP SERVICE (Week 4)

### Production Deployment

### Step 1: Create App Service Plan
```bash
az appservice plan create \
  --name alumunity-plan \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B2
```

### Step 2: Create Web App for Backend
```bash
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan alumunity-plan \
  --name alumunity-api \
  --runtime "PYTHON|3.11"
```

### Step 3: Create Web App for Frontend
```bash
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan alumunity-plan \
  --name alumunity-web \
  --runtime "NODE|18-lts"
```

### Step 4: Configure Environment Variables
```bash
# For Backend
az webapp config appsettings set \
  --name alumunity-api \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_DB_HOST="alumunity-mysql-prod.mysql.database.azure.com" \
    AZURE_DB_USER="alumadmin" \
    AZURE_DB_PASSWORD="password" \
    AZURE_OPENAI_KEY="key" \
    AZURE_STORAGE_CONNECTION_STRING="connection-string" \
    APPLICATIONINSIGHTS_CONNECTION_STRING="insights-key"
```

### Step 5: Deploy Backend
```bash
# Build and deploy
cd backend
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name alumunity-api \
  --src <path-to-backend-zip>
```

---

## 🔄 PHASE 8: AZURE DEVOPS CI/CD (Week 4)

### Continuous Integration & Deployment

### Step 1: Create Pipeline File
```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Build
  jobs:
  - job: BuildBackend
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.11'
    
    - script: |
        pip install -r backend/requirements.txt
        python -m pytest backend/tests/
      displayName: 'Run Tests'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: 'backend/'
        includeRootFolder: false
        archiveFile: '$(Build.ArtifactStagingDirectory)/backend.zip'
    
    - task: PublishBuildArtifacts@1
      inputs:
        artifactName: 'backend'

- stage: Deploy
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployBackend
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: 'Your-Azure-Subscription'
              appType: 'webAppLinux'
              appName: 'alumunity-api'
              package: '$(Pipeline.Workspace)/backend/backend.zip'
```

---

## 📋 REQUIREMENTS FOR IMPLEMENTATION

### Azure Resources Needed:
- [ ] **Resource Group** - Container for all resources
- [ ] **Azure Database for MySQL** - Database
- [ ] **Storage Account** - File uploads
- [ ] **Azure OpenAI** - AI services
- [ ] **Application Insights** - Monitoring
- [ ] **Key Vault** - Secrets
- [ ] **App Service Plan** - Hosting
- [ ] **2x Web Apps** - Frontend & Backend
- [ ] **Azure DevOps Project** - CI/CD

### Cost Estimate (Monthly):
```
Azure Database for MySQL: $40-80
Storage Account: $5-20
App Service (B2): $50-100
Azure OpenAI: $0.015-0.03 per 1K tokens (usage-based)
Application Insights: $5-20
Key Vault: $0.6 per 10K operations
Total: ~$100-250/month (depending on usage)
```

### Time Estimate:
- **Phase 1 (Prerequisites):** 30 min
- **Phase 2 (Database):** 2-3 hours
- **Phase 3 (Blob Storage):** 1 hour
- **Phase 4 (OpenAI):** 2-3 hours
- **Phase 5 (App Insights):** 1 hour
- **Phase 6 (Key Vault):** 1 hour
- **Phase 7 (App Service):** 2 hours
- **Phase 8 (DevOps):** 2-3 hours
- **Testing & Validation:** 2-3 hours

**Total: 14-20 hours of work**

---

## 🚀 QUICK START SCRIPT

Save this as `setup_azure.sh`:

```bash
#!/bin/bash

# Set variables
RESOURCE_GROUP="alumunity-rg"
LOCATION="eastus"
DB_SERVER="alumunity-mysql-prod"
STORAGE_ACCOUNT="alumunitystorage"

# 1. Create Resource Group
echo "Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Create Database
echo "Creating Azure Database for MySQL..."
az mysql server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user alumadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name B_Gen5_2

# 3. Create Storage Account
echo "Creating Storage Account..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# 4. Create OpenAI Resource
echo "Creating Azure OpenAI..."
az cognitiveservices account create \
  --resource-group $RESOURCE_GROUP \
  --name alumunity-openai \
  --location eastus \
  --kind OpenAI \
  --sku S0

# 5. Create Key Vault
echo "Creating Key Vault..."
az keyvault create \
  --name alumunity-kv \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# 6. Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
  --name alumunity-plan \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B2

# 7. Create Web Apps
echo "Creating Web Apps..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan alumunity-plan \
  --name alumunity-api \
  --runtime "PYTHON|3.11"

az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan alumunity-plan \
  --name alumunity-web \
  --runtime "NODE|18-lts"

echo "✅ Azure setup complete!"
echo "Next steps:"
echo "1. Update connection strings in .env"
echo "2. Run database migrations"
echo "3. Deploy code to App Service"
```

---

## 📞 SUPPORT & RESOURCES

- **Azure Documentation:** https://docs.microsoft.com/azure
- **Azure Python SDK:** https://github.com/Azure/azure-sdk-for-python
- **Azure Pricing Calculator:** https://azure.microsoft.com/pricing/calculator/
- **Azure Student Benefits:** https://azure.microsoft.com/free/students/
- **Microsoft Learn:** https://learn.microsoft.com/azure/

---

**Next Step:** Which phase do you want to start with? I can help implement any of these!
