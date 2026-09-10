"""Entity resolution API endpoint."""
from fastapi import APIRouter, Depends
from app.core.resolver import EntityResolver
from app.schemas.resolve import ResolveRequest, ResolveResponse
from app.security import verify_service_key

router = APIRouter(prefix="/ml", tags=["Resolution"])
resolver = EntityResolver()


@router.post("/resolve", response_model=ResolveResponse, dependencies=[Depends(verify_service_key)])
async def resolve_entity(req: ResolveRequest) -> ResolveResponse:
    """Fuzzy matches and deduplicates target entities against existing canonical records."""
    match_result = resolver.resolve(
        target=req.target,
        candidates=req.candidates,
        threshold=req.threshold
    )
    return ResolveResponse(result=match_result)
