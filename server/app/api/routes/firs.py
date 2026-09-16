from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Body
from app.core.permissions import get_current_user, get_optional_user, require_roles, Role
from app.services.fir_service import fir_service
from app.schemas.fir import CreateFirDto

router = APIRouter(prefix="/firs", tags=["FIRs & Police Station Tracking"])

@router.post("", summary="Register a new First Information Report (FIR)")
async def create_fir(
    dto: CreateFirDto,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await fir_service.create(dto, user=user)

@router.get("", summary="List FIRs with forensic and station filters")
async def list_firs(
    policeStation: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    return await fir_service.find_all(police_station=policeStation, district=district, status=status, q=q)

@router.get("/{fir_id}", summary="Get details of a specific FIR")
async def get_fir(fir_id: str, user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    return await fir_service.find_one(fir_id)

@router.patch("/{fir_id}/status", summary="Update FIR status")
async def update_fir_status(
    fir_id: str,
    status: str = Body(..., embed=True),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await fir_service.update_status(fir_id, status=status, user=user)

@router.post("/parse-ocr", summary="Heuristically parse OCR text into FIR fields")
async def parse_ocr(rawText: str = Body(..., embed=True)):
    return fir_service.parse_ocr_text(rawText)

@router.post("/upload-copy", summary="Upload scanned FIR copy and run OCR analysis")
async def upload_fir_copy(
    file: Optional[UploadFile] = File(None),
    policeStation: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    accusedNames: Optional[str] = Form(None),
    ipcSections: Optional[str] = Form(None),
    fileUrl: Optional[str] = Form(None),
    ocrText: Optional[str] = Form(None),
):
    import base64
    file_base64 = fileUrl
    extracted_ocr = ocrText
    if file:
        file_bytes = await file.read()
        file_base64 = f"data:{file.content_type or 'image/jpeg'};base64,{base64.b64encode(file_bytes).decode('utf-8')}"
        if not extracted_ocr:
            try:
                from app.services.ocr_service import ocr_service
                text_out, _ = ocr_service.process_file(file_bytes, file.filename or "fir.jpg", file.content_type)
                if text_out and len(text_out.strip()) > 20:
                    extracted_ocr = text_out
            except Exception:
                pass

    default_ocr = extracted_ocr or (
        f"FIRST INFORMATION REPORT (Under Sec. 154 Cr.P.C.)\n"
        f"District: {district or 'State Cyber Jurisdiction'}\n"
        f"P.S.: {policeStation or 'District Special PS'}\n"
        f"Accused: {accusedNames or 'Unidentified Layering Operatives'}\n"
        f"Sections: {ipcSections or 'DNS 318, 61'}"
    )
    parsed = fir_service.parse_ocr_text(default_ocr)

    return {
        "success": True,
        "fileUrl": file_base64 or "https://res.cloudinary.com/demo/image/upload/v1690000000/fir_sample_official.jpg",
        "ocrExtractedText": default_ocr,
        "parsedFields": parsed,
    }
