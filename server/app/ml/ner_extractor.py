"""Rule-based + gazetteer NER pipeline tailored for Indian intelligence documents."""
import re
import uuid
from typing import List, Tuple
from app.ml.schemas import ExtractedEntity, ProposedRelationship

# Indian State & UT RTO Prefix Codes
INDIAN_STATE_CODES = (
    "AN|AP|AR|AS|BR|CG|CH|DD|DL|DN|GA|GJ|HP|HR|JH|JK|KA|KL|LA|LD|MH|ML|MN|MP|MZ|NL|OD|PB|PY|RJ|SK|TN|TR|TS|UK|UP|WB"
)

# Vehicle Plate Regex (e.g. DL01AB1234, MH-12-DE-5678, HR 26 DQ 5555)
VEHICLE_REGEX = re.compile(
    rf"\b({INDIAN_STATE_CODES})[\s-]?[0-9]{{1,2}}[\s-]?[A-Z]{{1,3}}[\s-]?[0-9]{{3,4}}\b",
    re.IGNORECASE,
)

# Indian Phone Numbers (+91 98765 43210, +91-9876543210, 09876543210, 9876543210)
PHONE_REGEX = re.compile(
    r"(?:\+91[\s\-]?)?(?:0)?[6-9]\d{4}[\s\-]?\d{5}\b"
)

# Monetary Amounts (₹ 5,00,000, Rs. 50000, 50 lakh, 2 crore, 400000 INR)
MONEY_REGEX = re.compile(
    r"(?:(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lakh|crore|k|m|million))?|\b\d+(?:,\d+)*(?:\.\d+)?\s*(?:lakh|crore|INR|rupees)\b)",
    re.IGNORECASE,
)

# Dates (12-08-2025, 2025/08/12, 12th Aug 2025)
DATE_REGEX = re.compile(
    r"\b(?:\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b",
    re.IGNORECASE,
)

ORG_SUFFIXES = [
    "Logistics", "Enterprises", "Pvt Ltd", "Private Limited", "Limited", "LLC", "Holdings",
    "Trading", "Imports", "Exports", "Industries", "Finance", "Financiers", "Consultancy",
    "Solutions", "Agency", "Corporation", "Infra", "Transport", "Traders", "Builders"
]

COMMON_LOCATIONS = {
    "Delhi", "Mumbai", "Bangalore", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune",
    "Ahmedabad", "Jaipur", "Lucknow", "Patna", "Chandigarh", "Indore", "Bhopal", "Nagpur",
    "Surat", "Varanasi", "Noida", "Gurgaon", "Gurugram", "Faridabad", "Ghaziabad", "Navi Mumbai",
    "Thane", "Howrah", "Visakhapatnam", "Kochi", "Coimbatore", "Ludhiana", "Agra", "Nashik",
    "Dubai", "Singapore", "Kathmandu", "Dhaka", "Colombo", "Bangkok"
}

PERSON_TITLES = {"Mr.", "Mr", "Mrs.", "Mrs", "Ms.", "Ms", "Dr.", "Dr", "Shri", "Smt", "Inspector", "Officer", "Advocate"}
STOPWORDS = {
    "The", "This", "That", "These", "Those", "Case", "FIR", "Report", "Court", "Police", "Station",
    "Subject", "Target", "Suspect", "Witness", "Source", "Date", "Time", "Amount", "Phone", "Vehicle"
}


def normalize_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("91") and len(digits) == 12:
        return f"+{digits}"
    if len(digits) == 10:
        return f"+91{digits}"
    if digits.startswith("0") and len(digits) == 11:
        return f"+91{digits[1:]}"
    return f"+91{digits[-10:]}" if len(digits) >= 10 else f"+{digits}"


def normalize_vehicle(raw: str) -> str:
    return re.sub(r"[\s-]", "", raw).upper()


