# 🚀 PHASE 2-8: AZURE IMPLEMENTATION QUICK START

## Phase 2: Database Migration (2-3 hours)

### Step 1: Create Azure Resources
```powershell
# Set your variables
$RESOURCE_GROUP="alumunity-rg"
$LOCATION="eastus"
$DB_SERVER="alumunity-mysql-prod"

# Login to Azure
az login

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure MySQL Database (Burstable B2 - $40/month)
az mysql server create `
  --resource-group $RESOURCE_GROUP `
  --name $DB_SERVER `
  --location $LOCATION `
  --admin-user alumadmin `
  --admin-password "YourSecurePassword123!" `
  --sku-name B_Gen5_2 `
  --storage-size 51200 `
  --backup-retention 35 `
  --geo-redundant-backup Enabled
```

### Step 2: Configure Firewall
```powershell
# Allow your IP
$YOUR_IP=$(Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content

az mysql server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --name AllowLocalIP `
  --start-ip-address $YOUR_IP `
  --end-ip-address $YOUR_IP

# Allow Azure services
az mysql server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
```

### Step 3: Update .env.azure
```bash
AZURE_DB_HOST=alumunity-mysql-prod.mysql.database.azure.com
AZURE_DB_USER=alumadmin
AZURE_DB_PASSWORD=YourSecurePassword123!
AZURE_DB_NAME=alumunity
AZURE_DB_PORT=3306
```

### Step 4: Migrate Data
```bash
# Export from Railway
mysqldump -h your-railway-host -u user -p railway > backup.sql

# Import to Azure (may take a few minutes)
mysql -h alumunity-mysql-prod.mysql.database.azure.com -u alumadmin -p < backup.sql
```

---

## Phase 3: Blob Storage Setup (1 hour)

### Step 1: Create Storage Account
```powershell
$STORAGE_ACCOUNT="alumunitystorage"

az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind BlobStorage `
  --access-tier Hot

# Get connection string
az storage account show-connection-string `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP
```

### Step 2: Create Container
```powershell
$STORAGE_KEY=$(az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "[0].value" -o tsv)

az storage container create `
  --name uploads `
  --account-name $STORAGE_ACCOUNT `
  --account-key $STORAGE_KEY `
  --public-access blob
```

### Step 3: Update .env.azure
```bash
# Copy the connection string from Step 1
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER=uploads
```

---

## Phase 4: Azure OpenAI Setup (2-3 hours)

### Step 1: Create Azure OpenAI Resource
```powershell
az cognitiveservices account create `
  --resource-group $RESOURCE_GROUP `
  --name alumunity-openai `
  --location eastus `
  --kind OpenAI `
  --sku S0 `
  --yes

# Get API key
az cognitiveservices account keys list `
  --name alumunity-openai `
  --resource-group $RESOURCE_GROUP
```

### Step 2: Deploy GPT-4 Model
```powershell
# This can take 5-10 minutes
az cognitiveservices account deployment create `
  --resource-group $RESOURCE_GROUP `
  --name alumunity-openai `
  --deployment-name gpt-4-deployment `
  --model-name gpt-4 `
  --model-version 1106 `
  --model-format OpenAI
```

### Step 3: Update .env.azure
```bash
AZURE_OPENAI_KEY=your-api-key-from-step-1
AZURE_OPENAI_ENDPOINT=https://alumunity-openai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-deployment
```

---

## Phase 5: Application Insights (1 hour)

### Step 1: Create Application Insights
```powershell
az monitor app-insights component create `
  --app alumunity-insights `
  --location eastus `
  --resource-group $RESOURCE_GROUP `
  --application-type web `
  --retention-time 90

# Get connection string
az monitor app-insights component show `
  --app alumunity-insights `
  --resource-group $RESOURCE_GROUP
```

### Step 2: Update .env.azure
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
APPLICATIONINSIGHTS_ENABLED=true
```

---

## Phase 6: Key Vault (1 hour)

### Step 1: Create Key Vault
```powershell
az keyvault create `
  --name alumunity-kv `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --enable-rbac-authorization

# Store secrets
az keyvault secret set `
  --vault-name alumunity-kv `
  --name "db-password" `
  --value "YourSecurePassword123!"

az keyvault secret set `
  --vault-name alumunity-kv `
  --name "openai-key" `
  --value "your-openai-key"

az keyvault secret set `
  --vault-name alumunity-kv `
  --name "jwt-secret" `
  --value "your-jwt-secret"
```

### Step 2: Update .env.azure
```bash
AZURE_KEYVAULT_URL=https://alumunity-kv.vault.azure.net/
AZURE_KEYVAULT_ENABLED=true
```

---

## Phase 7: App Service Deployment (2 hours)

### Step 1: Create App Service Plan
```powershell
az appservice plan create `
  --name alumunity-plan `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B2

# Creates: Backend + Frontend + Redis
```

### Step 2: Create Web Apps
```powershell
# Backend
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan alumunity-plan `
  --name alumunity-api `
  --runtime "PYTHON|3.11"

# Frontend
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan alumunity-plan `
  --name alumunity-web `
  --runtime "NODE|18-lts"
```

### Step 3: Configure Settings
```powershell
az webapp config appsettings set `
  --name alumunity-api `
  --resource-group $RESOURCE_GROUP `
  --settings `
    AZURE_DB_HOST="alumunity-mysql-prod.mysql.database.azure.com" `
    AZURE_DB_USER="alumadmin" `
    AZURE_DB_PASSWORD="password" `
    AZURE_OPENAI_KEY="key" `
    AZURE_STORAGE_CONNECTION_STRING="connection-string" `
    APPLICATIONINSIGHTS_CONNECTION_STRING="insights-key" `
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false `
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Step 4: Deploy Backend
```powershell
cd backend

# Build
az webapp up `
  --resource-group $RESOURCE_GROUP `
  --name alumunity-api `
  --runtime "PYTHON|3.11" `
  --sku B2
```

---

## Phase 8: Azure DevOps CI/CD (2-3 hours)

### Step 1: Create DevOps Project
```powershell
# Go to: https://dev.azure.com
# Create new project: "AlumUnity"
# Import GitHub repo
```

### Step 2: Create azure-pipelines.yml
Already provided in AZURE_IMPLEMENTATION_GUIDE.md

### Step 3: Set Pipeline Variables
```yaml
# In Azure DevOps Pipelines UI:
- AZURE_SUBSCRIPTION_ID
- AZURE_RESOURCE_GROUP
- AZURE_STORAGE_CONNECTION_STRING
- AZURE_DB_PASSWORD
```

---

## 📊 Cost Summary (Monthly)

| Service | Estimated Cost |
|---------|---|
| Azure MySQL (B2) | $40-50 |
| App Service (B2) | $50-100 |
| Storage (10GB) | $0.50-5 |
| Azure OpenAI | $0-50 (usage) |
| App Insights | $5-20 |
| Key Vault | $0.60 |
| **Total** | **$96-225** |

### Startup Costs (One-time)
- Data migration: Free (using Azure tools)
- Setup: Free

### Free Credits
- New Azure accounts: $200 free credit (valid 30 days)
- Students: $100/month free (with student email)

---

## ✅ Validation Checklist

After each phase, verify:
- [ ] Phase 2: Can connect to Azure MySQL
- [ ] Phase 3: Can upload files to Blob Storage
- [ ] Phase 4: Can call Azure OpenAI API
- [ ] Phase 5: Events appear in Application Insights
- [ ] Phase 6: Can retrieve secrets from Key Vault
- [ ] Phase 7: Web apps are running and healthy
- [ ] Phase 8: CI/CD pipeline triggers on git push

---

## 🆘 Troubleshooting

### Database Connection Failed
```powershell
# Check firewall rules
az mysql server firewall-rule list --server-name $DB_SERVER --resource-group $RESOURCE_GROUP

# Check SSL requirement
mysql -h alumunity-mysql-prod.mysql.database.azure.com -u alumadmin -p --ssl-mode=REQUIRED
```

### OpenAI Quota Exceeded
- Check deployment quotas in Azure portal
- May need to wait 24 hours for quota reset
- Or upgrade resource to higher tier

### App Service Not Starting
```powershell
# View logs
az webapp log tail --name alumunity-api --resource-group $RESOURCE_GROUP

# Check deployment
az webapp deployment list --name alumunity-api --resource-group $RESOURCE_GROUP
```

---

## 🎓 Helpful Commands

```powershell
# View all resources
az resource list --resource-group $RESOURCE_GROUP --output table

# View costs
az costmanagement query --resource-group $RESOURCE_GROUP

# Clean up (DELETE ALL - be careful!)
az group delete --name $RESOURCE_GROUP --yes

# Check status
az group show --name $RESOURCE_GROUP
```

---

**Ready to implement? Let me know which phase to start with!**
