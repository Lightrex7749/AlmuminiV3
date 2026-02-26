"""
Azure Configuration Module
Handles all Azure service connections and configurations
"""

import os
import logging
from functools import lru_cache
from typing import Optional

from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.storage.blob import BlobServiceClient
from azure.monitor.opentelemetry import configure_azure_monitor
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class AzureConfig:
    """Central configuration for all Azure services"""

    # ========== Azure General ==========
    SUBSCRIPTION_ID: str = os.getenv("AZURE_SUBSCRIPTION_ID", "")
    RESOURCE_GROUP: str = os.getenv("AZURE_RESOURCE_GROUP", "alumunity-rg")
    LOCATION: str = os.getenv("AZURE_LOCATION", "eastus")
    ENVIRONMENT: str = os.getenv("AZURE_ENVIRONMENT", "development")

    # ========== Azure Database ==========
    DB_HOST: str = os.getenv(
        "AZURE_DB_HOST", "alumunity-mysql-prod.mysql.database.azure.com"
    )
    DB_USER: str = os.getenv("AZURE_DB_USER", "alumadmin")
    DB_PASSWORD: str = os.getenv("AZURE_DB_PASSWORD", "")
    DB_NAME: str = os.getenv("AZURE_DB_NAME", "alumunity")
    DB_PORT: int = int(os.getenv("AZURE_DB_PORT", "3306"))

    @property
    def DATABASE_URL(self) -> str:
        """Generate database connection string"""
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # ========== Azure Blob Storage ==========
    STORAGE_CONNECTION_STRING: str = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
    STORAGE_ACCOUNT_NAME: str = os.getenv("AZURE_STORAGE_ACCOUNT_NAME", "alumunitystorage")
    STORAGE_CONTAINER: str = os.getenv("AZURE_STORAGE_CONTAINER", "uploads")
    STORAGE_ENDPOINT: str = os.getenv(
        "AZURE_STORAGE_ENDPOINT", "https://alumunitystorage.blob.core.windows.net/"
    )

    # ========== Azure OpenAI ==========
    OPENAI_KEY: str = os.getenv("AZURE_OPENAI_KEY", "")
    OPENAI_ENDPOINT: str = os.getenv(
        "AZURE_OPENAI_ENDPOINT", "https://alumunity-openai.openai.azure.com/"
    )
    OPENAI_DEPLOYMENT_NAME: str = os.getenv(
        "AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4-deployment"
    )
    OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    # ========== Application Insights ==========
    APP_INSIGHTS_CONNECTION_STRING: str = os.getenv(
        "APPLICATIONINSIGHTS_CONNECTION_STRING", ""
    )
    APP_INSIGHTS_ENABLED: bool = os.getenv("APPLICATIONINSIGHTS_ENABLED", "true").lower() == "true"

    # ========== Key Vault ==========
    KEYVAULT_URL: str = os.getenv("AZURE_KEYVAULT_URL", "https://alumunity-kv.vault.azure.net/")
    KEYVAULT_ENABLED: bool = os.getenv("AZURE_KEYVAULT_ENABLED", "false").lower() == "true"

    # ========== Azure Entra ID ==========
    TENANT_ID: str = os.getenv("AZURE_TENANT_ID", "")
    CLIENT_ID: str = os.getenv("AZURE_CLIENT_ID", "")
    CLIENT_SECRET: str = os.getenv("AZURE_CLIENT_SECRET", "")

    # ========== App Service ==========
    APP_SERVICE_NAME: str = os.getenv("AZURE_APP_SERVICE_NAME", "alumunity-api")
    PORT: int = int(os.getenv("PORT", 8000))

    # ========== Logging & Monitoring ==========
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ENABLE_AZURE_LOGGING: bool = os.getenv("ENABLE_AZURE_LOGGING", "true").lower() == "true"


