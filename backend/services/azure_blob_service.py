"""
Azure Blob Storage Service
Handles file uploads, downloads, and management
"""

import logging
from io import BytesIO
from typing import Optional
from datetime import datetime

from azure.storage.blob import BlobClient, ContainerClient
from azure.core.exceptions import AzureError

from config.azure_config import AzureServiceFactory, AzureConfig

logger = logging.getLogger(__name__)


class AzureBlobStorageService:
    """Service for managing files in Azure Blob Storage"""

    def __init__(self):
        self.blob_client = AzureServiceFactory.get_blob_client()
        self.container_name = AzureConfig.STORAGE_CONTAINER

    async def upload_file(
        self,
        file_name: str,
        file_content: bytes,
        content_type: str = "application/octet-stream",
        metadata: Optional[dict] = None
    ) -> Optional[str]:
        """
        Upload file to Azure Blob Storage

        Args:
            file_name: Name of the file (can include path: 'profiles/user_123.jpg')
            file_content: Binary content of the file
            content_type: MIME type of the file
            metadata: Optional metadata dictionary

        Returns:
            URL of the uploaded file or None if failed
        """
        try:
            if not self.blob_client:
                logger.error("❌ Blob Storage client not initialized")
                return None

            container_client = self.blob_client.get_container_client(self.container_name)

            # Create blob client
            blob_client = container_client.get_blob_client(blob=file_name)

            # Prepare upload parameters
            upload_params = {
                "data": file_content,
                "overwrite": True,
                "content_settings": {"content_type": content_type}
            }

            # Add metadata
            if metadata:
                upload_params["metadata"] = metadata
            else:
                upload_params["metadata"] = {
                    "uploaded_at": datetime.utcnow().isoformat(),
                    "file_name": file_name
                }

            # Upload file
            blob_client.upload_blob(**upload_params)

            # Return file URL
            file_url = blob_client.url
            logger.info(f"✅ File uploaded successfully: {file_name}")
            return file_url

        except AzureError as e:
            logger.error(f"❌ Azure error uploading file: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error uploading file: {str(e)}")
            return None

    async def download_file(
        self,
        file_name: str
    ) -> Optional[bytes]:
        """
        Download file from Azure Blob Storage

        Args:
            file_name: Name of the file to download

        Returns:
            Binary content of the file or None if failed
        """
        try:
            if not self.blob_client:
                logger.error("❌ Blob Storage client not initialized")
                return None

            container_client = self.blob_client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(blob=file_name)

            # Download file
            download_stream = blob_client.download_blob()
            file_content = download_stream.readall()

            logger.info(f"✅ File downloaded successfully: {file_name}")
            return file_content

        except AzureError as e:
            logger.error(f"❌ Azure error downloading file: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error downloading file: {str(e)}")
            return None

    async def delete_file(self, file_name: str) -> bool:
        """
        Delete file from Azure Blob Storage

        Args:
            file_name: Name of the file to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.blob_client:
                logger.error("❌ Blob Storage client not initialized")
                return False

            container_client = self.blob_client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(blob=file_name)

            blob_client.delete_blob()
            logger.info(f"✅ File deleted successfully: {file_name}")
            return True

        except AzureError as e:
            logger.error(f"❌ Azure error deleting file: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error deleting file: {str(e)}")
            return False

    async def get_file_url(self, file_name: str) -> Optional[str]:
        """
        Get the public URL of a file

        Args:
            file_name: Name of the file

        Returns:
            Public URL or None if failed
        """
        try:
            if not self.blob_client:
                logger.error("❌ Blob Storage client not initialized")
                return None

            container_client = self.blob_client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(blob=file_name)

            return blob_client.url

        except Exception as e:
            logger.error(f"❌ Error getting file URL: {str(e)}")
            return None

    async def list_files(self, prefix: str = "") -> list:
        """
        List files in a container with optional prefix

        Args:
            prefix: Optional prefix to filter files (e.g., 'profiles/')

        Returns:
            List of blob names
        """
        try:
            if not self.blob_client:
                logger.error("❌ Blob Storage client not initialized")
                return []

            container_client = self.blob_client.get_container_client(self.container_name)
            blobs = container_client.list_blobs(name_starts_with=prefix)

            file_list = [blob.name for blob in blobs]
            logger.info(f"✅ Listed {len(file_list)} files with prefix '{prefix}'")
            return file_list

        except Exception as e:
            logger.error(f"❌ Error listing files: {str(e)}")
            return []

    async def get_file_size(self, file_name: str) -> Optional[int]:
        """
        Get size of a file in bytes

        Args:
            file_name: Name of the file

        Returns:
            File size in bytes or None if failed
        """
        try:
            if not self.blob_client:
                logger.error("❌ Blob Storage client not initialized")
                return None

            container_client = self.blob_client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(blob=file_name)
            properties = blob_client.get_blob_properties()

            return properties.size

        except Exception as e:
            logger.error(f"❌ Error getting file size: {str(e)}")
            return None
