"""Hybrid Rule-based + Gazetteer + Vernacular Contextual NER pipeline tailored for Indian intelligence and law enforcement documents."""
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

# Statutory Indian Government & Financial Identifiers
PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
AADHAAR_REGEX = re.compile(r"\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b")
UPI_REGEX = re.compile(r"\b[a-zA-Z0-9_\.\-]+@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|ibl|upi|axl|apl|barodampay|waaxis)\b", re.IGNORECASE)
IFSC_REGEX = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")
BANK_ACC_REGEX = re.compile(r"\b(?:A\/C|Account|Acc|Khata)[\s#.:-]*([0-9]{9,18})\b", re.IGNORECASE)
LEGAL_SECTION_REGEX = re.compile(
    r"\b(?:(?:u\/s|under\s+section|sec\.?|section)\s+)?((?:IPC|BNS|NDPS|PMLA|UAPA|Arms\s+Act|CrPC)\s*[\d\w\s,/]+(?:\b|\.))\b",
    re.IGNORECASE
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

PERSON_TITLES = {"Mr.", "Mr", "Mrs.", "Mrs", "Ms.", "Ms", "Dr.", "Dr", "Shri", "Smt", "Inspector", "Officer", "Advocate", "Mohd", "Syed"}

INDIAN_SURNAMES = (
    "Rathore|Verma|Malhotra|Singhania|Gounder|Subramanian|Joshi|Kapoor|Yadav|Paswan|"
    "Sharma|Gupta|Khan|Singh|Kumar|Ali|Patel|Reddy|Nair|Rao|Chauhan|Mishra|Bose|Das|Gowda|Bhatt|Kulkarni"
)
INDIAN_SURNAME_REGEX = re.compile(rf"\b([A-Z][a-z]{{2,15}}\s+(?:{INDIAN_SURNAMES}))\b")

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
    """Extracts entities (person, organization, phone, vehicle, location, money, date, pan, aadhaar, upi)
    and infers candidate relationships from raw Hindi/English investigative text."""

    def extract(self, text: str) -> Tuple[List[ExtractedEntity], List[ProposedRelationship]]:
        return self.extract_all(text)

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

        # 4. PAN Cards
        for m in PAN_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0).upper()
                entities.append(ExtractedEntity(
                    id=f"temp_pan_{uuid.uuid4().hex[:6]}",
                    type="pan",
                    label=raw,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.97,
                    meta={"identifier": "PAN"}
                ))
                occupied_spans.append((s, e))

        # 5. Aadhaar Numbers
        for m in AADHAAR_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0).strip()
                entities.append(ExtractedEntity(
                    id=f"temp_aadhaar_{uuid.uuid4().hex[:6]}",
                    type="aadhaar",
                    label=raw,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.95,
                    meta={"identifier": "Aadhaar"}
                ))
                occupied_spans.append((s, e))

        # 6. UPI IDs
        for m in UPI_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0).lower()
                entities.append(ExtractedEntity(
                    id=f"temp_upi_{uuid.uuid4().hex[:6]}",
                    type="upi_id",
                    label=raw,
                    original_text=m.group(0),
                    span=(s, e),
                    confidence=0.96,
                    meta={"payment_rail": "UPI"}
                ))
                occupied_spans.append((s, e))

        # 7. IFSC Codes
        for m in IFSC_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(0).upper()
                entities.append(ExtractedEntity(
                    id=f"temp_ifsc_{uuid.uuid4().hex[:6]}",
                    type="ifsc",
                    label=raw,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.94,
                    meta={"bank_code": raw[:4]}
                ))
                occupied_spans.append((s, e))

        # 7b. Bank Account Numbers
        for m in BANK_ACC_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(1).strip()
                entities.append(ExtractedEntity(
                    id=f"temp_acc_{uuid.uuid4().hex[:6]}",
                    type="account",
                    label=f"ACC-{raw[-6:]}",
                    original_text=m.group(0),
                    span=(s, e),
                    confidence=0.93,
                    meta={"account_number": raw}
                ))
                occupied_spans.append((s, e))

        # 7c. Statutory Legal Sections (IPC/BNS/NDPS/PMLA)
        for m in LEGAL_SECTION_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(1).strip()
                entities.append(ExtractedEntity(
                    id=f"temp_law_{uuid.uuid4().hex[:6]}",
                    type="legal_section",
                    label=raw.upper(),
                    original_text=m.group(0),
                    span=(s, e),
                    confidence=0.96,
                    meta={"statute": raw}
                ))
                occupied_spans.append((s, e))

        # 8. Dates
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

        # 9. Organizations via Known Suffix Gazetteers
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

        # 10. Common Locations
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

        # 11. Person Names (Indian Titles + Capitalized Name Tokens)
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

        # 12. Contextual Indian Names via Surnames
        for m in INDIAN_SURNAME_REGEX.finditer(text):
            s, e = m.span()
            if not is_overlapping(s, e):
                raw = m.group(1).strip()
                first_word = raw.split()[0]
                if first_word not in STOPWORDS:
                    entities.append(ExtractedEntity(
                        id=f"temp_p_{uuid.uuid4().hex[:6]}",
                        type="person",
                        label=raw,
                        original_text=raw,
                        span=(s, e),
                        confidence=0.88,
                        meta={"pattern": "indian_surname"}
                    ))
                    occupied_spans.append((s, e))

        # 13. Generic 2-to-3 Capitalized Words for Person / Target Detection
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

        # Sort entities by appearance
        entities.sort(key=lambda x: x.span[0])

        # Infer Relationships based on proximity and vernacular cues
        relationships = self._infer_relationships(text, entities)

        return entities, relationships

    def _parse_amount(self, snippet: str) -> Tuple[Optional[float], str]:
        """Extract numeric amount and currency from text snippet."""
        m = re.search(r"(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac|k|m)?|\b([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac|rupees)\b", snippet, re.IGNORECASE)
        if m:
            val_str = (m.group(1) or m.group(3)).replace(",", "")
            try:
                val = float(val_str)
                multiplier = m.group(2) or m.group(4)
                if multiplier:
                    mult_lower = multiplier.lower()
                    if "cr" in mult_lower:
                        val *= 10000000.0
                    elif "la" in mult_lower:
                        val *= 100000.0
                    elif "k" in mult_lower:
                        val *= 1000.0
                    elif "m" in mult_lower:
                        val *= 1000000.0
                currency = "USD" if "$" in snippet else "AED" if ("AED" in snippet.upper() or "dirham" in snippet.lower()) else "INR"
                return val, currency
            except ValueError:
                pass
        return None, "INR"

    def _parse_channel(self, snippet: str) -> Optional[str]:
        """Identify communication or financial transfer channel."""
        s_lower = snippet.lower()
        if "rtgs" in s_lower:
            return "RTGS"
        if "neft" in s_lower:
            return "NEFT"
        if any(k in s_lower for k in ["upi", "gpay", "phonepe", "paytm"]):
            return "UPI"
        if any(k in s_lower for k in ["hawala", "hundi", "token"]):
            return "Hawala"
        if "angadiya" in s_lower:
            return "Angadiya Courier"
        if any(k in s_lower for k in ["cash", "nakad"]):
            return "Physical Cash"
        if any(k in s_lower for k in ["voice call", "dialed", "called", "phone call"]):
            return "Voice Call"
        if any(k in s_lower for k in ["sms", "text message"]):
            return "SMS"
        if any(k in s_lower for k in ["whatsapp", "telegram", "signal"]):
            return "Encrypted Messaging"
        return None

    def _infer_relationships(self, text: str, entities: List[ExtractedEntity]) -> List[ProposedRelationship]:
        relationships: List[ProposedRelationship] = []
        if len(entities) < 2:
            return relationships

        # Index date and money entities for nearby association
        date_entities = [e for e in entities if e.type == "date"]
        money_entities = [e for e in entities if e.type == "money"]

        for i in range(len(entities)):
            for j in range(i + 1, min(i + 4, len(entities))):
                e1 = entities[i]
                e2 = entities[j]

                # Only create relationship edges between substantive entity nodes (not date or money)
                if e1.type in ("date", "money") or e2.type in ("date", "money"):
                    continue

                char_dist = e2.span[0] - e1.span[1]
                if char_dist > 220:
                    continue

                snippet_span = (max(0, e1.span[0] - 25), min(len(text), e2.span[1] + 25))
                snippet = text[snippet_span[0]:snippet_span[1]].lower()

                # Infer relationship type with Vernacular Indian support
                rel_type = "associated_with"
                confidence = 0.70

                if any(w in snippet for w in ["call", "called", "spoke", "contact", "phone", "dial", "sampark", "baat"]):
                    rel_type = "communicated_with"
                    confidence = 0.88
                elif any(w in snippet for w in ["transfer", "sent", "paid", "rupees", "inr", "lakh", "crore", "account", "hawala", "diya", "bheja", "angadiya", "khatabook"]):
                    rel_type = "transferred_money_to"
                    confidence = 0.92
                elif any(w in snippet for w in ["launder", "shell company", "cash mule", "layering"]):
                    rel_type = "laundered_money_for"
                    confidence = 0.93
                elif any(w in snippet for w in ["co-accused", "accused along with", "conspirator", "gang member", "accomplice", "shamil"]):
                    rel_type = "co_accused_with"
                    confidence = 0.94
                elif any(w in snippet for w in ["drove", "vehicle", "car", "plate", "owner", "registration", "se aaya", "convoy", "gadi", "scooter", "truck"]):
                    rel_type = "owns"
                    confidence = 0.85
                elif any(w in snippet for w in ["director", "owner", "employee", "works at", "proprietor", "partner", "malik", "sanchalak"]):
                    rel_type = "employed_by"
                    confidence = 0.86
                elif any(w in snippet for w in ["traveled", "fled", "met", "accompanied", "saath"]):
                    rel_type = "traveled_with"
                    confidence = 0.80
                elif any(w in snippet for w in ["shelter", "harbored", "hid", "safehouse", "chhipaya"]):
                    rel_type = "sheltered_by"
                    confidence = 0.87

                # Extract structured edge attributes: amount, currency, channel, date
                meta: Dict[str, Any] = {}
                if rel_type in ("transferred_money_to", "laundered_money_for"):
                    # Check money entities first
                    found_amount = None
                    for m_ent in money_entities:
                        if snippet_span[0] <= m_ent.span[0] <= snippet_span[1] or abs(m_ent.span[0] - e1.span[1]) < 80:
                            amt, curr = self._parse_amount(m_ent.label)
                            if amt is not None:
                                found_amount = (amt, curr)
                                break
                    if not found_amount:
                        found_amount = self._parse_amount(snippet)
                    if found_amount and found_amount[0] is not None:
                        meta["amount"] = found_amount[0]
                        meta["currency"] = found_amount[1]

                    chn = self._parse_channel(snippet)
                    if chn:
                        meta["channel"] = chn
                elif rel_type == "communicated_with":
                    chn = self._parse_channel(snippet)
                    if chn:
                        meta["channel"] = chn

                # Correlate adjacent date entity
                for d_ent in date_entities:
                    if snippet_span[0] <= d_ent.span[0] <= snippet_span[1]:
                        meta["date"] = d_ent.label
                        break

                relationships.append(ProposedRelationship(
                    source_temp_id=e1.id,
                    target_temp_id=e2.id,
                    rel_type=rel_type,
                    confidence=confidence,
                    evidence_text=text[snippet_span[0]:snippet_span[1]].strip(),
                    meta=meta
                ))

        return relationships

