from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field

from app.core.permissions import get_current_user, require_roles, Role
from app.services.vehicle_service import vehicle_service

router = APIRouter(prefix="/vehicles", tags=["Vehicles & ANPR Tracking"])

class CreateVehicleDto(BaseModel):
    plateNumber: str = Field(..., example="MH-01-EA-9021")
    makeModel: str = Field(..., example="Toyota Fortuner Legender")
    vehicleType: str = Field(default="suv", example="suv")
    ownerName: Optional[str] = Field(default="Unknown", example="Vikram Rathore")
    ownerDesignation: Optional[str] = Field(default="Suspect", example="Primary Syndicate Coordinator")
    riskFlag: bool = Field(default=True)
    chassisNumber: Optional[str] = None
    fastagId: Optional[str] = None
    cases: Optional[List[str]] = Field(default_factory=list)
    lastSeenLocation: Optional[str] = None

class ScanPlateDto(BaseModel):
    plateNumber: str = Field(..., example="MH-01-EA-9021")

@router.get("", summary="List all intelligence vehicles with RTO and risk filtering")
async def list_vehicles(
    q: Optional[str] = Query(None, description="Search plate, owner, chassis or model"),
    type: Optional[str] = Query(None, description="Filter by vehicle type"),
    flagged: Optional[bool] = Query(None, description="Filter only risk flagged vehicles"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await vehicle_service.find_all(q=q, type=type, flagged=flagged, limit=limit, skip=skip)

@router.post("", status_code=status.HTTP_201_CREATED, summary="Register a vehicle in the intelligence database")
async def create_vehicle(
    dto: CreateVehicleDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION))
):
    return await vehicle_service.create(dto.model_dump(), user=user)

@router.post("/scan-plate", summary="Real-time ANPR Number Plate Triage against BNS FIRs & Warrants")
async def scan_plate(
    dto: ScanPlateDto,
    user: Dict[str, Any] = Depends(get_current_user)
):
    return await vehicle_service.scan_plate(dto.plateNumber)

@router.get("/{vehicle_id}", summary="Get vehicle details, toll plaza sightings, and fastag trail")
async def get_vehicle(vehicle_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    v = await vehicle_service.find_one(vehicle_id)
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vehicle {vehicle_id} not found in database")
    return v