class AzureServiceFactory:
    """Factory for creating Azure service clients"""

    @staticmethod
    @lru_cache(maxsize=1)
    def get_credential() -> DefaultAzureCredential:
        """Get default Azure credential for authentication"""
        try:
            credential = DefaultAzureCredential()
            logger.info("✅ Azure credentials initialized successfully")
            return credential
        except Exception as e:
            logger.error(f"❌ Failed to initialize Azure credentials: {str(e)}")
            raise

    @staticmethod
    @lru_cache(maxsize=1)
    def get_keyvault_client() -> Optional[SecretClient]:
        """Get Azure Key Vault client"""
        if not AzureConfig.KEYVAULT_ENABLED:
            logger.warning("⚠️ Key Vault is disabled")
            return None

        try:
            credential = AzureServiceFactory.get_credential()
            client = SecretClient(
                vault_url=AzureConfig.KEYVAULT_URL,
                credential=credential
            )
            logger.info("✅ Key Vault client initialized")
            return client
        except Exception as e:
            logger.error(f"❌ Failed to initialize Key Vault: {str(e)}")
            return None

    @staticmethod
    @lru_cache(maxsize=1)
    def get_blob_client() -> Optional[BlobServiceClient]:
        """Get Azure Blob Storage client"""
        try:
            if AzureConfig.STORAGE_CONNECTION_STRING:
                client = BlobServiceClient.from_connection_string(
                    AzureConfig.STORAGE_CONNECTION_STRING
                )
            else:
                credential = AzureServiceFactory.get_credential()
                client = BlobServiceClient(
                    account_url=f"https://{AzureConfig.STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
                    credential=credential
                )
            logger.info("✅ Blob Storage client initialized")
            return client
        except Exception as e:
            logger.error(f"❌ Failed to initialize Blob Storage: {str(e)}")
            return None

    @staticmethod
    @lru_cache(maxsize=1)
    def get_openai_client() -> Optional[AzureOpenAI]:
        """Get Azure OpenAI client"""
        if not AzureConfig.OPENAI_KEY or not AzureConfig.OPENAI_ENDPOINT:
            logger.warning("⚠️ Azure OpenAI not configured")
            return None

        try:
            client = AzureOpenAI(
                api_key=AzureConfig.OPENAI_KEY,
                api_version=AzureConfig.OPENAI_API_VERSION,
                azure_endpoint=AzureConfig.OPENAI_ENDPOINT
            )
            logger.info("✅ Azure OpenAI client initialized")
            return client
        except Exception as e:
            logger.error(f"❌ Failed to initialize Azure OpenAI: {str(e)}")
            return None


class AzureKeyVaultManager:
    """Manage secrets from Azure Key Vault"""

    _client = None

    @classmethod
    def get_secret(cls, secret_name: str) -> Optional[str]:
        """Retrieve secret from Key Vault"""
        if not AzureConfig.KEYVAULT_ENABLED:
            logger.warning(f"⚠️ Key Vault disabled, falling back to environment variable")
            return os.getenv(secret_name)

        try:
            if cls._client is None:
                cls._client = AzureServiceFactory.get_keyvault_client()

            if cls._client is None:
                return None

            secret = cls._client.get_secret(secret_name)
            logger.info(f"✅ Retrieved secret: {secret_name}")
            return secret.value
        except Exception as e:
            logger.warning(f"⚠️ Failed to get secret '{secret_name}' from Key Vault: {str(e)}")
            # Fallback to environment variable
            return os.getenv(secret_name)


def initialize_azure_monitoring():
    """Initialize Azure Application Insights"""
    if AzureConfig.APP_INSIGHTS_ENABLED and AzureConfig.APP_INSIGHTS_CONNECTION_STRING:
        try:
            configure_azure_monitor(
                connection_string=AzureConfig.APP_INSIGHTS_CONNECTION_STRING
            )
            logger.info("✅ Azure Application Insights initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Application Insights: {str(e)}")


# Initialize on module load
if __name__ != "__main__":
    logger.info(f"🔷 Azure Configuration Loaded - Environment: {AzureConfig.ENVIRONMENT}")
    if AzureConfig.APP_INSIGHTS_ENABLED:
        initialize_azure_monitoring()