class NERExtractor:
    """Extracts entities (person, organization, phone, vehicle, location, money, date)
    and infers candidate relationships from raw Hindi/English investigative text."""

    def extract_all(self, text: str) -> Tuple[List[ExtractedEntity], List[ProposedRelationship]]:
        entities: List[ExtractedEntity] = []
        occupied_spans: List[Tuple[int, int]] = []

        def is_overlapping(start: int, end: int) -> bool:
            for s, e in occupied_spans:
                if not (end <= s or start >= e):
                    return True
            return False

        # 1. Phone Numbers
        for m in PHONE_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0)
                entities.append(ExtractedEntity(
                    id=f"temp_phone_{uuid.uuid4().hex[:6]}",
                    type="phone",
                    label=normalize_phone(raw),
                    original_text=raw,
                    span=(s, e),
                    confidence=0.98,
                    meta={"normalized": normalize_phone(raw)}
                ))
                occupied_spans.append((s, e))

        # 2. Vehicle License Plates
        for m in VEHICLE_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0)
                entities.append(ExtractedEntity(
                    id=f"temp_veh_{uuid.uuid4().hex[:6]}",
                    type="vehicle",
                    label=normalize_vehicle(raw),
                    original_text=raw,
                    span=(s, e),
                    confidence=0.95,
                    meta={"normalized": normalize_vehicle(raw)}
                ))
                occupied_spans.append((s, e))

        # 3. Monetary Amounts
        for m in MONEY_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0)
                entities.append(ExtractedEntity(
                    id=f"temp_money_{uuid.uuid4().hex[:6]}",
                    type="money",
                    label=raw.strip(),
                    original_text=raw,
                    span=(s, e),
                    confidence=0.92,
                    meta={"raw": raw.strip()}
                ))
                occupied_spans.append((s, e))

        # 4. Dates
        for m in DATE_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0)
                entities.append(ExtractedEntity(
                    id=f"temp_date_{uuid.uuid4().hex[:6]}",
                    type="date",
                    label=raw.strip(),
                    original_text=raw,
                    span=(s, e),
                    confidence=0.90,
                    meta={"raw": raw.strip()}
                ))
                occupied_spans.append((s, e))

        # 5. Organizations via Known Suffix Gazetteers
        for suffix in ORG_SUFFIXES:
            pattern = re.compile(rf"\b([A-Z][A-Za-z0-9&'\.\s]{{1,35}}\s+{re.escape(suffix)})\b")
            for m in pattern.finditer(text):
                s, e = m.span()
                if not is_overlapping(s, e):
                    raw = m.group(1).strip()
                    entities.append(ExtractedEntity(
                        id=f"temp_org_{uuid.uuid4().hex[:6]}",
                        type="organization",
                        label=raw,
                        original_text=raw,
                        span=(s, e),
                        confidence=0.88,
                        meta={"suffix": suffix}
                    ))
                    occupied_spans.append((s, e))

        # 6. Common Locations
        for loc in COMMON_LOCATIONS:
            pattern = re.compile(rf"\b{re.escape(loc)}\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                s, e = m.span()
                if not is_overlapping(s, e):
                    raw = m.group(0)
                    entities.append(ExtractedEntity(
                        id=f"temp_loc_{uuid.uuid4().hex[:6]}",
                        type="location",
                        label=loc,
                        original_text=raw,
                        span=(s, e),
                        confidence=0.94,
                        meta={"city": loc}
                    ))
                    occupied_spans.append((s, e))

        # 7. Person Names (Pattern-based: Titles + Capitalized Name Tokens)
        title_pattern = re.compile(
            r"\b(" + "|".join(re.escape(t) for t in PERSON_TITLES) + r")\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b"
        )
        for m in title_pattern.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                name = m.group(2).strip()
                entities.append(ExtractedEntity(
                    id=f"temp_p_{uuid.uuid4().hex[:6]}",
                    type="person",
                    label=name,
                    original_text=m.group(0),
                    span=(s, e),
                    confidence=0.91,
                    meta={"title": m.group(1)}
                ))
                occupied_spans.append((s, e))

        # Generic 2-to-3 Capitalized Words for Person / High-Value Target Detection
        cap_pattern = re.compile(r"\b([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15}){1,2})\b")
        for m in cap_pattern.finditer(text):
            s, e = m.span()
            raw = m.group(1).strip()
            first_word = raw.split()[0]
            if not is_overlapping(s, e) and first_word not in STOPWORDS and raw not in COMMON_LOCATIONS:
                entities.append(ExtractedEntity(
                    id=f"temp_p_{uuid.uuid4().hex[:6]}",
                    type="person",
                    label=raw,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.76,
                    meta={"inferred": True}
                ))
                occupied_spans.append((s, e))

        # Sort entities by start span
        entities.sort(key=lambda x: x.span[0])

        # Infer Relationships based on proximity and sentence co-occurrence
        relationships = self._infer_relationships(text, entities)

        return entities, relationships

    def _infer_relationships(self, text: str, entities: List[ExtractedEntity]) -> List[ProposedRelationship]:
        relationships: List[ProposedRelationship] = []
        if len(entities) < 2:
            return relationships

        # Co-occurrence in sentence window (max 150 chars apart)
        for i in range(len(entities)):
            for j in range(i + 1, min(i + 4, len(entities))):
                e1 = entities[i]
                e2 = entities[j]

                char_dist = e2.span[0] - e1.span[1]
                if char_dist > 150:
                    continue

                snippet = text[e1.span[0]:e2.span[1]].lower()

                # Infer relationship type
                rel_type = "associated_with"
                confidence = 0.70

                if any(w in snippet for w in ["call", "called", "spoke", "contact", "phone", "dial"]):
                    rel_type = "communicated_with"
                    confidence = 0.88
                elif any(w in snippet for w in ["transfer", "sent", "paid", "rupees", "inr", "lakh", "crore", "account"]):
                    rel_type = "transferred_money_to"
                    confidence = 0.90
                elif any(w in snippet for w in ["drove", "vehicle", "car", "plate", "owner", "registration"]):
                    rel_type = "owns"
                    confidence = 0.85
                elif any(w in snippet for w in ["director", "owner", "employee", "works at", "proprietor", "partner"]):
                    rel_type = "employed_by"
                    confidence = 0.86
                elif any(w in snippet for w in ["traveled", "fled", "met", "accompanied"]):
                    rel_type = "traveled_with"
                    confidence = 0.80

                relationships.append(ProposedRelationship(
                    source_temp_id=e1.id,
                    target_temp_id=e2.id,
                    rel_type=rel_type,
                    confidence=confidence,
                    evidence_text=text[max(0, e1.span[0] - 20):min(len(text), e2.span[1] + 20)].strip()
                ))

        return relationships
