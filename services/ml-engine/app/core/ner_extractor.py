"""Rule-based + gazetteer NER pipeline tailored for Indian intelligence documents."""
import re
import uuid
from typing import List, Tuple
from app.schemas.extract import ExtractedEntity, ProposedRelationship

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
    return f"+91{digits[-10:]}" if len(digits) >= 10 else raw


def normalize_vehicle(raw: str) -> str:
    return re.sub(r"[\s-]", "", raw).upper()


def parse_money_value(raw: str) -> float:
    text = raw.lower().replace(",", "").replace("₹", "").replace("rs.", "").replace("rs", "").replace("inr", "").replace("rupees", "").strip()
    multiplier = 1.0
    if "crore" in text:
        multiplier = 10000000.0
        text = text.replace("crore", "").strip()
    elif "lakh" in text:
        multiplier = 100000.0
        text = text.replace("lakh", "").strip()
    elif "million" in text or "m" in text:
        multiplier = 1000000.0
        text = text.replace("million", "").replace("m", "").strip()
    elif "k" in text:
        multiplier = 1000.0
        text = text.replace("k", "").strip()
    try:
        return float(text.strip()) * multiplier
    except ValueError:
        return 0.0


class NERExtractor:
    """Extracts entities and proposes evidential relationships from raw text."""

    def extract(self, text: str) -> Tuple[List[ExtractedEntity], List[ProposedRelationship]]:
        entities: List[ExtractedEntity] = []
        occupied_spans: List[Tuple[int, int]] = []

        def span_overlaps(start: int, end: int) -> bool:
            return any(max(start, os) < min(end, oe) for os, oe in occupied_spans)

        # 1. Phone Numbers
        for m in PHONE_REGEX.finditer(text):
            s, e = m.span()
            if not span_overlaps(s, e):
                raw = m.group(0).strip()
                norm = normalize_phone(raw)
                entities.append(ExtractedEntity(
                    id=f"temp_ph_{uuid.uuid4().hex[:6]}",
                    type="phone",
                    label=norm,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.98,
                    meta={"normalized": norm}
                ))
                occupied_spans.append((s, e))

        # 2. Vehicle Registration Plates
        for m in VEHICLE_REGEX.finditer(text):
            s, e = m.span()
            if not span_overlaps(s, e):
                raw = m.group(0).strip()
                norm = normalize_vehicle(raw)
                entities.append(ExtractedEntity(
                    id=f"temp_v_{uuid.uuid4().hex[:6]}",
                    type="vehicle",
                    label=norm,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.95,
                    meta={"plate": norm}
                ))
                occupied_spans.append((s, e))

        # 3. Monetary Amounts
        for m in MONEY_REGEX.finditer(text):
            s, e = m.span()
            if not span_overlaps(s, e):
                raw = m.group(0).strip()
                val = parse_money_value(raw)
                entities.append(ExtractedEntity(
                    id=f"temp_m_{uuid.uuid4().hex[:6]}",
                    type="money",
                    label=f"{val:,.2f} INR",
                    original_text=raw,
                    span=(s, e),
                    confidence=0.92,
                    meta={"amount": val}
                ))
                occupied_spans.append((s, e))

        # 4. Dates
        for m in DATE_REGEX.finditer(text):
            s, e = m.span()
            if not span_overlaps(s, e):
                raw = m.group(0).strip()
                entities.append(ExtractedEntity(
                    id=f"temp_d_{uuid.uuid4().hex[:6]}",
                    type="date",
                    label=raw,
                    original_text=raw,
                    span=(s, e),
                    confidence=0.88,
                ))
                occupied_spans.append((s, e))

        # 5. Organizations (Regex + Suffix grammars)
        for suffix in ORG_SUFFIXES:
            pattern = re.compile(rf"\b([A-Z][A-Za-z0-9&'\.\s]{{1,30}}\s+{re.escape(suffix)})\b")
            for m in pattern.finditer(text):
                s, e = m.span()
                if not span_overlaps(s, e):
                    raw = m.group(0).strip()
                    entities.append(ExtractedEntity(
                        id=f"temp_o_{uuid.uuid4().hex[:6]}",
                        type="organization",
                        label=raw,
                        original_text=raw,
                        span=(s, e),
                        confidence=0.90,
                    ))
                    occupied_spans.append((s, e))

        # 6. Locations (Gazetteer lookup)
        for loc in COMMON_LOCATIONS:
            pattern = re.compile(rf"\b{re.escape(loc)}\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                s, e = m.span()
                if not span_overlaps(s, e):
                    entities.append(ExtractedEntity(
                        id=f"temp_l_{uuid.uuid4().hex[:6]}",
                        type="location",
                        label=loc,
                        original_text=m.group(0),
                        span=(s, e),
                        confidence=0.89,
                    ))
                    occupied_spans.append((s, e))

        # 7. Persons (Capitalized 2-3 word sequences with title or name heuristics)
        person_pattern = re.compile(r"\b(?:(Mr\.|Mrs\.|Ms\.|Dr\.|Shri|Smt|Inspector|Officer)\s+)?([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15}){1,2})\b")
        for m in person_pattern.finditer(text):
            s, e = m.span()
            if not span_overlaps(s, e):
                raw = m.group(0).strip()
                first_word = raw.split()[0]
                if first_word not in STOPWORDS and len(raw.split()) >= 2:
                    entities.append(ExtractedEntity(
                        id=f"temp_p_{uuid.uuid4().hex[:6]}",
                        type="person",
                        label=raw,
                        original_text=raw,
                        span=(s, e),
                        confidence=0.86,
                    ))
                    occupied_spans.append((s, e))

        # Sort entities by appearance in text
        entities.sort(key=lambda x: x.span[0])

        # 8. Proposed Relationships via Sentence-level co-occurrence and cue verbs
        relationships = self._propose_relationships(text, entities)

        return entities, relationships

    def _propose_relationships(self, text: str, entities: List[ExtractedEntity]) -> List[ProposedRelationship]:
        relationships: List[ProposedRelationship] = []
        sentences = re.split(r"(?<=[.!?\n])\s+", text)

        for sent in sentences:
            # Find entities contained in this sentence
            sent_entities = [e for e in entities if e.original_text in sent]
            if len(sent_entities) < 2:
                continue

            persons = [e for e in sent_entities if e.type == "person"]
            phones = [e for e in sent_entities if e.type == "phone"]
            vehicles = [e for e in sent_entities if e.type == "vehicle"]
            orgs = [e for e in sent_entities if e.type == "organization"]
            moneys = [e for e in sent_entities if e.type == "money"]
            locations = [e for e in sent_entities if e.type == "location"]

            sent_lower = sent.lower()

            # Person <-> Phone (uses_phone / contact)
            for p in persons:
                for ph in phones:
                    relationships.append(ProposedRelationship(
                        source_temp_id=p.id,
                        target_temp_id=ph.id,
                        rel_type="uses_phone",
                        confidence=0.92,
                        evidence_text=sent.strip()
                    ))

            # Person <-> Vehicle (drives_vehicle / registered_owner)
            for p in persons:
                for v in vehicles:
                    rel_name = "registered_owner" if "owner" in sent_lower or "registered" in sent_lower else "drives_vehicle"
                    relationships.append(ProposedRelationship(
                        source_temp_id=p.id,
                        target_temp_id=v.id,
                        rel_type=rel_name,
                        confidence=0.88,
                        evidence_text=sent.strip()
                    ))

            # Person / Org <-> Money / Org (transferred_money)
            if any(cue in sent_lower for cue in ["transfer", "sent", "paid", "remit", "deposited", "hawala"]):
                actors = persons + orgs
                if len(actors) >= 2:
                    amt = moneys[0].meta.get("amount", 0.0) if moneys else 0.0
                    relationships.append(ProposedRelationship(
                        source_temp_id=actors[0].id,
                        target_temp_id=actors[1].id,
                        rel_type="transferred_money",
                        confidence=0.90,
                        evidence_text=sent.strip(),
                        meta={"amount": amt}
                    ))

            # Person <-> Organization (works_for / director_of / associate)
            for p in persons:
                for o in orgs:
                    rel_name = "director_of" if any(k in sent_lower for k in ["director", "owner", "founder", "head"]) else "associated_with"
                    relationships.append(ProposedRelationship(
                        source_temp_id=p.id,
                        target_temp_id=o.id,
                        rel_type=rel_name,
                        confidence=0.85,
                        evidence_text=sent.strip()
                    ))

            # Person <-> Location (seen_at / visited)
            for p in persons:
                for loc in locations:
                    relationships.append(ProposedRelationship(
                        source_temp_id=p.id,
                        target_temp_id=loc.id,
                        rel_type="visited_location",
                        confidence=0.80,
                        evidence_text=sent.strip()
                    ))

        return relationships
