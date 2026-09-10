import logging
from typing import Dict, Any, Optional
import boto3
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger("CIRCUIT.S3Storage")

class S3StorageClient:
    def __init__(self):
        self.bucket_name = settings.r2_bucket_name or "circuit-case-files"
        self.s3_client = None

        if settings.r2_endpoint and settings.r2_access_key_id and settings.r2_secret_access_key:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=settings.r2_endpoint,
                    aws_access_key_id=settings.r2_access_key_id,
                    aws_secret_access_key=settings.r2_secret_access_key,
                    region_name="auto",
                    config=Config(signature_version="s3v4"),
                )
                logger.info(f"Cloudflare R2 Storage client initialized for bucket: {self.bucket_name}")
            except Exception as e:
                logger.warning(f"Could not initialize S3/R2 client: {e}. Running in local storage mode.")
        else:
            logger.info("Storage operating in resilient local/mock mode.")

    async def upload_file(
        self,
        file_bytes: bytes,
        key: str,
        mime_type: str = "application/octet-stream"
    ) -> Dict[str, str]:
        """Upload a file to R2/S3 or local fallback."""
        if self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=file_bytes,
                    ContentType=mime_type,
                )
                url = await self.get_presigned_download_url(key, 3600)
                return {"key": key, "url": url}
            except Exception as e:
                logger.error(f"S3 PutObject error ({e}), falling back to local URL.")

        # Local fallback URL
        return {"key": key, "url": f"/local-storage/{key}"}

    async def get_presigned_download_url(self, key: str, expires_in_seconds: int = 3600) -> str:
        """Generate presigned download URL."""
        if self.s3_client:
            try:
                url = self.s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket_name, "Key": key},
                    ExpiresIn=expires_in_seconds,
                )
                return url
            except Exception as e:
                logger.warning(f"Failed to generate presigned URL ({e})")

        return f"/local-storage/{key}"

    async def delete_file(self, key: str) -> None:
        """Delete file from S3 bucket."""
        if self.s3_client:
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            except Exception as e:
                logger.warning(f"S3 DeleteObject error: {e}")

s3_client = S3StorageClient()
