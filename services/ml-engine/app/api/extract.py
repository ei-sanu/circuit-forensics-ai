"""NER extraction API endpoint."""
import time
from fastapi import APIRouter, Depends
from app.core.ner_extractor import NERExtractor
from app.schemas.extract import ExtractRequest, ExtractResponse
from app.security import verify_service_key

router = APIRouter(prefix="/ml", tags=["Extraction"])
extractor = NERExtractor()


@router.post("/extract", response_model=ExtractResponse, dependencies=[Depends(verify_service_key)])
async def extract_entities(req: ExtractRequest) -> ExtractResponse:
    """Extracts entities (Indian phones, vehicle plates, persons, orgs, money, dates) and proposed relations."""
    start_time = time.perf_counter()
    entities, proposed_relations = extractor.extract(req.text)
    duration_ms = (time.perf_counter() - start_time) * 1000.0

    return ExtractResponse(
        document_id=req.document_id,
        entities=entities,
        proposed_relationships=proposed_relations,
        execution_time_ms=round(duration_ms, 2)
    )
