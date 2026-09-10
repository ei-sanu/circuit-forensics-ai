import logging
from typing import Dict, Any, Optional
from app.integrations.ml_client import ml_client
from app.services.audit_service import audit_service

logger = logging.getLogger("CIRCUIT.CopilotService")

class CopilotService:
    async def ask_copilot(self, query: str, case_id: Optional[str] = None, user: Dict[str, Any] = None) -> Dict[str, Any]:
        """Ask AI Copilot natural-language investigative query with evidentiary citations."""
        res = await ml_client.query_copilot(query=query, case_id=case_id)

        if user:
            await audit_service.log(
                user_id=user.get("userId") or "user",
                user_email=user.get("email") or "user@circuit.gov",
                action="COPILOT_QUERY",
                resource_type="copilot",
                resource_id=case_id or "global",
                details={"query": query, "confidence": res.get("confidence")},
            )

        return res

copilot_service = CopilotService()
