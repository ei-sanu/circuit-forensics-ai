"""Dedicated Transaction and Financial Ingestion REST Routes."""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from app.core.permissions import get_current_user, require_roles, Role
from app.services.transaction_service import transaction_service

router = APIRouter(prefix="/transactions", tags=["Financial Intelligence & Transactions"])


class CreateTransactionDto(BaseModel):
    transactionId: Optional[str] = None
    caseId: Optional[str] = None
    fromId: str = Field(..., json_schema_extra={"example": "ACC-918237"})
    toId: str = Field(..., json_schema_extra={"example": "ACC-102938"})
    fromType: Optional[str] = Field(default="account", json_schema_extra={"example": "account"})
    toType: Optional[str] = Field(default="account", json_schema_extra={"example": "account"})
    fromAccount: Optional[str] = None
    toAccount: Optional[str] = None
    amount: float = Field(..., json_schema_extra={"example": 450000.0})
    currency: Optional[str] = Field(default="INR")
    channel: Optional[str] = Field(default="NEFT", json_schema_extra={"example": "RTGS"})
    timestamp: Optional[str] = None
    isFlagged: Optional[bool] = False
    flags: Optional[List[str]] = Field(default_factory=list)


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a new financial transaction")
async def create_transaction(
    dto: CreateTransactionDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.ANALYST, Role.POLICE_STATION)),
):
    return await transaction_service.create(dto.model_dump(), user=user)


@router.get("", summary="List financial transactions with multi-field filters")
async def list_transactions(
    caseId: Optional[str] = Query(None, description="Case identifier scope"),
    fromId: Optional[str] = Query(None, description="Sender entity / account identifier"),
    toId: Optional[str] = Query(None, description="Beneficiary entity / account identifier"),
    minAmount: Optional[float] = Query(None, description="Minimum transfer amount"),
    maxAmount: Optional[float] = Query(None, description="Maximum transfer amount"),
    channel: Optional[str] = Query(None, description="Payment rail (e.g. NEFT, RTGS, UPI, HAWALA)"),
    isFlagged: Optional[bool] = Query(None, description="Filter flagged transactions only"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await transaction_service.find_all(
        case_id=caseId,
        from_id=fromId,
        to_id=toId,
        min_amount=minAmount,
        max_amount=maxAmount,
        channel=channel,
        is_flagged=isFlagged,
        limit=limit,
        skip=skip,
    )


@router.get("/stats", summary="Get aggregated financial transaction analytics")
async def get_transaction_stats(
    caseId: Optional[str] = Query(None, description="Case identifier scope"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await transaction_service.get_stats(case_id=caseId)


@router.post("/import", summary="Batch ingest transactions from bank statement CSV/JSON files")
async def import_transactions(
    file: UploadFile = File(...),
    caseId: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.ANALYST, Role.POLICE_STATION)),
):
    file_bytes = await file.read()
    file_name = file.filename or "transactions.csv"
    return await transaction_service.import_batch(
        file_bytes=file_bytes,
        file_name=file_name,
        case_id=caseId,
        user=user,
    )


@router.get("/{transaction_id}", summary="Get detailed profile of a single transaction")
async def get_transaction(
    transaction_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await transaction_service.find_one(transaction_id)
